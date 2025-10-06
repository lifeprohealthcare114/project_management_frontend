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
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
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
  Add,
  Edit,
  Assignment,
  Group,
  CheckCircle,
  AccessTime,
  Warning
} from '@mui/icons-material';

import { getProjects, createProject, updateProject, getEmployees, createTeam, createTask } from '../../../api/api';

const Projects = () => {
  const managerId = parseInt(localStorage.getItem('userId'));
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalTab, setModalTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [projectForm, setProjectForm] = useState({
    name: '', description: '', startDate: '', endDate: '', status: 'Planning'
  });

  const [teamForm, setTeamForm] = useState({
    name: '',
    members: []
  });

  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    assignedTo: '',
    teamId: '',
    deadline: '',
    estimatedHours: '',
    status: 'To Do'
  });

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

  const managerProjects = projects.filter(p => p.managerId === managerId.toString());

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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const newProject = {
        ...projectForm,
        managerId: managerId.toString(),
        teamMembers: [],
        teams: [],
        tasks: []
      };
      const res = await createProject(newProject);
      setProjects(prev => [...prev, res.data]);
      setProjectForm({ name: '', description: '', startDate: '', endDate: '', status: 'Planning' });
      setShowModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = {
        ...selectedProject,
        ...projectForm
      };
      const res = await updateProject(selectedProject.id, updatedProject);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? res.data : p));
      setShowEditModal(false);
      if (showModal && selectedProject.id === selectedProject.id) {
        setSelectedProject(res.data);
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const newTeam = {
        ...teamForm,
        projectId: selectedProject.id,
        createdAt: new Date().toLocaleDateString()
      };
      
      const updatedProject = {
        ...selectedProject,
        teams: [...(selectedProject.teams || []), { ...newTeam, id: Date.now() }]
      };
      
      const res = await updateProject(selectedProject.id, updatedProject);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? res.data : p));
      setSelectedProject(res.data);
      setTeamForm({ name: '', members: [] });
      setShowTeamModal(false);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        ...taskForm,
        projectId: selectedProject.id,
        createdAt: new Date().toLocaleDateString()
      };
      
      const updatedProject = {
        ...selectedProject,
        tasks: [...(selectedProject.tasks || []), { ...newTask, id: Date.now() }]
      };
      
      const res = await updateProject(selectedProject.id, updatedProject);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? res.data : p));
      setSelectedProject(res.data);
      setTaskForm({ name: '', description: '', assignedTo: '', teamId: '', deadline: '', estimatedHours: '', status: 'To Do' });
      setShowTaskModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleMarkComplete = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      const updatedProject = { ...project, status: 'Completed' };
      const res = await updateProject(projectId, updatedProject);
      setProjects(prev => prev.map(p => p.id === projectId ? res.data : p));
      if (selectedProject?.id === projectId) {
        setSelectedProject(res.data);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="600" color="primary.main">
            My Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage your projects, create teams and assign tasks
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowModal(true)}
          size="large"
        >
          Create Project
        </Button>
      </Box>

      {managerProjects.length === 0 ? (
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
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first project to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowModal(true)}
          >
            Create Project
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {managerProjects.map(proj => {
            const timelineStatus = getTimelineStatus(proj.startDate, proj.endDate, proj.status);
            const completedTasks = proj.tasks?.filter(t => t.status === 'Done').length || 0;
            const totalTasks = proj.tasks?.length || 0;
            
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
                        <People sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Team: <strong>{(proj.teamMembers?.length || 0)} members</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Group sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Teams: <strong>{proj.teams?.length || 0}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Tasks: <strong>{completedTasks}/{totalTasks}</strong>
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

                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => viewProjectDetails(proj)}
                        size="small"
                      >
                        Manage
                      </Button>
                      <Tooltip title="Edit Project">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditProject(proj)}
                          size="small"
                          sx={{ border: '1px solid', borderColor: 'divider' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create/View Project Modal */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="lg"
        fullWidth
      >
        {!selectedProject ? (
          <form onSubmit={handleCreateProject}>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="600">
                  Create New Project
                </Typography>
                <IconButton onClick={() => setShowModal(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={2} mt={0.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Project Name"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({...projectForm, status: e.target.value})}
                    required
                  >
                    <MenuItem value="Planning">Planning</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" variant="contained" startIcon={<Add />}>
                Create Project
              </Button>
            </DialogActions>
          </form>
        ) : (
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
                <Stack direction="row" spacing={1}>
                  {selectedProject.status !== 'Completed' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleMarkComplete(selectedProject.id)}
                      size="small"
                    >
                      Mark Complete
                    </Button>
                  )}
                  <IconButton onClick={() => setShowModal(false)}>
                    <Close />
                  </IconButton>
                </Stack>
              </Box>
            </DialogTitle>
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={modalTab} onChange={(e, newValue) => setModalTab(newValue)}>
                <Tab label="Overview" />
                <Tab label={`Team (${getTeamMembers(selectedProject).length})`} />
                <Tab label={`Teams (${selectedProject.teams?.length || 0})`} />
                <Tab label={`Tasks (${selectedProject.tasks?.length || 0})`} />
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
                                {selectedProject.teamMembers?.length || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Team Members
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h4" fontWeight="700" color="info.main">
                                {selectedProject.teams?.length || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Teams
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="h4" fontWeight="700" color="success.main">
                                {selectedProject.tasks?.filter(t => t.status === 'Done').length || 0}
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
                                {selectedProject.tasks?.length || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Total Tasks
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Team Members Tab */}
              {modalTab === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Team Members
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {getTeamMembers(selectedProject).length === 0 ? (
                    <Alert severity="info">
                      No team members assigned yet. Admin can add members to this project.
                    </Alert>
                  ) : (
                    <List>
                      {getTeamMembers(selectedProject).map(emp => (
                        <React.Fragment key={emp.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {emp.name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={emp.name}
                              secondary={`${emp.designation} • ${emp.department}`}
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* Teams Tab */}
              {modalTab === 2 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="600">
                      Project Teams
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setShowTeamModal(true)}
                      disabled={getTeamMembers(selectedProject).length === 0}
                    >
                      Create Team
                    </Button>
                  </Box>
                  {getTeamMembers(selectedProject).length === 0 ? (
                    <Alert severity="warning">
                      No team members available. Ask admin to add members to this project first.
                    </Alert>
                  ) : (!selectedProject.teams || selectedProject.teams.length === 0) ? (
                    <Alert severity="info">
                      No teams created yet. Create teams to organize your project members.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {selectedProject.teams.map(team => (
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
                                Members ({team.members?.length || 0}):
                              </Typography>
                              <List dense>
                                {team.members?.map(memberId => {
                                  const member = employees.find(e => e.id === memberId);
                                  return member ? (
                                    <ListItem key={memberId} sx={{ px: 0 }}>
                                      <ListItemAvatar>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                          {member.name.charAt(0)}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={<Typography variant="body2">{member.name}</Typography>}
                                        secondary={<Typography variant="caption">{member.designation}</Typography>}
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

              {/* Tasks Tab */}
              {modalTab === 3 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="600">
                      Project Tasks
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setShowTaskModal(true)}
                      disabled={getTeamMembers(selectedProject).length === 0}
                    >
                      Assign Task
                    </Button>
                  </Box>
                  {getTeamMembers(selectedProject).length === 0 ? (
                    <Alert severity="warning">
                      No team members available. Ask admin to add members to this project first.
                    </Alert>
                  ) : (!selectedProject.tasks || selectedProject.tasks.length === 0) ? (
                    <Alert severity="info">
                      No tasks assigned yet. Assign tasks to team members with deadlines.
                    </Alert>
                  ) : (
                    <>
                      <Box mb={2}>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Chip
                            label={`Total: ${selectedProject.tasks.length}`}
                            color="default"
                          />
                          <Chip
                            label={`Done: ${selectedProject.tasks.filter(t => t.status === 'Done').length}`}
                            color="success"
                          />
                          <Chip
                            label={`In Progress: ${selectedProject.tasks.filter(t => t.status === 'In Progress').length}`}
                            color="info"
                          />
                          <Chip
                            label={`To Do: ${selectedProject.tasks.filter(t => t.status === 'To Do').length}`}
                            color="warning"
                          />
                        </Stack>
                      </Box>
                      <TableContainer component={Paper} variant="outlined">
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell><strong>Task</strong></TableCell>
                              <TableCell><strong>Assigned To</strong></TableCell>
                              <TableCell><strong>Team</strong></TableCell>
                              <TableCell><strong>Deadline</strong></TableCell>
                              <TableCell><strong>Hours</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProject.tasks.map(task => {
                              const assignedEmployee = employees.find(e => e.id === task.assignedTo);
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
                                    {assignedEmployee ? (
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                                          {assignedEmployee.name.charAt(0)}
                                        </Avatar>
                                        <Typography variant="body2">
                                          {assignedEmployee.name}
                                        </Typography>
                                      </Box>
                                    ) : 'N/A'}
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
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setShowModal(false)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleUpdateProject}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="600">
                Edit Project
              </Typography>
              <IconButton onClick={() => setShowEditModal(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectForm.name}
                onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                required
              />
              <TextField
                fullWidth
                select
                label="Status"
                value={projectForm.status}
                onChange={(e) => setProjectForm({...projectForm, status: e.target.value})}
                required
              >
                <MenuItem value="Planning">Planning</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={projectForm.description}
                onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                required
              />
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={projectForm.startDate}
                onChange={(e) => setProjectForm({...projectForm, startDate: e.target.value})}
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={projectForm.endDate}
                onChange={(e) => setProjectForm({...projectForm, endDate: e.target.value})}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Edit />}>
              Update Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Team Modal */}
      <Dialog 
        open={showTeamModal} 
        onClose={() => setShowTeamModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateTeam}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="600">
                Create New Team
              </Typography>
              <IconButton onClick={() => setShowTeamModal(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Team Name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                required
                placeholder="e.g., Frontend Team, Backend Team"
              />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Select Team Members
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto', p: 2 }}>
                  {selectedProject && getTeamMembers(selectedProject).map(emp => (
                    <FormControlLabel
                      key={emp.id}
                      control={
                        <Checkbox
                          checked={teamForm.members.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeamForm({...teamForm, members: [...teamForm.members, emp.id]});
                            } else {
                              setTeamForm({...teamForm, members: teamForm.members.filter(id => id !== emp.id)});
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">{emp.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.designation}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </Paper>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Selected: {teamForm.members.length} member(s)
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setShowTeamModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Add />}>
              Create Team
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog 
        open={showTaskModal} 
        onClose={() => setShowTaskModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCreateTask}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="600">
                Assign New Task
              </Typography>
              <IconButton onClick={() => setShowTaskModal(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                fullWidth
                label="Task Name"
                value={taskForm.name}
                onChange={(e) => setTaskForm({...taskForm, name: e.target.value})}
                required
                placeholder="e.g., Design Homepage, API Integration"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Task Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                required
                placeholder="Describe the task requirements"
              />
              <TextField
                fullWidth
                select
                label="Assign To"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                required
              >
                <MenuItem value="">Select Employee</MenuItem>
                {selectedProject && getTeamMembers(selectedProject).map(emp => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name} - {emp.designation}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Assign to Team (Optional)"
                value={taskForm.teamId}
                onChange={(e) => setTaskForm({...taskForm, teamId: e.target.value})}
              >
                <MenuItem value="">No Team</MenuItem>
                {selectedProject && selectedProject.teams?.map(team => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deadline"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Estimated Hours"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({...taskForm, estimatedHours: e.target.value})}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                select
                label="Status"
                value={taskForm.status}
                onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                required
              >
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Add />}>
              Assign Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Projects;