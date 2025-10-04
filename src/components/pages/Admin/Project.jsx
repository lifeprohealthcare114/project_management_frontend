// pages/admin/Projects.jsx - Updated Version
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import {
  Add,
  FolderOpen,
  Person,
  CalendarToday,
  Group,
  Close,
  Visibility,
  Assignment
} from '@mui/icons-material';

const Projects = ({ projects, setProjects, employees, setEmployees }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '', description: '', startDate: '', endDate: '', managerId: '', teamMembers: [], status: 'Planning'
  });

  const handleProjectSubmit = (e) => {
    e.preventDefault();
    const newProject = { 
      id: Date.now(), 
      ...projectForm, 
      progress: 0,
      teams: [],
      tasks: []
    };
    setProjects([...projects, newProject]);
    const updatedEmployees = employees.map(emp => {
      if (projectForm.teamMembers.includes(emp.id) || emp.id === parseInt(projectForm.managerId)) {
        return { ...emp, projects: [...(emp.projects || []), newProject.id] };
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    setProjectForm({ name: '', description: '', startDate: '', endDate: '', managerId: '', teamMembers: [], status: 'Planning' });
    setShowProjectModal(false);
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const getProjectManager = (project) => {
    return employees.find(emp => emp.id === parseInt(project.managerId));
  };

  const getTeamMembers = (project) => {
    return employees.filter(emp => project.teamMembers.includes(emp.id));
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="600" color="primary.main">
            Project Management
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create and manage projects across your organization
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowProjectModal(true)}
          size="large"
        >
          Create New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
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
            No projects created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by creating your first project
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowProjectModal(true)}
          >
            Create Your First Project
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map(proj => {
            const manager = getProjectManager(proj);
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
                          Manager: <strong>{manager ? manager.name : 'N/A'}</strong>
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <Group sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Team: <strong>{proj.teamMembers.length + 1} members</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Teams: <strong>{proj.teams?.length || 0}</strong> | Tasks: <strong>{proj.tasks?.length || 0}</strong>
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
            );
          })}
        </Grid>
      )}

      {/* Create Project Modal */}
      <Dialog 
        open={showProjectModal} 
        onClose={() => setShowProjectModal(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleProjectSubmit}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="600">
                Create New Project
              </Typography>
              <IconButton onClick={() => setShowProjectModal(false)}>
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
                  placeholder="Enter project name"
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
                  placeholder="Describe the project objectives and scope"
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Assign Manager"
                  value={projectForm.managerId}
                  onChange={(e) => setProjectForm({...projectForm, managerId: e.target.value})}
                  required
                >
                  <MenuItem value="">Select Manager</MenuItem>
                  {employees.filter(e => e.role === 'Manager').map(manager => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.designation}
                    </MenuItem>
                  ))}
                </TextField>
                {employees.filter(e => e.role === 'Manager').length === 0 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    No managers available. Please add managers first.
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Team Members
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    maxHeight: 250, 
                    overflowY: 'auto',
                    p: 2
                  }}
                >
                  {employees.filter(e => e.role === 'Employee').length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No employees available to add to team
                    </Typography>
                  ) : (
                    <Grid container spacing={1}>
                      {employees.filter(e => e.role === 'Employee').map(emp => (
                        <Grid item xs={12} key={emp.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={projectForm.teamMembers.includes(emp.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectForm({
                                      ...projectForm,
                                      teamMembers: [...projectForm.teamMembers, emp.id]
                                    });
                                  } else {
                                    setProjectForm({
                                      ...projectForm,
                                      teamMembers: projectForm.teamMembers.filter(id => id !== emp.id)
                                    });
                                  }
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  {emp.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {emp.designation} • {emp.department}
                                </Typography>
                              </Box>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Selected: {projectForm.teamMembers.length} member(s)
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setShowProjectModal(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<Add />}
            >
              Create Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Project Details Modal */}
      <Dialog 
        open={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)}
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
                  <Chip 
                    label={selectedProject.status}
                    size="small"
                    color={getStatusColor(selectedProject.status)}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <IconButton onClick={() => setShowDetailsModal(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
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
                        <strong>Manager:</strong> {getProjectManager(selectedProject)?.name || 'N/A'}
                      </Typography>
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          <strong>Progress:</strong>
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={selectedProject.progress}
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {selectedProject.progress}% Complete
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Team Members ({getTeamMembers(selectedProject).length + 1})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List dense>
                      {/* Manager */}
                      {getProjectManager(selectedProject) && (
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'warning.main' }}>
                              {getProjectManager(selectedProject).name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={getProjectManager(selectedProject).name}
                            secondary={
                              <>
                                <Chip label="Manager" size="small" color="warning" sx={{ mr: 1 }} />
                                {getProjectManager(selectedProject).designation}
                              </>
                            }
                          />
                        </ListItem>
                      )}
                      {/* Team Members */}
                      {getTeamMembers(selectedProject).map(emp => (
                        <ListItem key={emp.id}>
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
                      ))}
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Teams Created by Manager ({selectedProject.teams?.length || 0})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {(!selectedProject.teams || selectedProject.teams.length === 0) ? (
                      <Alert severity="info">
                        No teams created yet. Manager can create teams for this project.
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {selectedProject.teams.map(team => (
                          <Grid item xs={12} sm={6} md={4} key={team.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="subtitle2" fontWeight="600">
                                  {team.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {team.members.length} members
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                      Tasks ({selectedProject.tasks?.length || 0})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {(!selectedProject.tasks || selectedProject.tasks.length === 0) ? (
                      <Alert severity="info">
                        No tasks assigned yet. Manager can assign tasks to team members.
                      </Alert>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Task</TableCell>
                              <TableCell>Assigned To</TableCell>
                              <TableCell>Deadline</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProject.tasks.map(task => {
                              const assignedEmployee = employees.find(e => e.id === task.assignedTo);
                              return (
                                <TableRow key={task.id}>
                                  <TableCell>{task.name}</TableCell>
                                  <TableCell>{assignedEmployee?.name || 'N/A'}</TableCell>
                                  <TableCell>{task.deadline}</TableCell>
                                  <TableCell>
                                    <Chip label={task.status} size="small" />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setShowDetailsModal(false)} variant="contained">
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