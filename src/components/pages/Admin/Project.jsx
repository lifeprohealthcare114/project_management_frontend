// FILE: src/pages/Projects.jsx
import React, { useState, useEffect } from "react";
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
  ListItemAvatar,
  Tabs,
  Tab,
  Tooltip,
  Snackbar,
  LinearProgress,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Add,
  FolderOpen,
  Person,
  CalendarToday,
  Group,
  Close,
  Visibility,
  Assignment,
  Edit,
  PersonAdd,
  CheckCircle,
  AccessTime,
  Warning,
  AddTask,
  Search,
  FilterList,
  Delete,
} from "@mui/icons-material";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getEmployees,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProject,
} from "../../../api/api";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsTab, setDetailsTab] = useState(0);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    managerId: "",
    teamMembers: [],
    status: "Planning",
  });
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    assignedTo: "",
    teamId: "",
    deadline: "",
    estimatedHours: "",
    status: "To Do",
  });
  const [newMembers, setNewMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [timelineFilter, setTimelineFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("All");

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [projects, searchQuery, statusFilter, timelineFilter, managerFilter]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (proj) =>
          proj.name.toLowerCase().includes(query) ||
          proj.description.toLowerCase().includes(query) ||
          getProjectManager(proj)?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((proj) => proj.status === statusFilter);
    }

    // Timeline filter
    if (timelineFilter !== "All") {
      filtered = filtered.filter((proj) => {
        const timeline = getTimelineStatus(
          proj.startDate,
          proj.endDate,
          proj.status
        );
        return timeline.label === timelineFilter;
      });
    }

    // Manager filter
    if (managerFilter !== "All") {
      filtered = filtered.filter(
        (proj) => String(proj.managerId) === String(managerFilter)
      );
    }

    setFilteredProjects(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setTimelineFilter("All");
    setManagerFilter("All");
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await getProjects();
      setProjects(res.data || []);
      setError(null);
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to load projects";
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
      console.error("Error fetching projects:", e);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const res = await getEmployees();
      setEmployees(res.data || []);
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to load employees";
      console.error("Error fetching employees:", e);
      showSnackbar(errorMsg, "error");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProject = {
        ...projectForm,
        teams: [],
        tasks: [],
      };
      const res = await createProject(newProject);
      setProjects((prev) => [...prev, res.data]);
      setProjectForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        managerId: "",
        teamMembers: [],
        status: "Planning",
      });
      setShowProjectModal(false);
      showSnackbar("Project created successfully");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to create project";
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
      console.error("Error creating project:", e);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      managerId: String(project.managerId),
      teamMembers: project.teamMembers || [],
      status: project.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = {
        ...selectedProject,
        ...projectForm,
      };
      const res = await updateProject(selectedProject.id, updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? res.data : p))
      );
      setShowEditModal(false);
      setSelectedProject(null);
      setProjectForm({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        managerId: "",
        teamMembers: [],
        status: "Planning",
      });
      showSnackbar("Project updated successfully");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to update project";
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
      console.error("Error updating project:", e);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      showSnackbar("Project deleted successfully");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to delete project";
      showSnackbar(errorMsg, "error");
    }
  };

  const handleAddMembers = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = {
        ...selectedProject,
        teamMembers: [
          ...new Set([...(selectedProject.teamMembers || []), ...newMembers]),
        ],
      };
      const res = await updateProject(selectedProject.id, updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? res.data : p))
      );
      setSelectedProject(res.data);
      setNewMembers([]);
      setShowAddMemberModal(false);
      showSnackbar("Members added successfully");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to add members";
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
      console.error("Error adding members:", e);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        name: taskForm.name,
        description: taskForm.description,
        assignedTo: parseInt(taskForm.assignedTo),
        deadline: taskForm.deadline,
        estimatedHours: parseInt(taskForm.estimatedHours),
        status: taskForm.status,
        projectId: selectedProject.id,
      };

      const res = await createTask(newTask);

      // Refresh project tasks
      const updatedProject = {
        ...selectedProject,
        tasks: [...(selectedProject.tasks || []), res.data],
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? updatedProject : p))
      );
      setSelectedProject(updatedProject);

      setTaskForm({
        name: "",
        description: "",
        assignedTo: "",
        teamId: "",
        deadline: "",
        estimatedHours: "",
        status: "To Do",
      });
      setShowAddTaskModal(false);
      showSnackbar("Task added successfully");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to add task";
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
      console.error("Error adding task:", e);
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setTaskForm({
      name: task.name,
      description: task.description,
      assignedTo: String(task.assignedTo),
      teamId: task.teamId || "",
      deadline: task.deadline,
      estimatedHours: String(task.estimatedHours),
      status: task.status,
    });
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const updatedTaskData = {
        ...selectedTask,
        name: taskForm.name,
        description: taskForm.description,
        assignedTo: parseInt(taskForm.assignedTo),
        deadline: taskForm.deadline,
        estimatedHours: parseInt(taskForm.estimatedHours),
        status: taskForm.status,
      };

      const res = await updateTask(selectedTask.id, updatedTaskData);

      const updatedProject = {
        ...selectedProject,
        tasks: selectedProject.tasks.map((t) =>
          t.id === selectedTask.id ? res.data : t
        ),
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? updatedProject : p))
      );
      setSelectedProject(updatedProject);

      setShowEditTaskModal(false);
      setSelectedTask(null);
      setTaskForm({
        name: "",
        description: "",
        assignedTo: "",
        teamId: "",
        deadline: "",
        estimatedHours: "",
        status: "To Do",
      });
      showSnackbar("Task updated successfully");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to update task";
      showSnackbar(errorMsg, "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);

      const updatedProject = {
        ...selectedProject,
        tasks: selectedProject.tasks.filter((t) => t.id !== taskId),
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? updatedProject : p))
      );
      setSelectedProject(updatedProject);

      showSnackbar("Task deleted successfully");
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Failed to delete task";
      showSnackbar(errorMsg, "error");
    }
  };

  const handleMarkComplete = async (projectId) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      const updatedProject = {
        ...project,
        status: "Completed",
      };
      const res = await updateProject(projectId, updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? res.data : p))
      );
      if (selectedProject?.id === projectId) {
        setSelectedProject(res.data);
      }
      showSnackbar("Project marked as completed");
    } catch (e) {
      const errorMsg =
        e.response?.data?.message || "Failed to mark project as complete";
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
      console.error("Error marking project complete:", e);
    }
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
    setDetailsTab(0);
  };

