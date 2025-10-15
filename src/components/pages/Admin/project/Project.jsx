import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  Snackbar,
  LinearProgress,
  Card,
  CardContent,
} from "@mui/material";
import { Add, FolderOpen, CheckCircle, HourglassTop, Schedule, Assignment } from "@mui/icons-material";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getEmployees,
  createTask,
  updateTask,
  deleteTask,
} from "../../../../api/api";
import SearchAndFilters from "./component/SearchAndFilters";
import ProjectCard from "./component/ProjectCard";
import CreateProjectModal from "./component/CreateProjectModal";
import EditProjectModal from "./component/EditProjectModal";
import AddTaskModal from "./component/AddTaskModal";
import EditTaskModal from "./component/EditTaskModal";
import AddMembersModal from "./component/AddMembersModal";
import ProjectDetailsModal from "./component/ProjectDetailsModal";
import { getTimelineStatus, getStatusColor } from "./utils/projectUtils";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await getProjects();
      setProjects(res.data || []);
      setError(null);
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to load projects";
      setError(msg);
      showSnackbar(msg, "error");
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
      const msg = e.response?.data?.message || "Failed to load employees";
      showSnackbar(msg, "error");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (proj) =>
          proj.name.toLowerCase().includes(query) ||
          proj.description.toLowerCase().includes(query) ||
          getProjectManager(proj)?.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((proj) => proj.status === statusFilter);
    }

    if (timelineFilter !== "All") {
      filtered = filtered.filter(
        (proj) =>
          getTimelineStatus(proj.startDate, proj.endDate, proj.status).label === timelineFilter
      );
    }

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

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const newProject = { ...projectForm, teams: [], tasks: [] };
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
      const msg = e.response?.data?.message || "Failed to create project";
      setError(msg);
      showSnackbar(msg, "error");
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
      const updatedProject = { ...selectedProject, ...projectForm };
      const res = await updateProject(selectedProject.id, updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? res.data : p)));
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
      const msg = e.response?.data?.message || "Failed to update project";
      setError(msg);
      showSnackbar(msg, "error");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      showSnackbar("Project deleted successfully");
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to delete project";
      showSnackbar(msg, "error");
    }
  };

  const handleAddMembers = async (e) => {
    e.preventDefault();
    try {
      const updatedProject = {
        ...selectedProject,
        teamMembers: [...new Set([...(selectedProject.teamMembers || []), ...newMembers])],
      };
      const res = await updateProject(selectedProject.id, updatedProject);
      setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? res.data : p)));
      setSelectedProject(res.data);
      setNewMembers([]);
      setShowAddMemberModal(false);
      showSnackbar("Members added successfully");
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to add members";
      setError(msg);
      showSnackbar(msg, "error");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        ...taskForm,
        assignedTo: parseInt(taskForm.assignedTo),
        estimatedHours: parseInt(taskForm.estimatedHours),
        projectId: selectedProject.id,
      };
      const res = await createTask(newTask);
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
      const msg = e.response?.data?.message || "Failed to add task";
      setError(msg);
      showSnackbar(msg, "error");
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
        ...taskForm,
        assignedTo: parseInt(taskForm.assignedTo),
        estimatedHours: parseInt(taskForm.estimatedHours),
      };
      const res = await updateTask(selectedTask.id, updatedTaskData);
      const updatedProject = {
        ...selectedProject,
        tasks: selectedProject.tasks.map((t) => (t.id === selectedTask.id ? res.data : t)),
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
      const msg = e.response?.data?.message || "Failed to update task";
      showSnackbar(msg, "error");
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
      const msg = e.response?.data?.message || "Failed to delete task";
      showSnackbar(msg, "error");
    }
  };

  const handleMarkComplete = async (projectId) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      const updatedProject = { ...project, status: "Completed" };
      const res = await updateProject(projectId, updatedProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? res.data : p))
      );
      if (selectedProject?.id === projectId) setSelectedProject(res.data);
      showSnackbar("Project marked as completed");
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to mark project complete";
      setError(msg);
      showSnackbar(msg, "error");
    }
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
    setDetailsTab(0);
  };

  const getProjectManager = (project) => project?.manager || null;
  const getTeamMembers = (project) => employees.filter((emp) => project.teamMembers?.includes(emp.id));
  const getAvailableEmployees = () =>
    selectedProject
      ? employees.filter((e) => e.role?.toLowerCase() === "employee" && !selectedProject.teamMembers?.includes(e.id))
      : [];
  const getAssignableMembers = () => {
    if (!selectedProject) return [];
    const manager = getProjectManager(selectedProject);
    const team = getTeamMembers(selectedProject);
    return manager ? [manager, ...team] : team;
  };
  const getUniqueManagers = () => {
    const managers = projects.map((p) => p.manager).filter(Boolean);
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

  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;
  const upcomingProjects = projects.filter((p) => p.status === "Planning").length;
  const handleSummaryFilter = (status) => setStatusFilter(status);

  if (loadingProjects || loadingEmployees) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography variant="h6">Loading projects...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="600" color="primary.main">Project Management</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create and manage projects across your organization
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowProjectModal(true)} size="large">
          Create New Project
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: "pointer" }} onClick={() => handleSummaryFilter("All")}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Assignment color="primary" />
                <Typography variant="h5">{totalProjects}</Typography>
              </Box>
              <Typography variant="subtitle2" mt={1}>Total Projects</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: "pointer" }} onClick={() => handleSummaryFilter("Completed")}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <CheckCircle color="success" />
                <Typography variant="h5">{completedProjects}</Typography>
              </Box>
              <Typography variant="subtitle2" mt={1}>Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: "pointer" }} onClick={() => handleSummaryFilter("In Progress")}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <HourglassTop color="warning" />
                <Typography variant="h5">{inProgressProjects}</Typography>
              </Box>
              <Typography variant="subtitle2" mt={1}>In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: "pointer" }} onClick={() => handleSummaryFilter("Planning")}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Schedule color="info" />
                <Typography variant="h5">{upcomingProjects}</Typography>
              </Box>
              <Typography variant="subtitle2" mt={1}>Upcoming</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        timelineFilter={timelineFilter}
        setTimelineFilter={setTimelineFilter}
        managerFilter={managerFilter}
        setManagerFilter={setManagerFilter}
        clearFilters={clearFilters}
        getUniqueManagers={getUniqueManagers}
        filteredCount={filteredProjects.length}
        totalCount={projects.length}
      />

      {filteredProjects.length === 0 ? (
        <Box sx={{ p: 8, textAlign: "center", border: "2px dashed", borderColor: "divider", borderRadius: 2 }}>
          <FolderOpen sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {projects.length === 0 ? "No projects created yet" : "No projects match your filters"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {projects.length === 0 ? "Start by creating your first project" : "Try adjusting your search or filters"}
          </Typography>
          <Button
            variant={projects.length === 0 ? "contained" : "outlined"}
            startIcon={<Add />}
            onClick={projects.length === 0 ? () => setShowProjectModal(true) : clearFilters}
          >
            {projects.length === 0 ? "Create Your First Project" : "Clear All Filters"}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((proj) => (
            <Grid item xs={12} md={6} lg={4} key={proj.id}>
              <ProjectCard
                project={proj}
                getProjectManager={getProjectManager}
                getTimelineStatus={getTimelineStatus}
                getStatusColor={getStatusColor}
                viewProjectDetails={viewProjectDetails}
                handleEditProject={handleEditProject}
                handleDeleteProject={handleDeleteProject}
                setSelectedProject={setSelectedProject}
                setShowAddTaskModal={setShowAddTaskModal}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        handleSubmit={handleProjectSubmit}
        employees={employees}
      />

      <EditProjectModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        projectForm={projectForm}
        setProjectForm={setProjectForm}
        handleSubmit={handleUpdateProject}
        employees={employees}
      />

      <AddTaskModal
        open={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setTaskForm({
            name: "",
            description: "",
            assignedTo: "",
            teamId: "",
            deadline: "",
            estimatedHours: "",
            status: "To Do",
          });
        }}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        handleSubmit={handleAddTask}
        selectedProject={selectedProject}
        getAssignableMembers={getAssignableMembers}
      />

      <EditTaskModal
        open={showEditTaskModal}
        onClose={() => {
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
        }}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        handleSubmit={handleUpdateTask}
        selectedProject={selectedProject}
        selectedTask={selectedTask}
        getAssignableMembers={getAssignableMembers}
      />

      <AddMembersModal
        open={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setNewMembers([]);
        }}
        selectedProject={selectedProject}
        newMembers={newMembers}
        setNewMembers={setNewMembers}
        handleSubmit={handleAddMembers}
        getAvailableEmployees={getAvailableEmployees}
      />

      <ProjectDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        selectedProject={selectedProject}
        detailsTab={detailsTab}
        setDetailsTab={setDetailsTab}
        getProjectManager={getProjectManager}
        getTeamMembers={getTeamMembers}
        getTimelineStatus={getTimelineStatus}
        getStatusColor={getStatusColor}
        handleMarkComplete={handleMarkComplete}
        setShowAddTaskModal={setShowAddTaskModal}
        setShowDetailsModal={setShowDetailsModal}
        setShowAddMemberModal={setShowAddMemberModal}
        handleEditTask={handleEditTask}
        handleDeleteTask={handleDeleteTask}
        employees={employees}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Projects;
