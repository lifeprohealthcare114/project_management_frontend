// FILE: src/pages/Projects/components/EditTaskModal.jsx
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
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
} from "@mui/material";
import { Close, Edit } from "@mui/icons-material";

const EditTaskModal = ({
  open,
  onClose,
  taskForm,
  setTaskForm,
  handleSubmit,
  selectedProject,
  selectedTask,
  getAssignableMembers,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">
              Edit Task
            </Typography>
            <IconButton onClick={onClose}>
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
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, name: e.target.value })
                    }
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
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
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
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, assignedTo: e.target.value })
                    }
                    required
                  >
                    <MenuItem value="">Select Member</MenuItem>
                    {getAssignableMembers().map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name} - {member.designation}
                        {member.id === parseInt(selectedProject.managerId) &&
                          " (Manager)"}
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
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, deadline: e.target.value })
                    }
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
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        estimatedHours: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, status: e.target.value })
                    }
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
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<Edit />}>
            Update Task
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditTaskModal;