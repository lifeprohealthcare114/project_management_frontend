// Employee Requests.jsx
// Path: src/pages/employee/Requests.jsx

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
  Card,
  CardContent,
  Stack,
  Divider,
  MenuItem,
  Tabs,
  Tab,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Assignment,
  Pending,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { 
  getProjectsByEmployee, 
  getRequestsByEmployee, 
  createRequest 
} from '../../../api/api';

const Requests = () => {
  const employeeId = parseInt(localStorage.getItem('userId'));

  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [requestForm, setRequestForm] = useState({
    projectId: '', equipment: '', quantity: '', reason: ''
  });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const projectsRes = await getProjectsByEmployee(employeeId);
      setProjects(projectsRes.data || []);

      const requestsRes = await getRequestsByEmployee(employeeId);
      setRequests(requestsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const newRequest = {
        employeeId,
        projectId: parseInt(requestForm.projectId),
        equipment: requestForm.equipment,
        quantity: parseInt(requestForm.quantity),
        reason: requestForm.reason
      };

      const res = await createRequest(newRequest);
      setRequests([...requests, res.data]);
      setRequestForm({ projectId: '', equipment: '', quantity: '', reason: '' });
      setSuccess('Request submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating request:', err);
      setError('Failed to submit request. Please try again.');
    }
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
    { title: 'Total Requests', value: requests.length, icon: <Assignment />, color: '#1976d2', bgColor: '#e3f2fd' },
    { title: 'Pending', value: requests.filter(r => r.status === 'Pending').length, icon: <Pending />, color: '#ed6c02', bgColor: '#fff3e0' },
    { title: 'Approved', value: requests.filter(r => r.status === 'Approved').length, icon: <CheckCircle />, color: '#2e7d32', bgColor: '#e8f5e9' },
    { title: 'Rejected', value: requests.filter(r => r.status === 'Rejected').length, icon: <Cancel />, color: '#d32f2f', bgColor: '#ffebee' }
  ];

  const filteredRequests = tabValue === 0 
    ? requests 
    : tabValue === 1 
    ? requests.filter(r => r.status === 'Pending')
    : tabValue === 2
    ? requests.filter(r => r.status === 'Approved')
    : requests.filter(r => r.status === 'Rejected');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        My Equipment Requests
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Create and track your equipment requests
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{stat.title}</Typography>
                    <Typography variant="h4" fontWeight="700" color={stat.color}>{stat.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: stat.bgColor, color: stat.color, width: 56, height: 56 }}>{stat.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Request Form */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="600" gutterBottom>Create New Request</Typography>
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
                {projects.map(proj => (
                  <MenuItem key={proj.id} value={proj.id}>{proj.name}</MenuItem>
                ))}
              </TextField>
              {projects.length === 0 && <Alert severity="warning" sx={{ mt: 1 }}>No projects assigned to you.</Alert>}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Equipment" value={requestForm.equipment} onChange={(e) => setRequestForm({...requestForm, equipment: e.target.value})} placeholder="e.g., Laptop, Monitor" required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth type="number" label="Quantity" value={requestForm.quantity} onChange={(e) => setRequestForm({...requestForm, quantity: e.target.value})} inputProps={{ min: 1 }} required size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Reason" value={requestForm.reason} onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})} placeholder="Explain why this equipment is needed" required size="small" />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" startIcon={<Add />} disabled={projects.length === 0}>Submit Request</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Requests List */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box p={3} pb={0}>
          <Typography variant="h6" fontWeight="600" gutterBottom>My Requests History</Typography>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={`All (${requests.length})`} />
            <Tab label={`Pending (${requests.filter(r => r.status === 'Pending').length})`} />
            <Tab label={`Approved (${requests.filter(r => r.status === 'Approved').length})`} />
            <Tab label={`Rejected (${requests.filter(r => r.status === 'Rejected').length})`} />
          </Tabs>
        </Box>

        {requests.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Assignment sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No requests submitted yet</Typography>
            <Typography variant="body2" color="text.secondary">Create your first equipment request using the form above</Typography>
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">No {tabValue === 1 ? 'pending' : tabValue === 2 ? 'approved' : 'rejected'} requests</Typography>
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
                  <TableCell><strong>Approved By</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map(req => (
                  <TableRow key={req.id} sx={{ '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}>
                    <TableCell>{req.requestDate}</TableCell>
                    <TableCell>
                      {req.projectName || 'N/A'}
                    </TableCell>
                    <TableCell>{req.equipment}</TableCell>
                    <TableCell><Chip label={req.quantity} size="small" variant="outlined" /></TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {req.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={req.status} size="small" color={getStatusColor(req.status)} />
                      {req.respondedAt && <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>Responded: {req.respondedAt}</Typography>}
                    </TableCell>
                    <TableCell>{req.responderName || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {requests.filter(r => r.status === 'Pending').length > 0 && tabValue === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You have {requests.filter(r => r.status === 'Pending').length} pending request(s). Your manager or admin will review and approve/reject your requests.
        </Alert>
      )}
    </Box>
  );
};

export default Requests;
