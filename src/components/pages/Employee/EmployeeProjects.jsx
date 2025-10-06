import React, { useState, useEffect } from 'react';
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
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  FolderOpen,
  Visibility,
  People,
  CalendarToday,
  Person,
  Close,
  Assignment,
  Group,
  CheckCircle,
  AccessTime,
  Warning
} from '@mui/icons-material';

import { getProjects, updateProject, getEmployees } from '../../../api/api';

const Projects = () => {
  const employeeId = parseInt(localStorage.getItem('userId'));
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, employeesRes] = await Promise.all([
        getProjects(),
        getEmployees()
      ]);
      setProjects(projectsRes.data || []);
      setEmployees(employeesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const employeeProjects = projects.filter(p => p.teamMembers?.includes(employeeId));

  const getTimelineStatus = (startDate, endDate, status) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (status === 'Completed') {
      return { label: 'Completed', color: 'success', icon: <CheckCircle /> };
    }
    
    if (today > end) {
      return { label: 'Overdue', color: 'error', icon: <Warning /> };
    }
    
    if (today < start) {
      return { label: 'Not Started', color: 'default', icon: <AccessTime /> };
    }
    
    const totalDuration = end - start;
    const elapsed = today - start;
    const percentElapsed = (elapsed / totalDuration) * 100;
    
    if (percentElapsed < 50) {
      return { label: 'On Track', color: 'success', icon: <CheckCircle /> };
    } else if (percentElapsed < 80) {
      return { label: 'In Progress', color: 'info', icon: <AccessTime /> };
    } else {
      return { label: 'Near Deadline', color: 'warning', icon: <Warning /> };
    }
  };

  const handleMarkTaskComplete = async (projectId, taskId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      const updatedTasks = project.tasks.map(task => 
        task.id === taskId ? { ...task, status: 'Done' } : task
      );
      const updatedProject = { ...project, tasks: updatedTasks };
      const res = await updateProject(projectId, updatedProject);
      setProjects(prev => prev.map(p => p.id === projectId ? res.data : p));
      if (selectedProject?.id === projectId) {
        setSelectedProject(res.data);
      }
    } catch (error) {
      console.error('Error marking task complete:', error);
    }
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
    setModalTab(0);
  };

  const getTeamMembers = (project) => {
    return employees.filter(emp => project.teamMembers?.includes(emp.id));
  };

  const getProjectManager = (project) => {
    return employees.find(emp => emp.id === parseInt(project.managerId));
  };

  const getMyTasks = (project) => {
    return project.tasks?.filter(task => task.assignedTo === employeeId) || [];
  };

  const getMyTeams = (project) => {
    return project.teams?.filter(team => team.members?.includes(employeeId)) || [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Planning': return 'warning';
      case 'To Do': return 'default';
      case 'Done': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return <Typography variant="h6" textAlign="center" mt={5}>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        My Projects
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        View all projects you're working on, your teams and assigned tasks
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
            Projects assigned to you by admin or manager will appear here
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {employeeProjects.map(proj => {
            const myTasks = getMyTasks(proj);
            const myTeams = getMyTeams(proj);
            const timelineStatus = getTimelineStatus(proj.startDate, proj.endDate, proj.status);
            const completedTasks = myTasks.filter(t => t.status === 'Done').length;
            const totalTasks = myTasks.length;
            
            return (
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
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={proj.status}
                          size="small"
                          color={getStatusColor(proj.status)}
                        />
                        <Tooltip title={`Timeline: ${timelineStatus.label}`}>
                          <Chip
                            icon={timelineStatus.icon}
                            label={timelineStatus.label}
                            size="small"
                            color={timelineStatus.color}
                          />
                        </Tooltip>
                      </Stack>
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
                          Team: <strong>{proj.teamMembers?.length || 0} members</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Group sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          My Teams: <strong>{myTeams.length}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          My Tasks: <strong>{completedTasks}/{totalTasks}</strong>
                          {totalTasks > 0 && ` (${Math.round((completedTasks/totalTasks)*100)}%)`}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {proj.startDate} - {proj.endDate}
                        </Typography>
                      </Box>
                    </Stack>

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
            );
          })}
        </Grid>
      )}

      {/* Project Details Modal with Tabs */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {selectedProject.name}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip 
                      label={selectedProject.status}
                      size="small"
                      color={getStatusColor(selectedProject.status)}
                    />
                    <Chip
                      icon={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).icon}
                      label={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).label}
                      size="small"
                      color={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).color}
                    />
                  </Stack>
                </Box>
                <IconButton onClick={() => setShowModal(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={modalTab} onChange={(e, newValue) => setModalTab(newValue)}>
                <Tab label="Overview" />
                <Tab label={`My Teams (${getMyTeams(selectedProject).length})`} />
                <Tab label={`My Tasks (${getMyTasks(selectedProject).length})`} />
                <Tab label="All Team Members" />
              </Tabs>
            </Box>
            <DialogContent>
              {/* Overview Tab */}
              {modalTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Project Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {selectedProject.description}
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>Manager:</strong> {getProjectManager(selectedProject)?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Start Date:</strong> {selectedProject.startDate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>End Date:</strong> {selectedProject.endDate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Timeline Status:</strong>{' '}
                          <Chip
                            size="small"
                            label={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).label}
                            color={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).color}
                          />
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        Quick Stats
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h4" fontWeight="700" color="primary.main">
                                {getMyTeams(selectedProject).length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                My Teams
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h4" fontWeight="700" color="info.main">
                                {getMyTasks(selectedProject).length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                My Tasks
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h4" fontWeight="700" color="success.main">
                                {getMyTasks(selectedProject).filter(t => t.status === 'Done').length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Completed
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h4" fontWeight="700" color="warning.main">
                                {getMyTasks(selectedProject).filter(t => t.status !== 'Done').length}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Pending
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* My Teams Tab */}
              {modalTab === 1 && (
                <Box>
                  {getMyTeams(selectedProject).length === 0 ? (
                    <Alert severity="info">
                      You are not part of any team in this project yet.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {getMyTeams(selectedProject).map(team => (
                        <Grid item xs={12} sm={6} md={4} key={team.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h6" fontWeight="600" gutterBottom>
                                {team.name}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                Created: {team.createdAt}
                              </Typography>
                              <Typography variant="body2" fontWeight="600" gutterBottom>
                                Team Members ({team.members?.length || 0}):
                              </Typography>
                              <List dense>
                                {team.members?.map(memberId => {
                                  const member = employees.find(e => e.id === memberId);
                                  return member ? (
                                    <ListItem key={memberId} sx={{ px: 0 }}>
                                      <ListItemAvatar>
                                        <Avatar 
                                          sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            bgcolor: memberId === employeeId ? 'success.main' : 'primary.main'
                                          }}
                                        >
                                          {member.name.charAt(0)}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={
                                          <Typography variant="body2">
                                            {member.name} {memberId === employeeId && '(You)'}
                                          </Typography>
                                        }
                                        secondary={
                                          <Typography variant="caption">
                                            {member.designation}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  ) : null;
                                })}
                              </List>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* My Tasks Tab */}
              {modalTab === 2 && (
                <Box>
                  {getMyTasks(selectedProject).length === 0 ? (
                    <Alert severity="info">
                      No tasks assigned to you yet in this project.
                    </Alert>
                  ) : (
                    <>
                      <Box mb={2}>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Chip
                            label={`Total: ${getMyTasks(selectedProject).length}`}
                            color="default"
                          />
                          <Chip
                            label={`Done: ${getMyTasks(selectedProject).filter(t => t.status === 'Done').length}`}
                            color="success"
                          />
                          <Chip
                            label={`In Progress: ${getMyTasks(selectedProject).filter(t => t.status === 'In Progress').length}`}
                            color="info"
                          />
                          <Chip
                            label={`To Do: ${getMyTasks(selectedProject).filter(t => t.status === 'To Do').length}`}
                            color="warning"
                          />
                        </Stack>
                      </Box>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell><strong>Task Name</strong></TableCell>
                              <TableCell><strong>Team</strong></TableCell>
                              <TableCell><strong>Deadline</strong></TableCell>
                              <TableCell><strong>Est. Hours</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell align="center"><strong>Action</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {getMyTasks(selectedProject).map(task => {
                              const team = selectedProject.teams?.find(t => t.id === task.teamId);
                              const taskDeadline = new Date(task.deadline);
                              const today = new Date();
                              const isOverdue = today > taskDeadline && task.status !== 'Done';
                              
                              return (
                                <TableRow key={task.id}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="600">
                                      {task.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {task.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {team ? (
                                      <Chip label={team.name} size="small" variant="outlined" />
                                    ) : (
                                      <Typography variant="caption" color="text.secondary">
                                        No Team
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'}>
                                      {task.deadline}
                                    </Typography>
                                    {isOverdue && (
                                      <Chip label="Overdue" size="small" color="error" sx={{ mt: 0.5 }} />
                                    )}
                                  </TableCell>
                                  <TableCell>{task.estimatedHours}h</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={task.status} 
                                      size="small"
                                      color={getStatusColor(task.status)}
                                      icon={task.status === 'Done' ? <CheckCircle /> : undefined}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    {task.status !== 'Done' ? (
                                      <Tooltip title="Mark as Complete">
                                        <IconButton
                                          size="small"
                                          color="success"
                                          onClick={() => handleMarkTaskComplete(selectedProject.id, task.id)}
                                          sx={{
                                            border: '1px solid',
                                            borderColor: 'success.main'
                                          }}
                                        >
                                          <CheckCircle fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    ) : (
                                      <Chip label="Completed" size="small" color="success" icon={<CheckCircle />} />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              )}

              {/* All Team Members Tab */}
              {modalTab === 3 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    All Team Members ({getTeamMembers(selectedProject).length + 1})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {/* Manager */}
                    {getProjectManager(selectedProject) && (
                      <>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              {getProjectManager(selectedProject).name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="600">
                                {getProjectManager(selectedProject).name}
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Chip label="Manager" size="small" color="warning" sx={{ mr: 1 }} />
                                {getProjectManager(selectedProject).designation} • {getProjectManager(selectedProject).department}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </>
                    )}
                    {/* Team Members */}
                    {getTeamMembers(selectedProject).map(emp => (
                      <React.Fragment key={emp.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: emp.id === employeeId ? 'success.main' : 'primary.main' }}>
                              {emp.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="600">
                                {emp.name} {emp.id === employeeId && '(You)'}
                              </Typography>
                            }
                            secondary={`${emp.designation} • ${emp.department} • ${emp.email}`}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
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