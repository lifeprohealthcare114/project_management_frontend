// pages/employee/Dashboard.jsx
import React from 'react';
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
  ListItemText,
  Divider,
  Stack
} from '@mui/material';
import {
  FolderOpen,
  Assignment,
  CheckCircle,
  Pending
} from '@mui/icons-material';

const Dashboard = ({ employeeId, projects, requests }) => {
  const employeeProjects = projects.filter(p => p.teamMembers.includes(employeeId));
  const employeeRequests = requests.filter(req => req.employeeId === employeeId);
  
  const stats = [
    {
      title: 'My Projects',
      value: employeeProjects.length,
      icon: <FolderOpen sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd'
    },
    {
      title: 'Pending Requests',
      value: employeeRequests.filter(r => r.status === 'Pending').length,
      icon: <Pending sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      bgColor: '#fff3e0'
    },
    {
      title: 'Approved Requests',
      value: employeeRequests.filter(r => r.status === 'Approved').length,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      bgColor: '#e8f5e9'
    },
    {
      title: 'In Progress',
      value: employeeProjects.filter(p => p.status === 'In Progress').length,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#0288d1',
      bgColor: '#e1f5fe'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Planning': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Employee Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Welcome back! Here's an overview of your projects and requests
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

      <Grid container spacing={3}>
        {/* Current Projects */}
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
              My Current Projects
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {employeeProjects.length === 0 ? (
              <Box textAlign="center" py={4}>
                <FolderOpen sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No projects assigned yet
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {employeeProjects.map(proj => (
                  <Grid item xs={12} md={6} key={proj.id}>
                    <Card 
                      variant="outlined"
                      sx={{
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Typography variant="h6" fontWeight="600">
                            {proj.name}
                          </Typography>
                          <Chip 
                            label={proj.status}
                            size="small"
                            color={getStatusColor(proj.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {proj.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="caption" color="text.secondary">
                            Team: {proj.teamMembers.length} members
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {proj.startDate} - {proj.endDate}
                          </Typography>
                        </Box>
                        <Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="caption" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="caption" fontWeight="600">
                              {proj.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={proj.progress}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Recent Requests */}
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
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Recent Requests
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {employeeRequests.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Assignment sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No requests made yet
                </Typography>
              </Box>
            ) : (
              <List>
                {employeeRequests.slice(-5).reverse().map((req, index) => {
                  const project = projects.find(p => p.id === parseInt(req.projectId));
                  return (
                    <ListItem 
                      key={req.id}
                      sx={{ 
                        px: 0,
                        borderBottom: index !== Math.min(4, employeeRequests.length - 1) ? '1px solid' : 'none',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="600">
                            {req.equipment}
                          </Typography>
                        }
                        secondary={
                          <Box mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Project: {project ? project.name : 'N/A'} • Qty: {req.quantity}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              Date: {req.requestDate}
                            </Typography>
                          </Box>
                        }
                      />
                      <Chip 
                        label={req.status}
                        size="small"
                        color={getStatusColor(req.status)}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Project Status Distribution */}
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
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Project Status Overview
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              {['Planning', 'In Progress', 'Completed'].map((status) => {
                const count = employeeProjects.filter(p => p.status === status).length;
                return (
                  <Grid item xs={12} key={status}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        bgcolor: getStatusColor(status) + '.50',
                        border: '1px solid',
                        borderColor: getStatusColor(status) + '.200'
                      }}
                    >
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CheckCircle color={getStatusColor(status)} />
                          <Typography variant="body2" fontWeight="600">
                            {status}
                          </Typography>
                        </Stack>
                        <Typography variant="h3" fontWeight="700" mt={1}>
                          {count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employeeProjects.length > 0 
                            ? `${((count / employeeProjects.length) * 100).toFixed(1)}%` 
                            : '0%'} of your projects
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