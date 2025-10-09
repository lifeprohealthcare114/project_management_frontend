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
} from "@mui/icons-material";

import {
getProjects,
getEmployees,
createProject,
updateProject,
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
const [modalTab, setModalTab] = useState(0);

const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

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
teamId: "",
deadline: "",
estimatedHours: "",
status: "To Do",
});

// Fetch projects and employees data on mount
useEffect(() => {
const fetchData = async () => {
setLoading(true);
try {
const [projectsRes, employeesRes] = await Promise.all([
getProjects(),
getEmployees(),
]);
setProjects(projectsRes.data);
setEmployees(employeesRes.data);
} catch (err) {
console.error("Error fetching data", err);
setError("Failed to load projects or employees.");
} finally {
setLoading(false);
}
};

fetchData();
}, []);

// Filter projects for current manager
const managerProjects = projects.filter(
  (p) => p.manager?.id?.toString() === managerId.toString()
);


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

// Status color mapping for chips
const getStatusColor = (status) => {
switch (status) {
case "Completed":
return "success";
case "In Progress":
return "info";
case "Planning":
return "warning";
case "To Do":
return "default";
case "Done":
return "success";
default:
return "default";
}
};

// --- Handlers for Creating, Editing, Updating Projects ---

const handleCreateProject = async (e) => {
e.preventDefault();
try {
const newProject = {
...projectForm,
managerId: managerId.toString(),
teamMembers: [],
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
status: "Planning",
});
setShowModal(false);
} catch (err) {
console.error("Error creating project", err);
setError("Failed to create project.");
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
try {
const updatedProject = { ...selectedProject, ...projectForm };
const res = await updateProject(selectedProject.id, updatedProject);
setProjects((prev) =>
prev.map((p) => (p.id === selectedProject.id ? res.data : p))
);
setShowEditModal(false);
setSelectedProject(res.data);
} catch (err) {
console.error("Error updating project", err);
setError("Failed to update project.");
}
};

// Mark project as Completed
const handleMarkComplete = async (projectId) => {
try {
const project = projects.find((p) => p.id === projectId);
if (!project) return;
const updatedProject = { ...project, status: "Completed" };
const res = await updateProject(projectId, updatedProject);
setProjects((prev) =>
prev.map((p) => (p.id === projectId ? res.data : p))
);
if (selectedProject?.id === projectId) {
setSelectedProject(res.data);
}
} catch (err) {
console.error("Error marking complete", err);
setError("Failed to mark project completed.");
}
};

// Get team members based on project.teamMembers IDs
const getTeamMembers = (project) =>
employees.filter((emp) => project.teamMembers?.includes(emp.id));

// --- Handlers for Teams and Tasks (Optional Dialogs) ---

const handleCreateTeam = async (e) => {
e.preventDefault();
try {
const newTeam = {
...teamForm,
projectId: selectedProject.id,
createdAt: new Date().toLocaleDateString(),
id: Date.now(),
};
const updatedProject = {
...selectedProject,
teams: [...(selectedProject.teams || []), newTeam],
};
const res = await updateProject(selectedProject.id, updatedProject);
setProjects((prev) =>
prev.map((p) => (p.id === selectedProject.id ? res.data : p))
);
setSelectedProject(res.data);
setTeamForm({ name: "", members: [] });
setShowTeamModal(false);
} catch (err) {
console.error("Error creating team", err);
setError("Failed to create team.");
}
};

const handleCreateTask = async (e) => {
e.preventDefault();
try {
const newTask = {
...taskForm,
projectId: selectedProject.id,
createdAt: new Date().toLocaleDateString(),
id: Date.now(),
};
const updatedProject = {
...selectedProject,
tasks: [...(selectedProject.tasks || []), newTask],
};
const res = await updateProject(selectedProject.id, updatedProject);
setProjects((prev) =>
prev.map((p) => (p.id === selectedProject.id ? res.data : p))
);
setSelectedProject(res.data);
setTaskForm({
name: "",
description: "",
assignedTo: "",
teamId: "",
deadline: "",
estimatedHours: "",
status: "To Do",
});
setShowTaskModal(false);
} catch (err) {
console.error("Error creating task", err);
setError("Failed to create task.");
}
};

// Status chip color for Tasks
const getStatusColorTask = (status) => {
switch (status) {
case "Done":
return "success";
case "In Progress":
return "info";
case "To Do":
return "warning";
default:
return "default";
}
};

// Loading and error states
if (loading)
return (
<Typography variant="h6" textAlign="center" mt={5}>
Loading...
</Typography>
);

if (error)
return (
<Typography variant="h6" color="error" textAlign="center" mt={5}>
{error}
</Typography>
);

