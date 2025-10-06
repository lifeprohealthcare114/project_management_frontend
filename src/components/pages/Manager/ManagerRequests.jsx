// pages/manager/Requests.jsx - Updated Version with Approval Authority
import React, { useState } from 'react';
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
  Card,
  CardContent,
  Stack,
  Divider,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Alert,
  IconButton
} from '@mui/material';
import {
  Add,
  Assignment,
  Pending,
  CheckCircle,
  Cancel,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';

const Requests = ({ managerId, requests, setRequests, employees, projects }) => {
  const [requestForm, setRequestForm] = useState({
    projectId: '', equipment: '', quantity: '', reason: ''
  });
  const [tabValue, setTabValue] = useState(0);

  const managerProjects = projects.filter(p => p.managerId === managerId.toString());
  const managerRequests = requests.filter(req => 
    managerProjects.some(p => p.id === parseInt(req.projectId))
  );

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now(),
      employeeId: managerId,
      ...requestForm,
      status: 'Pending',
      requestDate: new Date().toLocaleDateString()
    };
    setRequests([...requests, newRequest]);
    setRequestForm({ projectId: '', equipment: '', quantity: '', reason: '' });
  };

  const handleRequestStatusUpdate = (requestId, newStatus) => {
    setRequests(requests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const stats = [
    {
      title: 'Total Requests',
      value: managerRequests.length,
      icon: <Assignment />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Pending',
      value: managerRequests.filter(r => r.status === 'Pending').length,
      icon: <Pending />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Approved',
      value: managerRequests.filter(r => r.status === 'Approved').length,
      icon: <CheckCircle />,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Rejected',
      value: managerRequests.filter(r => r.status === 'Rejected').length,
      icon: <Cancel />,
      color: '#d32f2f',
      bgColor: '#ffebee'
    }
  ];

  const filteredRequests = tabValue === 0 
    ? managerRequests 
    : tabValue === 1 
    ? managerRequests.filter(r => r.status === 'Pending')
    : tabValue === 2
    ? managerRequests.filter(r => r.status === 'Approved')
    : managerRequests.filter(r => r.status === 'Rejected');

  // Separate requests by requester
  const myRequests = filteredRequests.filter(r => r.employeeId === managerId);
  const teamRequests = filteredRequests.filter(r => r.employeeId !== managerId);

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Equipment Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Create requests and approve/reject team requests for your projects
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={0}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
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

      {/* Request Categories */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  My Requests
                </Typography>
                <Typography variant="h5" fontWeight="600" color="primary.main">
                  {myRequests.length}
                </Typography>
              </Box>
              <Chip label="Created by You" color="primary" />
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Team Requests (Need Approval)
                </Typography>
                <Typography variant="h5" fontWeight="600" color="warning.main">
                  {teamRequests.filter(r => r.status === 'Pending').length}
                </Typography>
              </Box>
              <Chip label="Requires Action" color="warning" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Create Request Form */}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Project"
                value={requestForm.projectId}
                onChange={(e) => setRequestForm({...requestForm, projectId: e.target.value})}
                required
                size="small"
              >
                <MenuItem value="">Select Project</MenuItem>
                {managerProjects.map(proj => (
                  <MenuItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </MenuItem>
                ))}
              </TextField>
              {managerProjects.length === 0 && (
                <Typography variant="caption" color="warning.main">
                  No projects assigned to you
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Equipment"
                value={requestForm.equipment}
                onChange={(e) => setRequestForm({...requestForm, equipment: e.target.value})}
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
                onChange={(e) => setRequestForm({...requestForm, quantity: e.target.value})}
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
                onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
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
                disabled={managerProjects.length === 0}
              >
                Submit Request
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Requests List */}
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
            All Project Requests
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${managerRequests.length})`} />
            <Tab label={`Pending (${managerRequests.filter(r => r.status === 'Pending').length})`} />
            <Tab label={`Approved (${managerRequests.filter(r => r.status === 'Approved').length})`} />
            <Tab label={`Rejected (${managerRequests.filter(r => r.status === 'Rejected').length})`} />
          </Tabs>
        </Box>

        {managerRequests.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Assignment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No requests for your projects
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
                  <TableCell><strong>Requested By</strong></TableCell>
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
                  const isMyRequest = req.employeeId === managerId;
                  
                  return (
                    <TableRow 
                      key={req.id}
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:last-child td': { border: 0 },
                        bgcolor: isMyRequest ? 'primary.50' : 'inherit'
                      }}
                    >
                      <TableCell>{req.requestDate}</TableCell>
                      <TableCell>
                        {employee ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: isMyRequest ? 'success.main' : 'primary.main' }}>
                              {employee.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="600">
                                {employee.name} {isMyRequest && '(You)'}
                              </Typography>
                              <Chip 
                                label={employee.role} 
                                size="small" 
                                color={employee.role === 'Manager' ? 'warning' : 'info'}
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {project ? (
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {project.name}
                            </Typography>
                            <Chip 
                              label={project.status} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {req.equipment}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={req.quantity} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
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
                        {req.status === 'Pending' && !isMyRequest ? (
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleRequestStatusUpdate(req.id, 'Approved')}
                              sx={{ 
                                border: '1px solid',
                                borderColor: 'success.main'
                              }}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRequestStatusUpdate(req.id, 'Rejected')}
                              sx={{ 
                                border: '1px solid',
                                borderColor: 'error.main'
                              }}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </Stack>
                        ) : req.status === 'Pending' && isMyRequest ? (
                          <Chip label="Awaiting Admin" size="small" variant="outlined" color="warning" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Info Alerts */}
      {teamRequests.filter(r => r.status === 'Pending').length > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <strong>Action Required:</strong> You have {teamRequests.filter(r => r.status === 'Pending').length} pending request(s) from your team members awaiting your approval.
        </Alert>
      )}
      
      {myRequests.filter(r => r.status === 'Pending').length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You have {myRequests.filter(r => r.status === 'Pending').length} of your own request(s) pending. Admin will review and approve/reject these requests.
        </Alert>
      )}
    </Box>
  );
};

export default Requests;