import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Card,
  CardContent,
  Stack,
  Divider,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  LinearProgress
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Cancel,
  Pending,
  Assignment,
  ThumbUp,
  ThumbDown,
  Visibility,
  Close,
  Delete
} from '@mui/icons-material';

import { 
  getRequests, 
  getEmployees, 
  getProjects, 
  createRequest, 
  updateRequestStatus,
  deleteRequest 
} from '../../../api/api';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [requestForm, setRequestForm] = useState({
    employeeId: '',
    projectId: '',
    equipment: '',
    quantity: '',
    reason: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { requestId, newStatus }

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  // Request details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [reqRes, empRes, projRes] = await Promise.all([
        getRequests(),
        getEmployees(),
        getProjects()
      ]);
      setRequests(reqRes.data || []);
      setEmployees(empRes.data || []);
      setProjects(projRes.data || []);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to load data';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const newRequestData = {
        employeeId: parseInt(requestForm.employeeId),
        projectId: parseInt(requestForm.projectId),
        equipment: requestForm.equipment,
        quantity: parseInt(requestForm.quantity),
        reason: requestForm.reason,
        status: 'Pending',
        requestedBy: userId ? parseInt(userId) : null
      };
      
      const res = await createRequest(newRequestData);
      setRequests(prev => [...prev, res.data]);
      setRequestForm({
        employeeId: '',
        projectId: '',
        equipment: '',
        quantity: '',
        reason: ''
      });
      showSnackbar('Request submitted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit request';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
      console.error('Error creating request:', err);
    }
  };

  const handleRequestStatusUpdate = async (requestId, newStatus) => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await updateRequestStatus(requestId, newStatus, userId ? parseInt(userId) : null);
      
      if (res && res.data) {
        setRequests(prev =>
          prev.map(req => (req.id === requestId ? res.data : req))
        );
        showSnackbar(`Request ${newStatus.toLowerCase()} successfully`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update request status';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
      console.error('Error updating request:', err);
    }
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    
    try {
      await deleteRequest(requestToDelete.id);
      setRequests(prev => prev.filter(req => req.id !== requestToDelete.id));
      showSnackbar('Request deleted successfully');
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete request';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
      console.error('Error deleting request:', err);
    }
  };

  // Opens the confirmation dialog before updating status
  const openConfirmDialog = (requestId, newStatus) => {
    setConfirmAction({ requestId, newStatus });
    setConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  const confirmStatusChange = () => {
    if (confirmAction) {
      handleRequestStatusUpdate(confirmAction.requestId, confirmAction.newStatus);
    }
    closeConfirmDialog();
  };

  // Opens delete confirmation dialog
  const openDeleteDialog = (request) => {
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  // Opens request details modal
  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
    setDetailsModalOpen(false);
  };

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
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

  const stats = [
    {
      title: 'Total Requests',
      value: requests.length,
      icon: <Assignment />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Pending',
      value: requests.filter(r => r.status?.toLowerCase() === 'pending').length,
      icon: <Pending />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Approved',
      value: requests.filter(r => r.status?.toLowerCase() === 'approved').length,
      icon: <CheckCircle />,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Rejected',
      value: requests.filter(r => r.status?.toLowerCase() === 'rejected').length,
      icon: <Cancel />,
      color: '#d32f2f',
      bgColor: '#ffebee'
    }
  ];

  const filteredRequests = tabValue === 0
    ? requests
    : tabValue === 1
      ? requests.filter(r => r.status?.toLowerCase() === 'pending')
      : tabValue === 2
        ? requests.filter(r => r.status?.toLowerCase() === 'approved')
        : requests.filter(r => r.status?.toLowerCase() === 'rejected');

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
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Equipment Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage and approve equipment requests from all employees
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="700" color={stat.color}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color, width: 56, height: 56 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Create New Request
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleRequestSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Employee"
                value={requestForm.employeeId}
                onChange={(e) => setRequestForm({ ...requestForm, employeeId: e.target.value })}
                required
                size="small"
              >
                <MenuItem value="">Select Employee</MenuItem>
                {employees.map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.empId}
                  </MenuItem>
                ))}
              </TextField>
              {employees.length === 0 && (
                <Typography variant="caption" color="warning.main">
                  No employees available
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Project"
                value={requestForm.projectId}
                onChange={(e) => setRequestForm({ ...requestForm, projectId: e.target.value })}
                required
                size="small"
              >
                <MenuItem value="">Select Project</MenuItem>
                {projects.map(proj => (
                  <MenuItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </MenuItem>
                ))}
              </TextField>
              {projects.length === 0 && (
                <Typography variant="caption" color="warning.main">
                  No projects available
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Equipment"
                value={requestForm.equipment}
                onChange={(e) => setRequestForm({ ...requestForm, equipment: e.target.value })}
                placeholder="e.g., Laptop, Monitor, Software License"
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={requestForm.quantity}
                onChange={(e) => setRequestForm({ ...requestForm, quantity: e.target.value })}
                inputProps={{ min: 1 }}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason"
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                placeholder="Explain why this equipment is needed"
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                disabled={employees.length === 0 || projects.length === 0}
              >
                Submit Request
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box p={3} pb={0}>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            All Requests
          </Typography>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${requests.length})`} />
            <Tab label={`Pending (${requests.filter(r => r.status?.toLowerCase() === 'pending').length})`} />
            <Tab label={`Approved (${requests.filter(r => r.status?.toLowerCase() === 'approved').length})`} />
            <Tab label={`Rejected (${requests.filter(r => r.status?.toLowerCase() === 'rejected').length})`} />
          </Tabs>
        </Box>

        {requests.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Assignment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No requests submitted yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Equipment requests will appear here
            </Typography>
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No {tabValue === 1 ? 'pending' : tabValue === 2 ? 'approved' : 'rejected'} requests
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Project</strong></TableCell>
                  <TableCell><strong>Equipment</strong></TableCell>
                  <TableCell><strong>Qty</strong></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map(req => {
                  const employee = employees.find(e => e.id === parseInt(req.employeeId));
                  const project = projects.find(p => p.id === parseInt(req.projectId));
                  return (
                    <TableRow
                      key={req.id}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:last-child td': { border: 0 }
                      }}
                    >
                      <TableCell>
                        {req.requestDate || req.createdAt || new Date().toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {employee ? (
                          <Box>
                            <Typography variant="body2" fontWeight="600">{employee.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{employee.empId}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">N/A</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {project ? (
                          <Box>
                            <Typography variant="body2" fontWeight="600">{project.name}</Typography>
                            <Chip label={project.status} size="small" variant="outlined" />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">N/A</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">{req.equipment}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={req.quantity} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {req.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={req.status} 
                          size="small" 
                          color={getStatusColor(req.status)} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => openRequestDetails(req)}
                            title="View Details"
                          >
                            <Visibility />
                          </IconButton>
                          {req.status?.toLowerCase() === 'pending' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openConfirmDialog(req.id, 'Approved')}
                                sx={{ border: '1px solid', borderColor: 'success.main' }}
                                title="Approve Request"
                              >
                                <ThumbUp fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openConfirmDialog(req.id, 'Rejected')}
                                sx={{ border: '1px solid', borderColor: 'error.main' }}
                                title="Reject Request"
                              >
                                <ThumbDown fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(req)}
                            title="Delete Request"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={closeConfirmDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to <strong>{confirmAction?.newStatus?.toLowerCase()}</strong> this request?
            {confirmAction?.newStatus === 'Approved' && ' The employee will be notified of the approval.'}
            {confirmAction?.newStatus === 'Rejected' && ' The employee will be notified of the rejection.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button 
            onClick={confirmStatusChange} 
            color={confirmAction?.newStatus === 'Approved' ? 'success' : 'error'}
            variant="contained" 
            autoFocus
          >
            Confirm {confirmAction?.newStatus}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this request? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteRequest} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Details Modal */}
      <Dialog open={detailsModalOpen} onClose={closeRequestDetails} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">Request Details</Typography>
            <IconButton onClick={closeRequestDetails}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mt: 2 }}>
                Request Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Stack spacing={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Equipment</Typography>
                    <Typography variant="body1" fontWeight="600">{selectedRequest.equipment}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Quantity</Typography>
                    <Typography variant="body1">{selectedRequest.quantity}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Box mt={0.5}>
                      <Chip 
                        label={selectedRequest.status} 
                        size="small" 
                        color={getStatusColor(selectedRequest.status)} 
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Request Date</Typography>
                    <Typography variant="body1">
                      {selectedRequest.requestDate || selectedRequest.createdAt || 'N/A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Reason</Typography>
                    <Typography variant="body1">{selectedRequest.reason}</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Employee Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                {(() => {
                  const emp = employees.find(e => e.id === parseInt(selectedRequest.employeeId));
                  if (!emp) return <Typography color="text.secondary">Employee information not available</Typography>;
                  return (
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body1" fontWeight="600">{emp.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                        <Typography variant="body1">{emp.empId}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{emp.email}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Designation</Typography>
                        <Typography variant="body1">{emp.designation}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Department</Typography>
                        <Typography variant="body1">{emp.department}</Typography>
                      </Box>
                    </Stack>
                  );
                })()}
              </Paper>

              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Project Information
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                {(() => {
                  const proj = projects.find(p => p.id === parseInt(selectedRequest.projectId));
                  if (!proj) return <Typography color="text.secondary">Project information not available</Typography>;
                  return (
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Name</Typography>
                        <Typography variant="body1" fontWeight="600">{proj.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Box mt={0.5}>
                          <Chip label={proj.status} size="small" variant="outlined" />
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Description</Typography>
                        <Typography variant="body1">{proj.description}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Timeline</Typography>
                        <Typography variant="body1">{proj.startDate} - {proj.endDate}</Typography>
                      </Box>
                    </Stack>
                  );
                })()}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeRequestDetails} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Alert for pending requests */}
      {requests.filter(r => r.status?.toLowerCase() === 'pending').length > 0 && tabValue === 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          You have {requests.filter(r => r.status?.toLowerCase() === 'pending').length} pending request(s) requiring your attention
        </Alert>
      )}

      {/* Snackbar for notifications */}
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