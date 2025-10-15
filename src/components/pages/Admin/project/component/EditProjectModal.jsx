// FILE: src/pages/Projects/components/EditProjectModal.jsx
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
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Close, Edit } from "@mui/icons-material";

const EditProjectModal = ({
  open,
  onClose,
  projectForm,
  setProjectForm,
  handleSubmit,
  employees,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">
              Edit Project
            </Typography>
            <IconButton onClick={onClose}>
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
                  setProjectForm({
                    ...projectForm,
                    description: e.target.value,
                  })
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
                onChange={(e) =>
                  setProjectForm({ ...projectForm, endDate: e.target.value })
                }
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
                onChange={(e) =>
                  setProjectForm({ ...projectForm, managerId: e.target.value })
                }
                required
              >
                <MenuItem value="">Select Manager</MenuItem>
                {employees
                  .filter((e) => e.role?.toLowerCase() === "manager")
                  .map((manager) => (
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
                  overflowY: "auto",
                  p: 2,
                }}
              >
                <Grid container spacing={1}>
                  {employees
                    .filter((e) => e.role?.toLowerCase() === "employee")
                    .map((emp) => (
                      <Grid item xs={12} key={emp.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={projectForm.teamMembers?.includes(
                                emp.id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProjectForm({
                                    ...projectForm,
                                    teamMembers: [
                                      ...projectForm.teamMembers,
                                      emp.id,
                                    ],
                                  });
                                } else {
                                  setProjectForm({
                                    ...projectForm,
                                    teamMembers:
                                      projectForm.teamMembers.filter(
                                        (id) => id !== emp.id
                                      ),
                                  });
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">{emp.name}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {emp.designation} • {emp.department}
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                </Grid>
              </Paper>
              <Typography
                variant="caption"
                color="text.secondary"
                mt={1}
                display="block"
              >
                Selected: {projectForm.teamMembers?.length || 0} member(s)
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" startIcon={<Edit />}>
            Update Project
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProjectModal;