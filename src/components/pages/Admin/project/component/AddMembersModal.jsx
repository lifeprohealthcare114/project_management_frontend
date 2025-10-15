// FILE: src/pages/Projects/components/AddMembersModal.jsx
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
  Paper,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import { Close, PersonAdd } from "@mui/icons-material";

const AddMembersModal = ({
  open,
  onClose,
  selectedProject,
  newMembers,
  setNewMembers,
  handleSubmit,
  getAvailableEmployees,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="600">
              Add Team Members
            </Typography>
            <IconButton onClick={onClose}>
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
                Current Team Size:{" "}
                <strong>{(selectedProject.teamMembers?.length || 0) + 1}</strong>{" "}
                members
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
                    overflowY: "auto",
                    p: 2,
                  }}
                >
                  {getAvailableEmployees().map((emp) => (
                    <FormControlLabel
                      key={emp.id}
                      control={
                        <Checkbox
                          checked={newMembers.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewMembers([...newMembers, emp.id]);
                            } else {
                              setNewMembers(
                                newMembers.filter((id) => id !== emp.id)
                              );
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2">{emp.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.designation} • {emp.department}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </Paper>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                mt={1}
                display="block"
              >
                Selected: {newMembers.length} new member(s)
              </Typography>
            </>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
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
  );
};

export default AddMembersModal;