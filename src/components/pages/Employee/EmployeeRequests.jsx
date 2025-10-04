// pages/employee/Requests.jsx
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
  Alert
} from '@mui/material';
import {
  Add,
  Assignment,
  Pending,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

const Requests = ({ employeeId, requests, setRequests, projects }) => {
  const [requestForm, setRequestForm] = useState({
    projectId: '', equipment: '', quantity: '', reason: ''
  });
  const [tabValue, setTabValue] = useState(0);

  const employeeProjects = projects.filter(p => p.teamMembers.includes(employeeId));
  const employeeRequests = requests.filter(req => req.employeeId === employeeId);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now(),
      employeeId: employeeId,
      ...requestForm,
      status: 'Pending',
      requestDate: new Date().toLocaleDateString()
    };
    setRequests([...requests, newRequest]);
    setRequestForm({ projectId: '', equipment: '', quantity: '', reason: '' });
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
      value: employeeRequests.length,
      icon: <Assignment />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Pending',
      value: employeeRequests.filter(r => r.status === 'Pending').length,
      icon: <Pending />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Approved',
      value: employeeRequests.filter(r => r.status === 'Approved').length,
      icon: <CheckCircle />,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Rejected',
      value: employeeRequests.filter(r => r.status === 'Rejected').length,
      icon: <Cancel />,
      color: '#d32f2f',
      bgColor: '#ffebee'
    }
  ];

  const filteredRequests = tabValue === 0 
    ? employeeRequests 
    : tabValue === 1 
    ? employeeRequests.filter(r => r.status === 'Pending')
    : tabValue === 2
    ? employeeRequests.filter(r => r.status === 'Approved')
    : employeeRequests.filter(r => r.status === 'Rejected');

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        My Equipment Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Create and track your equipment requests
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
                {employeeProjects.map(proj => (
                  <MenuItem key={proj.id} value={proj.id}>
                    {proj.name}
                  </MenuItem>
                ))}
              </TextField>
              {employeeProjects.length === 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  No projects assigned to you. You need to be assigned to a project to create requests.
                </Alert>
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
                disabled={employeeProjects.length === 0}
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
            My Requests History
          </Typography>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${employeeRequests.length})`} />
            <Tab label={`Pending (${employeeRequests.filter(r => r.status === 'Pending').length})`} />
            <Tab label={`Approved (${employeeRequests.filter(r => r.status === 'Approved').length})`} />
            <Tab label={`Rejected (${employeeRequests.filter(r => r.status === 'Rejected').length})`} />
          </Tabs>
        </Box>

        {employeeRequests.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Assignment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No requests submitted yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first equipment request using the form above
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
                  <TableCell><strong>Project</strong></TableCell>
                  <TableCell><strong>Equipment</strong></TableCell>
                  <TableCell><strong>Qty</strong></TableCell>
                  <TableCell><strong>Reason</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map(req => {
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
                      <TableCell sx={{ maxWidth: 300 }}>
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Pending Requests Alert */}
      {employeeRequests.filter(r => r.status === 'Pending').length > 0 && tabValue === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You have {employeeRequests.filter(r => r.status === 'Pending').length} pending request(s). 
          Admin will review and approve/reject your requests.
        </Alert>
      )}

      {/* Request Summary */}
      {employeeRequests.length > 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mt: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Request Summary
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="h4" fontWeight="700" color="primary.main">
                  {employeeRequests.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Requests
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} bgcolor="warning.50" borderRadius={2}>
                <Typography variant="h4" fontWeight="700" color="warning.main">
                  {employeeRequests.filter(r => r.status === 'Pending').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} bgcolor="success.50" borderRadius={2}>
                <Typography variant="h4" fontWeight="700" color="success.main">
                  {employeeRequests.filter(r => r.status === 'Approved').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} bgcolor="error.50" borderRadius={2}>
                <Typography variant="h4" fontWeight="700" color="error.main">
                  {employeeRequests.filter(r => r.status === 'Rejected').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default Requests;