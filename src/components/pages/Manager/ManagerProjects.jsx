import React, { useState, useEffect } from "react";
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
  Tooltip,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import {
  FolderOpen,
  Visibility,
  People,
  CalendarToday,
  Group,
  Assignment,
  Close,
  Add,
  Edit,
  CheckCircle,
  AccessTime,
  Warning,
  Delete,
  TrendingUp,
} from "@mui/icons-material";

import {
  getProjectsByManager,
  getEmployees,
  createProject,
  updateProject,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getTeamsByProject,
  createTeam,
  updateTeam,
  deleteTeam,
} from "../../../api/api";

const Projects = () => {
  const managerId = parseInt(localStorage.getItem("userId"), 10);

  // State variables
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [modalTab, setModalTab] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Planning",
  });

  const [teamForm, setTeamForm] = useState({
    name: "",
    members: [],
  });

  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    assignedTo: "",
    deadline: "",
    estimatedHours: "",
    status: "To Do",
  });

  // Fetch projects and employees data on mount
  useEffect(() => {
    fetchData();
  }, [managerId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, employeesRes] = await Promise.all([
        getProjectsByManager(managerId),
        getEmployees(),
      ]);
      
      const projectsData = projectsRes.data || [];
      
      // Enrich projects with tasks and teams
      const enrichedProjects = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const [tasksRes, teamsRes] = await Promise.all([
              getTasksByProject(project.id),
              getTeamsByProject(project.id),
            ]);
            
            const tasks = tasksRes.data || [];
            const teams = teamsRes.data || [];
            
            // Calculate overall progress
            const completedTasks = tasks.filter(t => t.status === 'Done').length;
            const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
            
            return {
              ...project,
              tasks,
              teams,
              progress
            };
          } catch (err) {
            console.error(`Error fetching data for project ${project.id}:`, err);
            return {
              ...project,
              tasks: [],
              teams: [],
              progress: 0
            };
          }
        })
      );
      
      setProjects(enrichedProjects);
      setEmployees(employeesRes.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
      setError("Failed to load projects or employees.");
    } finally {
      setLoading(false);
    }
  };

  const refreshProjectData = async (projectId) => {
    try {
      const [tasksRes, teamsRes] = await Promise.all([
        getTasksByProject(projectId),
        getTeamsByProject(projectId),
      ]);
      
      const tasks = tasksRes.data || [];
      const teams = teamsRes.data || [];
      const completedTasks = tasks.filter(t => t.status === 'Done').length;
      const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, tasks, teams, progress }
          : p
      ));
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(prev => ({ ...prev, tasks, teams, progress }));
      }
    } catch (err) {
      console.error("Error refreshing project data:", err);
    }
  };

  // Utility: Get timeline status for a project
  const getTimelineStatus = (startDate, endDate, status) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (status === "Completed") {
      return { label: "Completed", color: "success", icon: <CheckCircle /> };
    }
    if (today > end) {
      return { label: "Overdue", color: "error", icon: <Warning /> };
    }
    if (today < start) {
      return { label: "Not Started", color: "default", icon: <AccessTime /> };
    }
    const totalDuration = end - start;
    const elapsed = today - start;
    const percentElapsed = (elapsed / totalDuration) * 100;

    if (percentElapsed < 50) {
      return { label: "On Track", color: "success", icon: <CheckCircle /> };
    } else if (percentElapsed < 80) {
      return { label: "In Progress", color: "info", icon: <AccessTime /> };
    } else {
      return { label: "Near Deadline", color: "warning", icon: <Warning /> };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "info";
      case "Planning": return "warning";
      case "To Do": return "default";
      case "Done": return "success";
      default: return "default";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success.main';
    if (progress >= 50) return 'info.main';
    if (progress >= 30) return 'warning.main';
    return 'error.main';
  };

  // --- Project Handlers ---
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const newProject = {
        ...projectForm,
        managerId: managerId,
        teamMembers: [],
      };
      await createProject(newProject);
      await fetchData();
      setProjectForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "Planning",
      });
      setShowModal(false);
      setError(null);
    } catch (err) {
      console.error("Error creating project", err);
      setError("Failed to create project.");
    } finally {
      setUpdating(false);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updatedProject = { ...selectedProject, ...projectForm };
      await updateProject(selectedProject.id, updatedProject);
      await fetchData();
      setShowEditModal(false);
      setError(null);
    } catch (err) {
      console.error("Error updating project", err);
      setError("Failed to update project.");
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkComplete = async (projectId) => {
    setUpdating(true);
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;
      const updatedProject = { ...project, status: "Completed" };
      await updateProject(projectId, updatedProject);
      await fetchData();
      setError(null);
    } catch (err) {
      console.error("Error marking complete", err);
      setError("Failed to mark project completed.");
    } finally {
      setUpdating(false);
    }
  };

  const getTeamMembers = (project) =>
    employees.filter((emp) => project.teamMembers?.includes(emp.id));

  // --- Team Handlers ---
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const newTeam = {
        name: teamForm.name,
        projectId: selectedProject.id,
        members: teamForm.members,
      };
      await createTeam(newTeam);
      await refreshProjectData(selectedProject.id);
      setTeamForm({ name: "", members: [] });
      setShowTeamModal(false);
      setError(null);
    } catch (err) {
      console.error("Error creating team", err);
      setError("Failed to create team.");
    } finally {
      setUpdating(false);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      members: team.members || [],
    });
    setShowTeamModal(true);
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updatedTeam = {
        ...editingTeam,
        name: teamForm.name,
        members: teamForm.members,
        projectId: selectedProject.id,
      };
      await updateTeam(editingTeam.id, updatedTeam);
      await refreshProjectData(selectedProject.id);
      setTeamForm({ name: "", members: [] });
      setEditingTeam(null);
      setShowTeamModal(false);
      setError(null);
    } catch (err) {
      console.error("Error updating team", err);
      setError("Failed to update team.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    setUpdating(true);
    try {
      await deleteTeam(teamId);
      await refreshProjectData(selectedProject.id);
      setError(null);
    } catch (err) {
      console.error("Error deleting team", err);
      setError("Failed to delete team.");
    } finally {
      setUpdating(false);
    }
  };

  // --- Task Handlers ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const newTask = {
        name: taskForm.name,
        description: taskForm.description,
        assignedTo: parseInt(taskForm.assignedTo),
        projectId: selectedProject.id,
        deadline: taskForm.deadline,
        estimatedHours: parseInt(taskForm.estimatedHours),
        status: taskForm.status,
      };
      await createTask(newTask);
      await refreshProjectData(selectedProject.id);
      setTaskForm({
        name: "",
        description: "",
        assignedTo: "",
        deadline: "",
        estimatedHours: "",
        status: "To Do",
      });
      setShowTaskModal(false);
      setError(null);
    } catch (err) {
      console.error("Error creating task", err);
      setError("Failed to create task.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setUpdating(true);
    try {
      await deleteTask(taskId);
      await refreshProjectData(selectedProject.id);
      setError(null);
    } catch (err) {
      console.error("Error deleting task", err);
      setError("Failed to delete task.");
    } finally {
      setUpdating(false);
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={600} color="primary.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          My Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedProject(null);
            setShowModal(true);
          }}
          size="large"
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Create Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 8 },
            textAlign: "center",
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <FolderOpen sx={{ fontSize: { xs: 60, sm: 80 }, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first project to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedProject(null);
              setShowModal(true);
            }}
          >
            Create Project
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projects.map((proj) => {
            const timelineStatus = getTimelineStatus(
              proj.startDate,
              proj.endDate,
              proj.status
            );
            const completedTasks = proj.tasks?.filter((t) => t.status === "Done").length || 0;
            const totalTasks = proj.tasks?.length || 0;

            return (
              <Grid item xs={12} sm={6} lg={4} key={proj.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 2,
                      }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <FolderOpen />
                      </Avatar>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
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
                    <Typography variant="h6" fontWeight={600} noWrap gutterBottom>
                      {proj.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: 40,
                        mb: 2,
                      }}
                    >
                      {proj.description}
                    </Typography>

                    {/* Progress Bar */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                          <TrendingUp sx={{ fontSize: 14 }} />
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="600" sx={{ color: getProgressColor(proj.progress || 0) }}>
                          {proj.progress || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={proj.progress || 0} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getProgressColor(proj.progress || 0)
                          }
                        }} 
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <People sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Team: <strong>{proj.teamMembers?.length || 0}</strong>
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Group sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Teams: <strong>{proj.teams?.length || 0}</strong>
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Assignment sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Tasks: <strong>{completedTasks}/{totalTasks}</strong>
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {proj.startDate} - {proj.endDate}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => {
                          setSelectedProject(proj);
                          setShowModal(true);
                          setModalTab(0);
                        }}
                        size="small"
                      >
                        Manage
                      </Button>
                      <Tooltip title="Edit Project">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditProject(proj)}
                          size="small"
                          sx={{ border: "1px solid", borderColor: "divider" }}
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

      {/* Create Project Modal */}
      <Dialog
        open={showModal && !selectedProject}
        onClose={() => setShowModal(false)}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <form onSubmit={handleCreateProject}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              Create New Project
            </Typography>
            <IconButton onClick={() => setShowModal(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={projectForm.status}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, status: e.target.value })
                  }
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
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, description: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={projectForm.startDate}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, startDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={projectForm.endDate}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, endDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Add />} disabled={updating}>
              {updating ? <CircularProgress size={20} /> : 'Create Project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <form onSubmit={handleUpdateProject}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              Edit Project
            </Typography>
            <IconButton onClick={() => setShowEditModal(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Project Name"
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, name: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                select
                label="Status"
                value={projectForm.status}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, status: e.target.value })
                }
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
                onChange={(e) =>
                  setProjectForm({ ...projectForm, description: e.target.value })
                }
                required
              />
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={projectForm.startDate}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={projectForm.endDate}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" startIcon={<Edit />} disabled={updating}>
              {updating ? <CircularProgress size={20} /> : 'Update Project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Project Modal with Tabs */}
      <Dialog
        open={showModal && !!selectedProject}
        onClose={() => {
          setShowModal(false);
          setSelectedProject(null);
          setModalTab(0);
        }}
        maxWidth="lg"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        {selectedProject && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {selectedProject.name}
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                  <Chip
                    label={selectedProject.status}
                    size="small"
                    color={getStatusColor(selectedProject.status)}
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${selectedProject.progress || 0}% Complete`}
                    size="small"
                    color={selectedProject.progress >= 80 ? 'success' : selectedProject.progress >= 50 ? 'info' : selectedProject.progress >= 30 ? 'warning' : 'error'}
                  />
                  {selectedProject.status !== "Completed" && (
                    <Button
                      variant="contained"
                      size="small"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleMarkComplete(selectedProject.id)}
                      disabled={updating}
                    >
                      Mark Complete
                    </Button>
                  )}
                </Stack>
              </Box>
              <IconButton
                onClick={() => {
                  setShowModal(false);
                  setSelectedProject(null);
                  setModalTab(0);
                }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <Divider />

            <Tabs
              value={modalTab}
              onChange={(e, newValue) => setModalTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Project details tabs"
            >
              <Tab label="Overview" />
              <Tab label={`Team Members (${selectedProject.teamMembers?.length || 0})`} />
              <Tab label={`Teams (${selectedProject.teams?.length || 0})`} />
              <Tab label={`Tasks (${selectedProject.tasks?.length || 0})`} />
            </Tabs>

            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
              {/* Overview Tab */}
              {modalTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Project Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      {/* Progress Overview */}
                      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle2" fontWeight="600" mb={1}>Overall Progress</Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Box flex={1}>
                            <LinearProgress 
                              variant="determinate" 
                              value={selectedProject.progress || 0} 
                              sx={{ 
                                height: 10, 
                                borderRadius: 1,
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getProgressColor(selectedProject.progress || 0)
                                }
                              }} 
                            />
                          </Box>
                          <Typography variant="h6" fontWeight="700" sx={{ color: getProgressColor(selectedProject.progress || 0) }}>
                            {selectedProject.progress || 0}%
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {selectedProject.tasks?.filter(t => t.status === 'Done').length || 0} of {selectedProject.tasks?.length || 0} tasks completed
                        </Typography>
                      </Paper>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {selectedProject.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <strong>Start Date:</strong> {selectedProject.startDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <strong>End Date:</strong> {selectedProject.endDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        <strong>Timeline Status:</strong>{" "}
                        <Chip
                          label={getTimelineStatus(
                            selectedProject.startDate,
                            selectedProject.endDate,
                            selectedProject.status
                          ).label}
                          size="small"
                          color={getTimelineStatus(
                            selectedProject.startDate,
                            selectedProject.endDate,
                            selectedProject.status
                          ).color}
                          icon={getTimelineStatus(
                            selectedProject.startDate,
                            selectedProject.endDate,
                            selectedProject.status
                          ).icon}
                        />
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Quick Stats
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography
                                variant="h4"
                                fontWeight={700}
                                color="primary.main"
                                textAlign="center"
                              >
                                {selectedProject.teamMembers?.length || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" textAlign="center">
                                Team Members
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography
                                variant="h4"
                                fontWeight={700}
                                color="info.main"
                                textAlign="center"
                              >
                                {selectedProject.teams?.length || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" textAlign="center">
                                Teams
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography
                                variant="h4"
                                fontWeight={700}
                                color="success.main"
                                textAlign="center"
                              >
                                {selectedProject.tasks?.filter((t) => t.status === "Done").length || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" textAlign="center">
                                Completed Tasks
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={6}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography
                                variant="h4"
                                fontWeight={700}
                                color="warning.main"
                                textAlign="center"
                              >
                                {selectedProject.tasks?.length || 0}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" textAlign="center">
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
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Team Members
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {getTeamMembers(selectedProject).length === 0 ? (
                    <Alert severity="info">
                      No team members assigned yet. Admin can add members to this project.
                    </Alert>
                  ) : (
                    <List>
                      {getTeamMembers(selectedProject).map((emp) => (
                        <ListItem key={emp.id}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              {emp.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={emp.name}
                            secondary={`${emp.designation} | ${emp.department}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* Teams Tab */}
              {modalTab === 2 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Project Teams
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        setEditingTeam(null);
                        setTeamForm({ name: "", members: [] });
                        setShowTeamModal(true);
                      }}
                      disabled={getTeamMembers(selectedProject).length === 0}
                      size={window.innerWidth < 600 ? "small" : "medium"}
                    >
                      Create Team
                    </Button>
                  </Box>
                  {getTeamMembers(selectedProject).length === 0 ? (
                    <Alert severity="warning">
                      No team members available. Ask admin to add members to this project first.
                    </Alert>
                  ) : !selectedProject.teams || selectedProject.teams.length === 0 ? (
                    <Alert severity="info">
                      No teams created yet. Create teams to organize your project members.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {selectedProject.teams.map((team) => (
                        <Grid item xs={12} sm={6} md={4} key={team.id}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                <Typography variant="h6" fontWeight={600}>
                                  {team.name}
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                  <Tooltip title="Edit Team">
                                    <IconButton size="small" onClick={() => handleEditTeam(team)}>
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Team">
                                    <IconButton size="small" color="error" onClick={() => handleDeleteTeam(team.id)}>
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                Created: {team.createdAt || 'N/A'}
                              </Typography>
                              <Typography variant="body2" fontWeight={600} gutterBottom>
                                Members ({team.members?.length || 0})
                              </Typography>
                              <List dense>
                                {team.members?.map((memberId) => {
                                  const member = employees.find((e) => e.id === memberId);
                                  return member ? (
                                    <ListItem key={memberId} sx={{ px: 0 }}>
                                      <ListItemAvatar>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                          {member.name.charAt(0)}
                                        </Avatar>
                                      </ListItemAvatar>
                                      <ListItemText
                                        primary={<Typography variant="body2">{member.name}</Typography>}
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

              {/* Tasks Tab */}
              {modalTab === 3 && (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Project Tasks
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setShowTaskModal(true)}
                      disabled={getTeamMembers(selectedProject).length === 0}
                      size={window.innerWidth < 600 ? "small" : "medium"}
                    >
                      Assign Task
                    </Button>
                  </Box>
                  {getTeamMembers(selectedProject).length === 0 ? (
                    <Alert severity="warning">
                      No team members available. Ask admin to add members to this project first.
                    </Alert>
                  ) : !selectedProject.tasks || selectedProject.tasks.length === 0 ? (
                    <Alert severity="info">
                      No tasks assigned yet. Assign tasks to team members with deadlines.
                    </Alert>
                  ) : (
                    <>
                      <Box mb={2}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Chip label={`Total: ${selectedProject.tasks.length}`} color="default" size="small" />
                          <Chip
                            label={`Done: ${selectedProject.tasks.filter((t) => t.status === "Done").length}`}
                            color="success"
                            size="small"
                          />
                          <Chip
                            label={`In Progress: ${selectedProject.tasks.filter((t) => t.status === "In Progress").length}`}
                            color="info"
                            size="small"
                          />
                          <Chip
                            label={`To Do: ${selectedProject.tasks.filter((t) => t.status === "To Do").length}`}
                            color="warning"
                            size="small"
                          />
                        </Stack>
                      </Box>
                      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                        <Table size={window.innerWidth < 600 ? "small" : "medium"}>
                          <TableHead sx={{ bgcolor: "grey.50" }}>
                            <TableRow>
                              <TableCell><strong>Task</strong></TableCell>
                              <TableCell><strong>Assigned To</strong></TableCell>
                              <TableCell><strong>Deadline</strong></TableCell>
                              <TableCell><strong>Hours</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProject.tasks.map((task) => {
                              const assignedEmployee = employees.find((e) => e.id === task.assignedTo);
                              const taskDeadline = new Date(task.deadline);
                              const today = new Date();
                              const isOverdue = today > taskDeadline && task.status !== "Done";
                              return (
                                <TableRow key={task.id}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>
                                      {task.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {task.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {assignedEmployee ? (
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Avatar
                                          sx={{ width: 24, height: 24, bgcolor: "primary.main" }}
                                        >
                                          {assignedEmployee.name.charAt(0)}
                                        </Avatar>
                                        <Typography variant="body2">{assignedEmployee.name}</Typography>
                                      </Box>
                                    ) : (
                                      "N/A"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" color={isOverdue ? "error.main" : "text.primary"}>
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
                                      icon={task.status === "Done" ? <CheckCircle /> : undefined}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Tooltip title="Delete Task">
                                      <IconButton 
                                        size="small" 
                                        color="error" 
                                        onClick={() => handleDeleteTask(task.id)}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
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
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
              <Button 
                onClick={() => {
                  setShowModal(false);
                  setSelectedProject(null);
                  setModalTab(0);
                }}
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create/Edit Team Modal */}
      <Dialog
        open={showTeamModal}
        onClose={() => {
          setShowTeamModal(false);
          setEditingTeam(null);
          setTeamForm({ name: "", members: [] });
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              {editingTeam ? 'Edit Team' : 'Create New Team'}
            </Typography>
            <IconButton onClick={() => {
              setShowTeamModal(false);
              setEditingTeam(null);
              setTeamForm({ name: "", members: [] });
            }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Team Name"
                value={teamForm.name}
                onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                placeholder="e.g., Frontend Team, Backend Team"
                required
              />
              <Typography variant="subtitle2" gutterBottom>
                Select Team Members
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: "auto", p: 2 }}>
                {selectedProject &&
                  getTeamMembers(selectedProject).map((emp) => (
                    <FormControlLabel
                      key={emp.id}
                      control={
                        <Checkbox
                          checked={teamForm.members.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeamForm({
                                ...teamForm,
                                members: [...teamForm.members, emp.id],
                              });
                            } else {
                              setTeamForm({
                                ...teamForm,
                                members: teamForm.members.filter((id) => id !== emp.id),
                              });
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
              <Typography variant="caption" color="text.secondary">
                Selected {teamForm.members.length} member(s)
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => {
              setShowTeamModal(false);
              setEditingTeam(null);
              setTeamForm({ name: "", members: [] });
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={editingTeam ? <Edit /> : <Add />}
              disabled={updating}
            >
              {updating ? <CircularProgress size={20} /> : (editingTeam ? 'Update Team' : 'Create Team')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog
        open={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setTaskForm({
            name: "",
            description: "",
            assignedTo: "",
            deadline: "",
            estimatedHours: "",
            status: "To Do",
          });
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <form onSubmit={handleCreateTask}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600}>
              Assign New Task
            </Typography>
            <IconButton onClick={() => {
              setShowTaskModal(false);
              setTaskForm({
                name: "",
                description: "",
                assignedTo: "",
                deadline: "",
                estimatedHours: "",
                status: "To Do",
              });
            }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                fullWidth
                label="Task Name"
                value={taskForm.name}
                onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                placeholder="e.g., Design Homepage, API Integration"
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Task Description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Describe the task requirements"
                required
              />
              <TextField
                fullWidth
                select
                label="Assign To"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                required
              >
                <MenuItem value="">Select Employee</MenuItem>
                {selectedProject &&
                  getTeamMembers(selectedProject).map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.designation}
                    </MenuItem>
                  ))}
              </TextField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Deadline"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Estimated Hours"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                    inputProps={{ min: 1 }}
                    required
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                select
                label="Status"
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                required
              >
                <MenuItem value="To Do">To Do</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Done">Done</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => {
              setShowTaskModal(false);
              setTaskForm({
                name: "",
                description: "",
                assignedTo: "",
                deadline: "",
                estimatedHours: "",
                status: "To Do",
              });
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<Add />}
              disabled={updating}
            >
              {updating ? <CircularProgress size={20} /> : 'Assign Task'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Projects;