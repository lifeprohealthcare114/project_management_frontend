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
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import {
  People,
  FolderOpen,
  Assignment,
  TrendingUp,
  Person,
  Folder,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDashboardData } from '../../../api/api';

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = parseInt(localStorage.getItem('userId'));
  const role = localStorage.getItem('role') || 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardData();
      setEmployees(response.data.employees || []);
      setProjects(response.data.projects || []);
      setRequests(response.data.requests || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Employees',
      value: employees.length,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Total Projects',
      value: projects.length,
      icon: <FolderOpen sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'Pending Requests',
      value: requests.filter(r => r.status === 'Pending').length,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'In Progress').length,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Planning': return 'warning';
      default: return 'default';
    }
  };

  const departments = Array.from(new Set(employees.map(e => e.department))).map(dept => {
    const count = employees.filter(e => e.department === dept).length;
    const percentage = employees.length > 0 ? (count / employees.length) * 100 : 0;
    return { name: dept, count, percentage };
  });

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
        Dashboard Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Welcome back! Here's what's happening with your organization today.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
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
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
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
        {/* Recent Employees */}
        <Grid item xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <Person color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Recent Employees
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/admin-employees')}>
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {employees.length === 0 ? (
              <Box textAlign="center" py={4}>
                <People sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No employees added yet
                </Typography>
              </Box>
            ) : (
              <List>
                {employees.slice(-5).reverse().map((emp, index) => (
                  <ListItem
                    key={emp.id}
                    sx={{
                      px: 0,
                      borderBottom: index !== Math.min(4, employees.length - 1) ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {emp.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="600">
                          {emp.name}
                        </Typography>
                      }
                      secondary={emp.designation}
                    />
                    <Chip
                      label={emp.role}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12} lg={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center">
                <Folder color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">
                  Recent Projects
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/admin-projects')}>
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {projects.length === 0 ? (
              <Box textAlign="center" py={4}>
                <FolderOpen sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No projects created yet
                </Typography>
              </Box>
            ) : (
              <List>
                {projects.slice(-5).reverse().map((proj, index) => (
                  <ListItem
                    key={proj.id}
                    sx={{
                      px: 0,
                      borderBottom: index !== Math.min(4, projects.length - 1) ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Folder />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="600">
                          {proj.name}
                        </Typography>
                      }
                      secondary={`Manager: ${proj.manager?.name || 'N/A'} • Team: ${proj.teamMembers?.length || 0} members`}
                    />
                    <Chip
                      label={proj.status}
                      size="small"
                      color={getStatusColor(proj.status)}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Department Distribution
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {employees.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No data available
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {departments.map((dept) => (
                  <Grid item xs={12} sm={6} md={4} key={dept.name}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight="600">
                          {dept.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dept.count} {dept.count === 1 ? 'employee' : 'employees'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={dept.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200'
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                        {dept.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Project Status Summary */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Project Status Overview
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              {['Planning', 'In Progress', 'Completed'].map((status) => {
                const count = projects.filter(p => p.status === status).length;
                const percentage = projects.length > 0 ? (count / projects.length) * 100 : 0;
                return (
                  <Grid item xs={12} sm={4} key={status}>
                    <Card
                      elevation={0}
                      sx={{
                        bgcolor: getStatusColor(status) + '.50',
                        border: '1px solid',
                        borderColor: getStatusColor(status) + '.200'
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <CheckCircle color={getStatusColor(status)} />
                          <Typography variant="body2" fontWeight="600">
                            {status}
                          </Typography>
                        </Stack>
                        <Typography variant="h3" fontWeight="700">
                          {count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {percentage.toFixed(1)}% of total projects
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
