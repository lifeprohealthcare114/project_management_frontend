import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  FolderOpen,
  People,
  Assignment,
  TrendingUp,
  CheckCircle,
  Folder,
  Person,
  Close
} from '@mui/icons-material';
import { getProjectsByManager, getRequestsByManager, getEmployees } from '../../../api/api';

const Dashboard = () => {
  const managerId = parseInt(localStorage.getItem('userId'));
  const userName = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Manager';

  const [managerProjects, setManagerProjects] = useState([]);
  const [managerRequests, setManagerRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestsModalOpen, setRequestsModalOpen] = useState(false);
  const [requestFilter, setRequestFilter] = useState('All');

  useEffect(() => {
    fetchData();
  }, [managerId]);

  const fetchData = async () => {
    if (!managerId) return;

    setLoading(true);
    setError('');

    try {
      const [projectsRes, requestsRes, employeesRes] = await Promise.all([
        getProjectsByManager(managerId),
        getRequestsByManager(managerId),
        getEmployees()
      ]);

      setManagerProjects(projectsRes.data || []);
      setManagerRequests(requestsRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const teamMemberIds = new Set();
  managerProjects.forEach(project => {
    if (project.teamMembers && Array.isArray(project.teamMembers)) {
      project.teamMembers.forEach(id => teamMemberIds.add(id));
    }
  });
  const teamMembers = employees.filter(emp => teamMemberIds.has(emp.id));

  const pendingRequests = managerRequests.filter(r => r.status === 'Pending');

  const getEmployeeName = id => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.name : 'Unknown';
  };

  const stats = [
    {
      title: 'My Projects',
      value: managerProjects.length,
      icon: <FolderOpen sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Team Members',
      value: teamMembers.length,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Active Projects',
      value: managerProjects.filter(p => p.status === 'In Progress').length,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe'
    }
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Planning': return 'warning';
      case 'Pending': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const filteredRequests = requestFilter === 'All'
    ? managerRequests
    : managerRequests.filter(r => r.status === requestFilter);

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
        Manager Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Welcome back, {userName}! Here's an overview of your projects, team, and requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
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
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-4px)' }
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

      <Grid container spacing={3}>
        {/* Projects */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>My Projects</Typography>
            <Divider sx={{ mb: 2 }} />
            {managerProjects.length === 0 ? (
              <Box textAlign="center" py={4}>
                <FolderOpen sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No projects assigned yet</Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {managerProjects.map(proj => {
                  const completedTasks = proj.tasks?.filter(t => t.status === 'Done').length || 0;
                  const totalTasks = proj.tasks?.length || 0;
                  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                  return (
                    <Grid item xs={12} md={6} key={proj.id}>
                      <Card variant="outlined" sx={{ transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)' } }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                            <Typography variant="h6" fontWeight="600">{proj.name}</Typography>
                            <Chip label={proj.status} size="small" color={getStatusColor(proj.status)} />
                          </Box>
                          <Typography variant="body2" color="text.secondary" mb={2}>{proj.description}</Typography>
                          <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="caption" color="text.secondary">
                              Team: {proj.teamMembers?.length || 0} members
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {proj.startDate} - {proj.endDate}
                            </Typography>
                          </Box>
                          <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                              <Typography variant="caption" color="text.secondary">Progress</Typography>
                              <Typography variant="caption" fontWeight="600">{progress}%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Team Members */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>My Team Members</Typography>
            <Divider sx={{ mb: 2 }} />
            {teamMembers.length === 0 ? (
              <Box textAlign="center" py={4}>
                <People sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No team members assigned yet</Typography>
              </Box>
            ) : (
              <List>
                {teamMembers.slice(0, 5).map((emp, index) => (
                  <ListItem key={emp.id} sx={{ px: 0, borderBottom: index !== Math.min(4, teamMembers.length - 1) ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>{emp.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body1" fontWeight="600">{emp.name}</Typography>}
                      secondary={`${emp.designation} • ${emp.department}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Pending Requests */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>Pending Requests</Typography>
            <Divider sx={{ mb: 2 }} />
            {pendingRequests.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Assignment sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">No pending requests</Typography>
              </Box>
            ) : (
              <>
                <List>
                  {pendingRequests.slice(0, 5).map((req, index) => (
                    <ListItem key={req.id} sx={{ px: 0, borderBottom: index !== Math.min(4, pendingRequests.length - 1) ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>{req.employee?.name?.charAt(0) || 'E'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body1" fontWeight="600">{req.equipment}</Typography>}
                        secondary={
                          <Box mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Project: {req.project?.name || 'Unknown'} • Employee: {req.employee?.name || 'Unknown'}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip label={req.status} size="small" color={getStatusColor(req.status)} />
                    </ListItem>
                  ))}
                </List>
                <Box textAlign="center" mt={2}>
                  <Button variant="outlined" onClick={() => setRequestsModalOpen(true)}>View All Requests</Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Requests Modal */}
      <Dialog fullWidth maxWidth="md" open={requestsModalOpen} onClose={() => setRequestsModalOpen(false)}>
        <DialogTitle>
          All Requests
          <IconButton aria-label="close" onClick={() => setRequestsModalOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box mb={2}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select value={requestFilter} onChange={e => setRequestFilter(e.target.value)} label="Status Filter">
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map(req => (
                <TableRow key={req.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">{req.equipment}</Typography>
                    <Typography variant="caption" color="text.secondary">Qty: {req.quantity}</Typography>
                  </TableCell>
                  <TableCell>{req.project?.name || 'Unknown'}</TableCell>
                  <TableCell>{req.employee?.name || 'Unknown'}</TableCell>
                  <TableCell>{req.requestDate}</TableCell>
                  <TableCell>
                    <Chip label={req.status} size="small" color={getStatusColor(req.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;