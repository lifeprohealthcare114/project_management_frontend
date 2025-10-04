// pages/employee/Projects.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  LinearProgress,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import {
  FolderOpen,
  Visibility,
  People,
  CalendarToday,
  Person,
  Close
} from '@mui/icons-material';

const Projects = ({ employeeId, projects, employees }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const employeeProjects = projects.filter(p => p.teamMembers.includes(employeeId));

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const getTeamMembers = (project) => {
    return employees.filter(emp => project.teamMembers.includes(emp.id));
  };

  const getProjectManager = (project) => {
    return employees.find(emp => emp.id === parseInt(project.managerId));
  };

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
        My Projects
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        View all projects you're working on
      </Typography>

      {employeeProjects.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 8, 
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <FolderOpen sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects assigned yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your assigned projects will appear here
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {employeeProjects.map(proj => (
            <Grid item xs={12} md={6} lg={4} key={proj.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
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
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <FolderOpen />
                    </Avatar>
                    <Chip 
                      label={proj.status}
                      size="small"
                      color={getStatusColor(proj.status)}
                    />
                  </Box>
                  
                  <Typography variant="h6" fontWeight="600" gutterBottom noWrap>
                    {proj.name}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    mb={2}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: 40
                    }}
                  >
                    {proj.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Manager: <strong>{getProjectManager(proj)?.name || 'N/A'}</strong>
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1}>
                      <People sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Team: <strong>{proj.teamMembers.length} members</strong>
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {proj.startDate} - {proj.endDate}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box mt={2}>
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

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => viewProjectDetails(proj)}
                    sx={{ mt: 2 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Project Details Modal */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <FolderOpen />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {selectedProject.name}
                    </Typography>
                    <Chip 
                      label={selectedProject.status}
                      size="small"
                      color={getStatusColor(selectedProject.status)}
                    />
                  </Box>
                </Box>
                <IconButton onClick={() => setShowModal(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedProject.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Start Date
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedProject.startDate}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    End Date
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedProject.endDate}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Project Manager
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {getProjectManager(selectedProject)?.name || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Progress
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedProject.progress}
                      sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="body1" fontWeight="600">
                      {selectedProject.progress}%
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Team Members ({getTeamMembers(selectedProject).length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {getTeamMembers(selectedProject).length === 0 ? (
                    <Alert severity="info">
                      No other team members in this project
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell><strong>Employee</strong></TableCell>
                            <TableCell><strong>Designation</strong></TableCell>
                            <TableCell><strong>Department</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getTeamMembers(selectedProject).map(emp => (
                            <TableRow key={emp.id}>
                              <TableCell>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                    {emp.name.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight="600">
                                      {emp.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {emp.empId}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell>{emp.designation}</TableCell>
                              <TableCell>{emp.department}</TableCell>
                              <TableCell>{emp.email}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setShowModal(false)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Projects;