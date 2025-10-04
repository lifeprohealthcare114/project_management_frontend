// pages/admin/Requests.jsx
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
  IconButton,
  Card,
  CardContent,
  Stack,
  Divider,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Alert
} from '@mui/material';
import {
  Add,
  CheckCircle,
  Cancel,
  Pending,
  Assignment,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';

const Requests = ({ requests, setRequests, employees, projects }) => {
  const [requestForm, setRequestForm] = useState({
    employeeId: '', projectId: '', equipment: '', quantity: '', reason: ''
  });
  const [tabValue, setTabValue] = useState(0);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setRequests([...requests, { 
      id: Date.now(), 
      ...requestForm, 
      status: 'Pending', 
      requestDate: new Date().toLocaleDateString() 
    }]);
    setRequestForm({ employeeId: '', projectId: '', equipment: '', quantity: '', reason: '' });
  };

  const handleRequestStatusUpdate = (requestId, newStatus) => {
    setRequests(requests.map(req => req.id === requestId ? { ...req, status: newStatus } : req));
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
      value: requests.length,
      icon: <Assignment />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Pending',
      value: requests.filter(r => r.status === 'Pending').length,
      icon: <Pending />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Approved',
      value: requests.filter(r => r.status === 'Approved').length,
      icon: <CheckCircle />,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Rejected',
      value: requests.filter(r => r.status === 'Rejected').length,
      icon: <Cancel />,
      color: '#d32f2f',
      bgColor: '#ffebee'
    }
  ];

  const filteredRequests = tabValue === 0 
    ? requests 
    : tabValue === 1 
    ? requests.filter(r => r.status === 'Pending')
    : tabValue === 2
    ? requests.filter(r => r.status === 'Approved')
    : requests.filter(r => r.status === 'Rejected');

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Equipment Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage and approve equipment requests from all employees
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Employee"
                value={requestForm.employeeId}
                onChange={(e) => setRequestForm({...requestForm, employeeId: e.target.value})}
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
                onChange={(e) => setRequestForm({...requestForm, projectId: e.target.value})}
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
                disabled={employees.length === 0 || projects.length === 0}
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
            All Requests
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${requests.length})`} />
            <Tab label={`Pending (${requests.filter(r => r.status === 'Pending').length})`} />
            <Tab label={`Approved (${requests.filter(r => r.status === 'Approved').length})`} />
            <Tab label={`Rejected (${requests.filter(r => r.status === 'Rejected').length})`} />
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
                      <TableCell>{req.requestDate}</TableCell>
                      <TableCell>
                        {employee ? (
                          <Box>
                            <Typography variant="body2" fontWeight="600">
                              {employee.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.empId}
                            </Typography>
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
                        {req.status === 'Pending' ? (
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

      {/* Pending Requests Alert */}
      {requests.filter(r => r.status === 'Pending').length > 0 && tabValue === 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          You have {requests.filter(r => r.status === 'Pending').length} pending request(s) requiring your attention
        </Alert>
      )}
    </Box>
  );
};

export default Requests;