return (
<Box sx={{ p: 3 }}>
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
<Typography variant="h4" fontWeight={600} color="primary.main">
My Projects
</Typography>
<Button
variant="contained"
startIcon={<Add />}
onClick={() => setShowModal(true)}
size="large"
>
Create Project
</Button>
</Box>

text
  {managerProjects.length === 0 ? (
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
      {managerProjects.map((proj) => {
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
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <People sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Team {proj.teamMembers?.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Group sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Teams {proj.teams?.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Assignment sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Tasks{" "}
                      <strong>
                        {completedTasks}/{totalTasks}
                      </strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
    maxWidth="lg"
    fullWidth
  >
    <form onSubmit={handleCreateProject}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
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
        <Button type="submit" variant="contained" startIcon={<Add />}>
          Create Project
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
  >
    <form onSubmit={handleUpdateProject}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
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
        <Button type="submit" variant="contained" startIcon={<Edit />}>
          Update Project
        </Button>
      </DialogActions>
    </form>
  </Dialog>

  {/* View Project Modal with Tabs: Overview, Team, Teams, Tasks */}
  <Dialog
    open={showModal && !!selectedProject}
    onClose={() => {
      setShowModal(false);
      setSelectedProject(null);
      setModalTab(0);
    }}
    maxWidth="lg"
    fullWidth
  >
    {selectedProject && (
      <>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {selectedProject.name}
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                label={selectedProject.status}
                size="small"
                color={getStatusColor(selectedProject.status)}
                icon={
                  modalTab === 0 &&
                  getTimelineStatus(
                    selectedProject.startDate,
                    selectedProject.endDate,
                    selectedProject.status
                  ).icon
                }
              />
              {selectedProject.status !== "Completed" && (
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleMarkComplete(selectedProject.id)}
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
          aria-label="Project details tabs"
        >
          <Tab label="Overview" />
          <Tab label={`Team (${selectedProject.teamMembers?.length || 0})`} />
          <Tab label={`Teams (${selectedProject.teams?.length || 0})`} />
          <Tab label={`Tasks (${selectedProject.tasks?.length || 0})`} />
        </Tabs>

        <DialogContent dividers>
          {/* Overview Tab */}
          {modalTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Project Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
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
                            {
                              selectedProject.tasks?.filter((t) => t.status === "Done")
                                .length || 0
                            }
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
                }}
              >
                <Typography variant="h6" fontWeight={600}>
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
                  No team members available. Ask admin to add members to this project
                  first.
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
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {team.name}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Created {team.createdAt}
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
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Chip label={`Total ${selectedProject.tasks.length}`} color="default" />
                      <Chip
                        label={`Done ${
                          selectedProject.tasks.filter((t) => t.status === "Done").length
                        }`}
                        color="success"
                      />
                      <Chip
                        label={`In Progress ${
                          selectedProject.tasks.filter((t) => t.status === "In Progress").length
                        }`}
                        color="info"
                      />
                      <Chip
                        label={`To Do ${
                          selectedProject.tasks.filter((t) => t.status === "To Do").length
                        }`}
                        color="warning"
                      />
                    </Stack>
                  </Box>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead sx={{ bgcolor: "grey.50" }}>
                        <TableRow>
                          <TableCell><strong>Task</strong></TableCell>
                          <TableCell><strong>Assigned To</strong></TableCell>
                          <TableCell><strong>Team</strong></TableCell>
                          <TableCell><strong>Deadline</strong></TableCell>
                          <TableCell><strong>Hours</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProject.tasks.map((task) => {
                          const assignedEmployee = employees.find((e) => e.id === task.assignedTo);
                          const team = selectedProject.teams?.find((t) => t.id === task.teamId);
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
                                  "NA"
                                )}
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
                                <Typography color={isOverdue ? "error.main" : "text.primary"}>
                                  {task.deadline}
                                </Typography>
                                {isOverdue && (
                                  <Chip label="Overdue" size="small" color="error" sx={{ mt: 0.5 }} />
                                )}
                              </TableCell>
                              <TableCell>{task.estimatedHours}</TableCell>
                              <TableCell>
                                <Chip
                                  label={task.status}
                                  size="small"
                                  color={getStatusColorTask(task.status)}
                                  icon={task.status === "Done" ? <CheckCircle /> : undefined}
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
      </>
    )}
  </Dialog>

  {/* Create Team Modal */}
  <Dialog
    open={showTeamModal}
    onClose={() => setShowTeamModal(false)}
    maxWidth="sm"
    fullWidth
  >
    <form onSubmit={handleCreateTeam}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={600}>
          Create New Team
        </Typography>
        <IconButton onClick={() => setShowTeamModal(false)}>
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
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={600}>
          Assign New Task
        </Typography>
        <IconButton onClick={() => setShowTaskModal(false)}>
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
          <TextField
            fullWidth
            select
            label="Assign to Team (Optional)"
            value={taskForm.teamId}
            onChange={(e) => setTaskForm({ ...taskForm, teamId: e.target.value })}
          >
            <MenuItem value="">No Team</MenuItem>
            {selectedProject?.teams?.map((team) => (
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
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={6}>
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