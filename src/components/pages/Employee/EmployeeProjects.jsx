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
  Tabs,
  Tab,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  Warning,
} from '@mui/icons-material';
import { getProjectsByEmployee, updateProject } from '../../../api/api';

const EmployeeProjects = () => {
  const employeeId = parseInt(localStorage.getItem('userId'));

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTab, setModalTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [employeeId]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProjectsByEmployee(employeeId);
      setProjects(res.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProjectData = async (projectId, updatedProject) => {
    try {
      const res = await updateProject(projectId, updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === projectId ? res.data : p)));
      if (selectedProject?.id === projectId) setSelectedProject(res.data);
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project.');
    }
  };

  const getTimelineStatus = (startDate, endDate, status) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (status === 'Completed') return { label: 'Completed', color: 'success', icon: <CheckCircle /> };
    if (today > end) return { label: 'Overdue', color: 'error', icon: <Warning /> };
    if (today < start) return { label: 'Not Started', color: 'default', icon: <AccessTime /> };

    const totalDuration = end - start;
    const elapsed = today - start;
    const percentElapsed = (elapsed / totalDuration) * 100;

    if (percentElapsed < 50) return { label: 'On Track', color: 'success', icon: <CheckCircle /> };
    if (percentElapsed < 80) return { label: 'In Progress', color: 'info', icon: <AccessTime /> };
    return { label: 'Near Deadline', color: 'warning', icon: <Warning /> };
  };

  const handleMarkTaskComplete = (projectId, taskId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const updatedTasks = project.tasks.map((task) =>
      task.id === taskId ? { ...task, status: 'Done' } : task
    );
    const updatedProject = { ...project, tasks: updatedTasks };
    updateProjectData(projectId, updatedProject);
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowModal(true);
    setModalTab(0);
  };

  const getMyTasks = (project) => project.tasks?.filter((task) => task.assignedTo === employeeId) || [];
  const getMyTeams = (project) => project.teams?.filter((team) => team.members?.includes(employeeId)) || [];
  const getProjectManager = (project) => project.manager || null;

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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        My Projects
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        View all projects you're working on, your teams and assigned tasks
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}
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
          {projects.map((proj) => {
            const myTasks = getMyTasks(proj);
            const myTeams = getMyTeams(proj);
            const timelineStatus = getTimelineStatus(proj.startDate, proj.endDate, proj.status);
            const completedTasks = myTasks.filter((t) => t.status === 'Done').length;
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
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-4px)' },
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}><FolderOpen /></Avatar>
                      <Stack direction="row" spacing={1}>
                        <Chip label={proj.status} size="small" color={getStatusColor(proj.status)} />
                        <Tooltip title={`Timeline: ${timelineStatus.label}`}>
                          <Chip icon={timelineStatus.icon} label={timelineStatus.label} size="small" color={timelineStatus.color} />
                        </Tooltip>
                      </Stack>
                    </Box>

                    <Typography variant="h6" fontWeight="600" gutterBottom noWrap>{proj.name}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={2}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 40 }}
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
                          My Tasks: <strong>{completedTasks}/{totalTasks}</strong>{totalTasks > 0 && ` (${Math.round((completedTasks / totalTasks) * 100)}%)`}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">{proj.startDate} - {proj.endDate}</Typography>
                      </Box>
                    </Stack>

                    <Button fullWidth variant="outlined" startIcon={<Visibility />} onClick={() => viewProjectDetails(proj)} sx={{ mt: 2 }}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Project Details Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="lg" fullWidth>
        {selectedProject && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight="600">{selectedProject.name}</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={selectedProject.status} size="small" color={getStatusColor(selectedProject.status)} />
                    <Chip
                      icon={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).icon}
                      label={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).label}
                      size="small"
                      color={getTimelineStatus(selectedProject.startDate, selectedProject.endDate, selectedProject.status).color}
                    />
                  </Stack>
                </Box>
                <IconButton onClick={() => setShowModal(false)}><Close /></IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={modalTab} onChange={(e, newValue) => setModalTab(newValue)}>
                <Tab label="Overview" />
                <Tab label={`My Teams (${getMyTeams(selectedProject).length})`} />
                <Tab label={`My Tasks (${getMyTasks(selectedProject).length})`} />
              </Tabs>
            </Box>
            <DialogContent>
              {/* Overview Tab */}
              {modalTab === 0 && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>Project Information</Typography>
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
                      <strong>Status:</strong> <Chip label={selectedProject.status} size="small" color={getStatusColor(selectedProject.status)} />
                    </Typography>
                  </Stack>
                </Box>
              )}

              {/* My Teams Tab */}
              {modalTab === 1 && (
                <Box>
                  {getMyTeams(selectedProject).length === 0 ? (
                    <Alert severity="info">No teams assigned to you in this project.</Alert>
                  ) : (
                    <List>
                      {getMyTeams(selectedProject).map((team) => (
                        <ListItem key={team.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'success.main' }}><Group /></Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={team.name} 
                            secondary={`Created: ${team.createdAt} • Members: ${team.members?.length || 0}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* My Tasks Tab */}
              {modalTab === 2 && (
                <Box>
                  {getMyTasks(selectedProject).length === 0 ? (
                    <Alert severity="info">No tasks assigned to you in this project.</Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell><strong>Task Name</strong></TableCell>
                            <TableCell><strong>Deadline</strong></TableCell>
                            <TableCell><strong>Hours</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="center"><strong>Action</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {getMyTasks(selectedProject).map((task) => {
                            const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Done';
                            return (
                              <TableRow key={task.id}>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="600">{task.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">{task.description}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'}>
                                    {task.deadline}
                                  </Typography>
                                  {isOverdue && <Chip label="Overdue" size="small" color="error" sx={{ mt: 0.5 }} />}
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
                                  {task.status !== 'Done' && (
                                    <Button 
                                      variant="contained" 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleMarkTaskComplete(selectedProject.id, task.id)}
                                    >
                                      Mark Done
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setShowModal(false)} variant="contained">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default EmployeeProjects;
