// pages/manager/Dashboard.jsx
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
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack
} from '@mui/material';
import {
  FolderOpen,
  People,
  Assignment,
  TrendingUp,
  CheckCircle,
  Folder,
  Person
} from '@mui/icons-material';

const Dashboard = ({ managerId, projects, employees, requests }) => {
  const managerProjects = projects.filter(p => p.managerId === managerId.toString());
  
  const teamMemberIds = new Set();
  managerProjects.forEach(project => {
    project.teamMembers.forEach(memberId => teamMemberIds.add(memberId));
  });
  const teamMembers = employees.filter(emp => teamMemberIds.has(emp.id));
  
  const managerRequests = requests.filter(req => 
    managerProjects.some(p => p.id === parseInt(req.projectId))
  );
  
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
      value: managerRequests.filter(r => r.status === 'Pending').length,
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Planning': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Manager Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage your projects and team effectively
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
        {/* My Projects */}
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
            <Box display="flex" alignItems="center" mb={2}>
              <Folder color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="600">
                My Projects
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {managerProjects.length === 0 ? (
              <Box textAlign="center" py={4}>
                <FolderOpen sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No projects assigned yet
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {managerProjects.map(proj => (
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

        {/* Team Members */}
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
            <Box display="flex" alignItems="center" mb={2}>
              <Person color="success" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="600">
                My Team Members
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {teamMembers.length === 0 ? (
              <Box textAlign="center" py={4}>
                <People sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                  No team members assigned yet
                </Typography>
              </Box>
            ) : (
              <List>
                {teamMembers.slice(0, 5).map((emp, index) => (
                  <ListItem 
                    key={emp.id}
                    sx={{ 
                      px: 0,
                      borderBottom: index !== Math.min(4, teamMembers.length - 1) ? '1px solid' : 'none',
                      borderColor: 'divider'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        {emp.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="600">
                          {emp.name}
                        </Typography>
                      }
                      secondary={`${emp.designation} • ${emp.department}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Project Status Summary */}
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
                const count = managerProjects.filter(p => p.status === status).length;
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
                          {managerProjects.length > 0 
                            ? `${((count / managerProjects.length) * 100).toFixed(1)}%` 
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