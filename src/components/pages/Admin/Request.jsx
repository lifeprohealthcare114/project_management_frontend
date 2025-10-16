import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Card,
  CardContent,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Visibility,
  Delete,
  Search,
  AssignmentTurnedIn,
  GridView,
  TableRows,
  Pending,
  CheckCircle,
  Cancel,
  ExpandMore,
  RestartAlt,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  getRequests,
  updateRequestStatus,
  deleteRequest,
  getProjects,
} from '../../../api/api';
import isBetween from 'dayjs/plugin/isBetween'; // ✅ Import plugin

dayjs.extend(isBetween);

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterProject, setFilterProject] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [monthYear, setMonthYear] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: '', request: null });
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const isSmallScreen = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    fetchRequests();
    fetchProjects();
    const ws = new WebSocket('ws://localhost:8080/ws/requests');
    ws.onmessage = () => fetchRequests();
    ws.onerror = () => {
      // optional: handle ws errors gracefully
      // console.warn('WebSocket error for requests');
    };
    return () => ws.close();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getRequests();
      setRequests(res.data || []);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load data';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  };

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () =>
    setSnackbar({ ...snackbar, open: false });

  const handleConfirm = (action, request) =>
    setConfirmDialog({ open: true, action, request });
  const closeConfirmDialog = () =>
    setConfirmDialog({ open: false, action: '', request: null });

  const handleRequestAction = async () => {
    const { action, request } = confirmDialog;
    if (!request) return;
    closeConfirmDialog();
    try {
      if (action === 'delete') {
        await deleteRequest(request.id);
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
        showSnackbar('Request deleted successfully');
      } else {
        const userId = localStorage.getItem('userId');
        const res = await updateRequestStatus(
          request.id,
          action,
          userId ? parseInt(userId) : null
        );
        if (res && res.data) {
          setRequests((prev) =>
            prev.map((req) => (req.id === request.id ? res.data : req))
          );
          showSnackbar(`Request ${action.toLowerCase()} successfully`);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Action failed';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return <CheckCircle fontSize="small" />;
      case 'rejected':
        return <Cancel fontSize="small" />;
      case 'pending':
        return <Pending fontSize="small" />;
      default:
        return null;
    }
  };

  const tabStatus = ['All', 'Pending', 'Approved', 'Rejected'][tabValue];

  // Keep monthYearCounts logic from original file
  const monthYearCounts = useMemo(() => {
    if (!monthYear) return null;
    const monthStart = dayjs(monthYear).startOf('month');
    const monthEnd = dayjs(monthYear).endOf('month');
    const monthlyRequests = requests.filter((req) => {
      const date = req.requestDate || req.createdAt;
      return dayjs(date).isBetween(monthStart, monthEnd, null, '[]');
    });
    return {
      total: monthlyRequests.length,
      pending: monthlyRequests.filter((r) => r.status?.toLowerCase() === 'pending').length,
      approved: monthlyRequests.filter((r) => r.status?.toLowerCase() === 'approved').length,
      rejected: monthlyRequests.filter((r) => r.status?.toLowerCase() === 'rejected').length,
    };
  }, [requests, monthYear]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Support both nested objects and flat backend fields
      const empName = (req.employee?.name) ? req.employee.name.toLowerCase() : (req.employeeName ? String(req.employeeName).toLowerCase() : '');
      const projName = (req.project?.name) ? req.project.name.toLowerCase() : (req.projectName ? String(req.projectName).toLowerCase() : '');
      const equipment = req.equipment ? String(req.equipment).toLowerCase() : '';
      const reason = req.reason ? String(req.reason).toLowerCase() : '';
      const query = searchQuery.toLowerCase();

      const date = req.requestDate || req.createdAt;

      // Month-Year filter (keeps original behavior)
      let matchesMonthYear = true;
      if (monthYear) {
        const monthStart = dayjs(monthYear).startOf('month');
        const monthEnd = dayjs(monthYear).endOf('month');
        matchesMonthYear = dayjs(date).isBetween(monthStart, monthEnd, null, '[]');
      }

      const matchesQuery =
        empName.includes(query) ||
        projName.includes(query) ||
        equipment.includes(query) ||
        reason.includes(query);

      const matchesStatus =
        (tabStatus === 'All' || (req.status?.toLowerCase() === tabStatus.toLowerCase())) &&
        (filterStatus === 'All' || (req.status?.toLowerCase() === filterStatus.toLowerCase()));

      const matchesProject =
        !filterProject ||
        (req.project?.id === parseInt(filterProject)) ||
        (req.projectId === parseInt(filterProject));

      const matchesDate =
        (!dateRange.from || dayjs(date).isAfter(dayjs(dateRange.from).subtract(1, 'day'))) &&
        (!dateRange.to || dayjs(date).isBefore(dayjs(dateRange.to).add(1, 'day')));

      return matchesQuery && matchesStatus && matchesProject && matchesDate && matchesMonthYear;
    });
  }, [requests, searchQuery, filterStatus, filterProject, dateRange, tabStatus, monthYear]);

  const counts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.status?.toLowerCase() === 'pending').length,
    approved: requests.filter((r) => r.status?.toLowerCase() === 'approved').length,
    rejected: requests.filter((r) => r.status?.toLowerCase() === 'rejected').length,
  }), [requests]);

  const paginatedRequests = filteredRequests.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterProject('');
    setDateRange({ from: '', to: '' });
    setMonthYear('');
    setPage(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography variant="h6">Loading requests...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight="600" color="primary.main">
          Equipment Requests
        </Typography>
        {!isSmallScreen && (
          <IconButton color="primary" onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}>
            {viewMode === 'table' ? <GridView /> : <TableRows />}
          </IconButton>
        )}
      </Stack>

      {/* Summary Dashboard (kept original monthYear conditional) */}
      <Box position="sticky" top={0} zIndex={99} bgcolor="background.paper" py={1} mb={2}>
        <Grid container spacing={2} alignItems="center">
          {monthYear && monthYearCounts ? (
            <>
              <Grid item xs={12} sm={12} md={2}>
                <Card sx={{ borderLeft: '4px solid #1976d2', boxShadow: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                      Overview for {dayjs(monthYear).format('MMMM YYYY')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Card sx={{ borderLeft: '4px solid #1976d2', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AssignmentTurnedIn color="primary" />
                      <Typography variant="subtitle1" fontWeight="600">Total: {monthYearCounts.total}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Card sx={{ borderLeft: '4px solid #ff9800', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Pending color="warning" />
                      <Typography variant="subtitle1" fontWeight="600">Pending: {monthYearCounts.pending}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Card sx={{ borderLeft: '4px solid #4caf50', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircle color="success" />
                      <Typography variant="subtitle1" fontWeight="600">Approved: {monthYearCounts.approved}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Card sx={{ borderLeft: '4px solid #f44336', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Cancel color="error" />
                      <Typography variant="subtitle1" fontWeight="600">Rejected: {monthYearCounts.rejected}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="outlined" size="small" onClick={() => setMonthYear('')}>
                  Clear Month Filter
                </Button>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderLeft: '4px solid #1976d2', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AssignmentTurnedIn color="primary" />
                      <Typography variant="subtitle1" fontWeight="600">Total: {counts.total}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderLeft: '4px solid #ff9800', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Pending color="warning" />
                      <Typography variant="subtitle1" fontWeight="600">Pending: {counts.pending}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderLeft: '4px solid #4caf50', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircle color="success" />
                      <Typography variant="subtitle1" fontWeight="600">Approved: {counts.approved}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ borderLeft: '4px solid #f44336', boxShadow: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Cancel color="error" />
                      <Typography variant="subtitle1" fontWeight="600">Rejected: {counts.rejected}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Month-Year Picker */}
          <Grid item xs={12} sm={4} md={3} sx={{ mt: 1 }}>
            <TextField
              label="Filter by Month"
              type="month"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={monthYear}
              onChange={(e) => {
                setMonthYear(e.target.value);
                setPage(1);
              }}
              helperText="Select month and year to filter requests"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search"
          size="small"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{ startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} /> }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            label="Status"
          >
            {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Project</InputLabel>
          <Select
            value={filterProject}
            onChange={(e) => {
              setFilterProject(e.target.value);
              setPage(1);
            }}
            label="Project"
          >
            <MenuItem value="">All Projects</MenuItem>
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          type="date"
          label="From"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateRange.from}
          onChange={(e) => {
            setDateRange({ ...dateRange, from: e.target.value });
            setPage(1);
          }}
        />
        <TextField
          type="date"
          label="To"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateRange.to}
          onChange={(e) => {
            setDateRange({ ...dateRange, to: e.target.value });
            setPage(1);
          }}
        />
        <Button
          startIcon={<RestartAlt />}
          variant="outlined"
          onClick={clearFilters}
          sx={{ height: 40 }}
        >
          Clear Filters
        </Button>
      </Paper>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => { setTabValue(v); setPage(1); }} sx={{ mb: 2 }}>
        <Tab label="All" />
        <Tab label="Pending" />
        <Tab label="Approved" />
        <Tab label="Rejected" />
      </Tabs>

      {/* Table / Card View */}
      {filteredRequests.length === 0 ? (
        <Box textAlign="center" py={6}>
          <AssignmentTurnedIn sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No matching requests found
          </Typography>
        </Box>
      ) : !isSmallScreen && viewMode === 'table' ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {['Requested Date', 'Responded Date', 'Employee', 'Project', 'Responded By', 'Equipment', 'Qty', 'Reason', 'Status', 'Actions'].map((head) => (
                  <TableCell key={head}><strong>{head}</strong></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRequests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.requestDate || req.createdAt}</TableCell>
                  <TableCell>{(req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'rejected') ? (req.respondedAt || '-') : '-'}</TableCell>

                  {/* Employee: show name and id (supports both shapes) */}
                  <TableCell>
                    {req.employee?.name || req.employeeName || 'N/A'}
                    {' '}

                  </TableCell>

                  {/* Project: show name and id */}
                  <TableCell>
                    {req.project?.name || req.projectName || 'N/A'}
                    {' '}

                  </TableCell>

                  {/* Responded By (styled) */}
                  <TableCell>
                    {req.responderName || req.responder?.name || '-'}
                    {' '}
                  </TableCell>

                  <TableCell>{req.equipment}</TableCell>
                  <TableCell>{req.quantity}</TableCell>
                  <TableCell>{req.reason || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(req.status)}
                      label={req.status}
                      size="small"
                      color={getStatusColor(req.status)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton color="info" size="small" onClick={() => setSelectedRequest(req)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                      {req.status?.toLowerCase() === 'pending' && (
                        <>
                          <IconButton color="success" size="small" onClick={() => handleConfirm('Approved', req)}>
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <IconButton color="error" size="small" onClick={() => handleConfirm('Rejected', req)}>
                            <ThumbDown fontSize="small" />
                          </IconButton>
                        </>
                      )}
                      <IconButton color="error" size="small" onClick={() => handleConfirm('delete', req)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" py={2}>
            <Pagination
              count={Math.ceil(filteredRequests.length / itemsPerPage)}
              page={page}
              onChange={(e, val) => setPage(val)}
              color="primary"
            />
          </Box>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {paginatedRequests.map((req) => (
            <Grid item xs={12} key={req.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" width="100%">
                    <Typography fontWeight={600}>{req.equipment}</Typography>
                    <Chip
                      icon={getStatusIcon(req.status)}
                      label={req.status}
                      size="small"
                      color={getStatusColor(req.status)}
                      variant="outlined"
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    <Typography><strong>Requested Date:</strong> {req.requestDate || req.createdAt}</Typography>
                    {(req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'rejected') && (
                      <Typography><strong>Responded Date:</strong> {req.respondedAt || '-'}</Typography>
                    )}
                    <Typography>
                      <strong>Employee:</strong> {req.employee?.name || req.employeeName || 'N/A'}
                      {' '}

                    </Typography>
                    <Typography>
                      <strong>Project:</strong> {req.project?.name || req.projectName || 'N/A'}
                      {' '}

                    </Typography>
                    <Typography>
                      <strong>Approved By:</strong> {req.responderName || req.responder?.name || 'N/A'}
                      {' '}

                    </Typography>
                    <Typography><strong>Equipment:</strong> {req.equipment}</Typography>
                    <Typography><strong>Quantity:</strong> {req.quantity}</Typography>
                    <Typography><strong>Reason:</strong> {req.reason || '-'}</Typography>
                    <Typography><strong>Status:</strong> {req.status}</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <IconButton color="info" onClick={() => setSelectedRequest(req)}>
                        <Visibility />
                      </IconButton>
                      {req.status?.toLowerCase() === 'pending' && (
                        <>
                          <IconButton color="success" onClick={() => handleConfirm('Approved', req)}>
                            <ThumbUp />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleConfirm('Rejected', req)}>
                            <ThumbDown />
                          </IconButton>
                        </>
                      )}
                      <IconButton color="error" onClick={() => handleConfirm('delete', req)}>
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedRequest} onClose={() => setSelectedRequest(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Card variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">Requested Date</Typography>
                <Typography variant="body1">{selectedRequest.requestDate || selectedRequest.createdAt}</Typography>

                {(selectedRequest.status?.toLowerCase() === 'approved' || selectedRequest.status?.toLowerCase() === 'rejected') && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">Responded Date</Typography>
                    <Typography variant="body1">{selectedRequest.respondedAt || '-'}</Typography>
                  </>
                )}

                <Typography variant="subtitle2" color="text.secondary">Employee</Typography>
                <Typography variant="body1">
                  {selectedRequest.employee?.name || selectedRequest.employeeName || 'N/A'}
                  {' '}

                </Typography>

                <Typography variant="subtitle2" color="text.secondary">Project</Typography>
                <Typography variant="body1">
                  {selectedRequest.project?.name || selectedRequest.projectName || 'N/A'}
                  {' '}

                </Typography>

                <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
                <Typography variant="body1">
                  {selectedRequest.responderName || selectedRequest.responder?.name || 'N/A'}
                  {' '}
                 
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">Equipment</Typography>
                <Typography variant="body1">{selectedRequest.equipment}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
                <Typography variant="body1">{selectedRequest.quantity}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                <Typography variant="body1">{selectedRequest.reason || '-'}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedRequest.status}
                  color={getStatusColor(selectedRequest.status)}
                  icon={getStatusIcon(selectedRequest.status)}
                  size="small"
                />
              </Stack>
            </Card>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRequest(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {confirmDialog.action.toLowerCase()} this request?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button onClick={handleRequestAction} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Requests;
