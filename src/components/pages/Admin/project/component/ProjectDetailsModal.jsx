// FILE: src/pages/Projects/components/ProjectDetailsModal.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Chip,
  Stack,
  Tabs,
  Tab,
  Grid,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
} from "@mui/material";
import {
  Close,
  AddTask,
  CheckCircle,
  PersonAdd,
  Edit,
  Delete,
} from "@mui/icons-material";

const ProjectDetailsModal = ({
  open,
  onClose,
  selectedProject,
  detailsTab,
  setDetailsTab,
  getProjectManager,
  getTeamMembers,
  getTimelineStatus,
  getStatusColor,
  handleMarkComplete,
  setShowAddTaskModal,
  setShowDetailsModal,
  setShowAddMemberModal,
  handleEditTask,
  handleDeleteTask,
  handleDeleteMember, // ✅ Added
  employees,
}) => {
  if (!selectedProject) return null;

  const manager = getProjectManager(selectedProject);
  const timelineStatus = getTimelineStatus(
    selectedProject.startDate,
    selectedProject.endDate,
    selectedProject.status
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
                icon={timelineStatus.icon}
                label={timelineStatus.label}
                size="small"
                color={timelineStatus.color}
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
            {selectedProject.status !== "Completed" && (
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
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </Box>
      </DialogTitle>
      <Divider />
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={detailsTab}
          onChange={(e, newValue) => setDetailsTab(newValue)}
        >
          <Tab label="Overview" />
          <Tab
            label={`Team (${(getTeamMembers(selectedProject).length || 0) + 1})`}
          />
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
                  <Typography variant="body2">
                    <strong>Start Date:</strong> {selectedProject.startDate}
                  </Typography>
                  <Typography variant="body2">
                    <strong>End Date:</strong> {selectedProject.endDate}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Manager:</strong>{" "}
                    {manager?.name || "Not Assigned"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Timeline Status:</strong>{" "}
                    <Chip
                      size="small"
                      label={timelineStatus.label}
                      color={timelineStatus.color}
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
                        <Typography
                          variant="h4"
                          fontWeight="700"
                          color="primary.main"
                        >
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
                        <Typography
                          variant="h4"
                          fontWeight="700"
                          color="info.main"
                        >
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
                        <Typography
                          variant="h4"
                          fontWeight="700"
                          color="success.main"
                        >
                          {selectedProject.tasks?.filter(
                            (t) => t.status === "Done"
                          ).length || 0}
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
                        <Typography
                          variant="h4"
                          fontWeight="700"
                          color="warning.main"
                        >
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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
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
              {manager && (
                <>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "warning.main" }}>
                        {manager.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={manager.name}
                      secondary={
                        <>
                          <Chip
                            label="Manager"
                            size="small"
                            color="warning"
                            sx={{ mr: 1 }}
                          />
                          {manager.designation} • {manager.department}
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </>
              )}
              {getTeamMembers(selectedProject).map((emp) => (
                <React.Fragment key={emp.id}>
                  <ListItem
                    secondaryAction={
                      <Tooltip title="Remove Member">
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to remove ${emp.name}?`
                              )
                            ) {
                              handleDeleteMember(emp.id);
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
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
            {!selectedProject.tasks || selectedProject.tasks.length === 0 ? (
              <Alert severity="info">
                No tasks assigned yet. Click "Add Task" to create tasks for team
                members.
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
                      label={`Done: ${
                        selectedProject.tasks.filter((t) => t.status === "Done")
                          .length
                      }`}
                      color="success"
                    />
                    <Chip
                      label={`In Progress: ${
                        selectedProject.tasks.filter(
                          (t) => t.status === "In Progress"
                        ).length
                      }`}
                      color="info"
                    />
                    <Chip
                      label={`To Do: ${
                        selectedProject.tasks.filter((t) => t.status === "To Do")
                          .length
                      }`}
                      color="warning"
                    />
                  </Stack>
                </Box>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell>
                          <strong>Task Name</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Assigned To</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Deadline</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Hours</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Status</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Actions</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProject.tasks.map((task) => {
                        const assignedEmployee = employees.find(
                          (e) => e.id === task.assignedTo
                        );
                        const taskDeadline = new Date(task.deadline);
                        const today = new Date();
                        const isOverdue =
                          today > taskDeadline && task.status !== "Done";

                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="600">
                                {task.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {task.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {assignedEmployee ? (
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Avatar
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      bgcolor: "primary.main",
                                    }}
                                  >
                                    {assignedEmployee.name.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {assignedEmployee.name}
                                  </Typography>
                                </Box>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color={isOverdue ? "error.main" : "text.primary"}
                              >
                                {task.deadline}
                              </Typography>
                              {isOverdue && (
                                <Chip
                                  label="Overdue"
                                  size="small"
                                  color="error"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </TableCell>
                            <TableCell>{task.estimatedHours}h</TableCell>
                            <TableCell>
                              <Chip
                                label={task.status}
                                size="small"
                                color={
                                  task.status === "Done"
                                    ? "success"
                                    : task.status === "In Progress"
                                    ? "info"
                                    : "default"
                                }
                                icon={task.status === "Done" ? <CheckCircle /> : undefined}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="center"
                              >
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
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDetailsModal;
