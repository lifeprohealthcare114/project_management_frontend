import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Stack,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  FolderOpen,
  Person,
  Group,
  Assignment,
  CalendarToday,
  Visibility,
  Edit,
  AddTask,
  Delete,
} from "@mui/icons-material";

const ProjectCard = ({
  project,
  getProjectManager,
  getTimelineStatus,
  getStatusColor,
  viewProjectDetails,
  handleEditProject,
  handleDeleteProject,
  setSelectedProject,
  setShowAddTaskModal,
}) => {
  const manager = getProjectManager(project);
  const timelineStatus = getTimelineStatus(project.startDate, project.endDate, project.status);
  const completedTasks = project.tasks?.filter((t) => t.status === "Done").length || 0;
  const totalTasks = project.tasks?.length || 0;
  const overdueTasks = project.tasks?.filter((t) => new Date(t.deadline) < new Date() && t.status !== "Done").length || 0;
  const totalMembers = (project.teamMembers?.length || 0) + (manager ? 1 : 0);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "all 0.3s",
        "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transform: "translateY(-4px)" },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <FolderOpen />
          </Avatar>
          <Stack direction="row" spacing={1}>
            <Chip label={project.status} size="small" color={getStatusColor(project.status)} />
            <Tooltip title={`Timeline: ${timelineStatus.label}`}>
              <Chip icon={timelineStatus.icon} label={timelineStatus.label} size="small" color={timelineStatus.color} />
            </Tooltip>
          </Stack>
        </Box>

        <Typography variant="h6" fontWeight="600" gutterBottom noWrap>{project.name}</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: 40 }}
        >
          {project.description}
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
              Team: <strong>{totalMembers} members</strong>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Assignment sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Tasks: <strong>{completedTasks}/{totalTasks}</strong> ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Assignment sx={{ fontSize: 18, color: "error.main" }} />
            <Typography variant="body2" color="text.secondary">
              Overdue: <strong>{overdueTasks}</strong>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {project.startDate} - {project.endDate}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} mt={2}>
          <Button fullWidth variant="outlined" startIcon={<Visibility />} onClick={() => viewProjectDetails(project)} size="small">View</Button>
          <Tooltip title="Edit Project">
            <IconButton color="primary" onClick={() => handleEditProject(project)} size="small" sx={{ border: "1px solid", borderColor: "divider" }}><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Add Task">
            <IconButton color="secondary" onClick={() => { setSelectedProject(project); setShowAddTaskModal(true); }} size="small" sx={{ border: "1px solid", borderColor: "divider" }}><AddTask fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Delete Project">
            <IconButton color="error" onClick={() => handleDeleteProject(project.id)} size="small" sx={{ border: "1px solid", borderColor: "divider" }}><Delete fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