const getProjectManager = (project) => project?.manager || null;


  const getTeamMembers = (project) => {
    return employees.filter((emp) => project.teamMembers?.includes(emp.id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "success";
      case "In Progress":
        return "info";
      case "Planning":
        return "warning";
      default:
        return "default";
    }
  };

  const getAvailableEmployees = () => {
    if (!selectedProject) return [];
    return employees.filter(
      (e) =>
        e.role?.toLowerCase() === "employee" &&
        !selectedProject.teamMembers?.includes(e.id)
    );
  };

  const getAssignableMembers = () => {
    if (!selectedProject) return [];
    const manager = getProjectManager(selectedProject);
    const teamMembers = getTeamMembers(selectedProject);
    return manager ? [manager, ...teamMembers] : teamMembers;
  };

const getUniqueManagers = () => {
  // Extract all manager objects from projects
  const managers = projects
    .map((p) => p.manager)  
    .filter(Boolean);        

  // Remove duplicates by id
  const uniqueManagers = [];
  const ids = new Set();
  managers.forEach((mgr) => {
    if (!ids.has(mgr.id)) {
      uniqueManagers.push(mgr);
      ids.add(mgr.id);
    }
  });

  return uniqueManagers;
};

  if (loadingProjects || loadingEmployees) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Box textAlign="center">
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography variant="h6">Loading projects...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header and Create Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider" }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Status</MenuItem>
                <MenuItem value="Planning">Planning</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Timeline</InputLabel>
              <Select
                value={timelineFilter}
                label="Timeline"
                onChange={(e) => setTimelineFilter(e.target.value)}
              >
                <MenuItem value="All">All Timeline</MenuItem>
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="On Track">On Track</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Near Deadline">Near Deadline</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
      <Grid item xs={12} sm={6} md={2}>
  <FormControl fullWidth size="small">
    <InputLabel>Manager</InputLabel>
    <Select
      value={managerFilter}
      label="Manager"
      onChange={(e) => setManagerFilter(e.target.value)}
    >
      <MenuItem value="All">All Managers</MenuItem>
      {getUniqueManagers().map((manager) => (
        <MenuItem key={manager.id} value={manager.id}>
          {manager.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProjects.length} of {projects.length} projects
          </Typography>
        </Box>
      </Paper>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: "center",
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <FolderOpen sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {projects.length === 0
              ? "No projects created yet"
              : "No projects match your filters"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {projects.length === 0
              ? "Start by creating your first project"
              : "Try adjusting your search or filters"}
          </Typography>
          {projects.length === 0 ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowProjectModal(true)}
            >
              Create Your First Project
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
      {filteredProjects.map((proj) => {
  const manager = getProjectManager(proj);
  const timelineStatus = getTimelineStatus(
    proj.startDate,
    proj.endDate,
    proj.status
  );
            const completedTasks =
              proj.tasks?.filter((t) => t.status === "Done").length || 0;
            const totalTasks = proj.tasks?.length || 0;

            return (
              <Grid item xs={12} md={6} lg={4} key={proj.id}>
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
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={2}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
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
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: 40,
                      }}
                    >
                      {proj.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Manager: <strong>{manager ? manager.name : "Not Assigned"}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Group sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Team:{" "}
                          <strong>
                            {(proj.teamMembers?.length || 0) + (manager ? 1 : 0)} members
                          </strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment sx={{ fontSize: 18, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          Tasks: <strong>{completedTasks}/{totalTasks}</strong>
                          {totalTasks > 0 && ` (${Math.round((completedTasks / totalTasks) * 100)}%)`}
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
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
                        View
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
                      <Tooltip title="Add Task">
                        <IconButton
                          color="secondary"
                          onClick={() => {
                            setSelectedProject(proj);
                            setShowAddTaskModal(true);
                          }}
                          size="small"
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <AddTask fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Project">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteProject(proj.id)}
                          size="small"
                          sx={{ border: "1px solid", borderColor: "divider" }}
                        >
                          <Delete fontSize="small" />
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

      {/* Modals for Create/Edit Project, Add/Edit Task, Add Members, and View Details */}



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
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, managerId: e.target.value })}
                  required
                >
                  <MenuItem value="">Select Manager</MenuItem>
                  {employees.filter(e => e.role?.toLowerCase() === 'manager').map(manager => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.designation}
                    </MenuItem>
                  ))}
                </TextField>
                {employees.filter(e => e.role?.toLowerCase() === 'manager').length === 0 && (
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
                  {employees.filter(e => e.role?.toLowerCase() === 'employee').length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No employees available to add to team
                    </Typography>
                  ) : (
                    <Grid container spacing={1}>
                      {employees.filter(e => e.role?.toLowerCase() === 'employee').map(emp => (
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

      {/* Edit Project Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
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
            <Grid container spacing={2} mt={0.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Project Name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
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
                  onChange={(e) => setProjectForm({ ...projectForm, managerId: e.target.value })}
                  required
                >
                  <MenuItem value="">Select Manager</MenuItem>
                  {employees.filter(e => e.role?.toLowerCase() === 'manager').map(manager => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.name} - {manager.designation}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Team Members
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    maxHeight: 250,
                    overflowY: 'auto',
                    p: 2
                  }}
                >
                  <Grid container spacing={1}>
                    {employees.filter(e => e.role?.toLowerCase() === 'employee').map(emp => (
                      <Grid item xs={12} key={emp.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={projectForm.teamMembers?.includes(emp.id)}
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
                </Paper>
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Selected: {projectForm.teamMembers?.length || 0} member(s)
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Edit />}
            >
              Update Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog
        open={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setTaskForm({
            name: '', description: '', assignedTo: '', teamId: '', deadline: '', estimatedHours: '', status: 'To Do'
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleAddTask}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="600">
                Add New Task
              </Typography>
              <IconButton onClick={() => {
                setShowAddTaskModal(false);
                setTaskForm({
                  name: '', description: '', assignedTo: '', teamId: '', deadline: '', estimatedHours: '', status: 'To Do'
                });
              }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {selectedProject && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Adding task to: <strong>{selectedProject.name}</strong>
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Task Name"
                      value={taskForm.name}
                      onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                      required
                      placeholder="Enter task name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      required
                      placeholder="Describe the task"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Assign To"
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      required
                    >
                      <MenuItem value="">Select Member</MenuItem>
                      {getAssignableMembers().map(member => (
                        <MenuItem key={member.id} value={member.id}>
                          {member.name} - {member.designation}
                          {member.id === parseInt(selectedProject.managerId) && ' (Manager)'}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Deadline"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Estimated Hours"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                      required
                      placeholder="Enter hours"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => {
              setShowAddTaskModal(false);
              setTaskForm({
                name: '', description: '', assignedTo: '', teamId: '', deadline: '', estimatedHours: '', status: 'To Do'
              });
            }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddTask />}
            >
              Add Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog
        open={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
          setSelectedTask(null);
          setTaskForm({
            name: '', description: '', assignedTo: '', teamId: '', deadline: '', estimatedHours: '', status: 'To Do'
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleUpdateTask}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="600">
                Edit Task
              </Typography>
              <IconButton onClick={() => {
                setShowEditTaskModal(false);
                setSelectedTask(null);
                setTaskForm({
                  name: '', description: '', assignedTo: '', teamId: '', deadline: '', estimatedHours: '', status: 'To Do'
                });
              }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {selectedProject && selectedTask && (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Editing task in: <strong>{selectedProject.name}</strong>
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Task Name"
                      value={taskForm.name}
                      onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                      required
                      placeholder="Enter task name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      required
                      placeholder="Describe the task"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Assign To"
                      value={taskForm.assignedTo}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                      required
                    >
                      <MenuItem value="">Select Member</MenuItem>
                      {getAssignableMembers().map(member => (
                        <MenuItem key={member.id} value={member.id}>
                          {member.name} - {member.designation}
                          {member.id === parseInt(selectedProject.managerId) && ' (Manager)'}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Deadline"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Estimated Hours"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                      required
                      placeholder="Enter hours"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => {
              setShowEditTaskModal(false);
              setSelectedTask(null);
              setTaskForm({
                name: '', description: '', assignedTo: '', teamId: '', deadline: '', estimatedHours: '', status: 'To Do'
              });
            }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Edit />}
            >
              Update Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Members Modal */}
      <Dialog
        open={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setNewMembers([]);
        }}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleAddMembers}>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight="600">
                Add Team Members
              </Typography>
              <IconButton onClick={() => {
                setShowAddMemberModal(false);
                setNewMembers([]);
              }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {selectedProject && (
              <>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Project: <strong>{selectedProject.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Current Team Size: <strong>{(selectedProject.teamMembers?.length || 0) + 1}</strong> members
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {getAvailableEmployees().length === 0 ? (
                  <Alert severity="info">
                    All employees are already assigned to this project
                  </Alert>
                ) : (
                  <Paper
                    variant="outlined"
                    sx={{
                      maxHeight: 300,
                      overflowY: 'auto',
                      p: 2
                    }}
                  >
                    {getAvailableEmployees().map(emp => (
                      <FormControlLabel
                        key={emp.id}
                        control={
                          <Checkbox
                            checked={newMembers.includes(emp.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewMembers([...newMembers, emp.id]);
                              } else {
                                setNewMembers(newMembers.filter(id => id !== emp.id));
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
                    ))}
                  </Paper>
                )}
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Selected: {newMembers.length} new member(s)
                </Typography>
              </>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => {
              setShowAddMemberModal(false);
              setNewMembers([]);
            }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<PersonAdd />}
              disabled={newMembers.length === 0}
            >
              Add Members
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
                  <Button
                    variant="outlined"
                    startIcon={<AddTask />}
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowAddTaskModal(true);
                    }}
                    size="small"
                  >
                    Add Task
                  </Button>
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
                  <IconButton onClick={() => setShowDetailsModal(false)}>
                    <Close />
                  </IconButton>
                </Stack>
              </Box>
            </DialogTitle>
            <Divider />
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={detailsTab} onChange={(e, newValue) => setDetailsTab(newValue)}>
                <Tab label="Overview" />
                <Tab label={`Team (${(getTeamMembers(selectedProject).length || 0) + 1})`} />
                <Tab label={`Tasks (${selectedProject.tasks?.length || 0})`} />
              </Tabs>
            </Box>
            <DialogContent>
              {/* Overview Tab */}
              {detailsTab === 0 && (
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
                        <Typography variant="body2"><strong>Start Date:</strong> {selectedProject.startDate}</Typography>
                        <Typography variant="body2"><strong>End Date:</strong> {selectedProject.endDate}</Typography>
                        <Typography variant="body2"><strong>Manager:</strong> {getProjectManager(selectedProject)?.name || 'Not Assigned'}</Typography>
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
                                {(selectedProject.teamMembers?.length || 0) + 1}
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
                                Teams Created
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
                                Tasks Done
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
              {detailsTab === 1 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="600">
                      All Team Members
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => setShowAddMemberModal(true)}
                      size="small"
                    >
                      Add Members
                    </Button>
                  </Box>
                  <List>
                    {getProjectManager(selectedProject) && (
                      <>
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
                                {getProjectManager(selectedProject).designation} • {getProjectManager(selectedProject).department}
                              </>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </>
                    )}
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
                </Box>
              )}

              {/* Tasks Tab */}
              {detailsTab === 2 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="600">
                      Project Tasks
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddTask />}
                      onClick={() => {
                        setShowDetailsModal(false);
                        setShowAddTaskModal(true);
                      }}
                      size="small"
                    >
                      Add Task
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {(!selectedProject.tasks || selectedProject.tasks.length === 0) ? (
                    <Alert severity="info">
                      No tasks assigned yet. Click "Add Task" to create tasks for team members.
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
                              <TableCell><strong>Task Name</strong></TableCell>
                              <TableCell><strong>Assigned To</strong></TableCell>
                              <TableCell><strong>Deadline</strong></TableCell>
                              <TableCell><strong>Hours</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProject.tasks.map(task => {
                              const assignedEmployee = employees.find(e => e.id === task.assignedTo);
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
                                      color={
                                        task.status === 'Done' ? 'success' :
                                          task.status === 'In Progress' ? 'info' : 'default'
                                      }
                                      icon={task.status === 'Done' ? <CheckCircle /> : undefined}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Stack direction="row" spacing={1} justifyContent="center">
                                      <Tooltip title="Edit Task">
                                        <IconButton
                                          color="primary"
                                          size="small"
                                          onClick={() => handleEditTask(task)}
                                        >
                                          <Edit fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Delete Task">
                                        <IconButton
                                          color="error"
                                          size="small"
                                          onClick={() => handleDeleteTask(task.id)}
                                        >
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Stack>
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
              <Button onClick={() => setShowDetailsModal(false)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Projects;