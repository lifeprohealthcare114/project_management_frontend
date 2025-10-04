// pages/manager/Team.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Stack,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Grid
} from '@mui/material';
import {
  Visibility,
  People,
  Email,
  Work,
  Badge,
  Business,
  Close
} from '@mui/icons-material';

const Team = ({ managerId, projects, employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const managerProjects = projects.filter(p => p.managerId === managerId.toString());
  
  const teamMemberIds = new Set();
  managerProjects.forEach(project => {
    project.teamMembers.forEach(memberId => teamMemberIds.add(memberId));
  });
  const teamMembers = employees.filter(emp => teamMemberIds.has(emp.id));

  const getEmployeeProjects = (empId) => {
    return managerProjects.filter(project => project.teamMembers.includes(empId));
  };

  const viewEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
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
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        My Team
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        View and manage your team members
      </Typography>

      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box p={3}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <People color="primary" />
            <Typography variant="h6" fontWeight="600">
              Team Members ({teamMembers.length})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            All members working on your projects
          </Typography>
        </Box>
        <Divider />
        {teamMembers.length === 0 ? (
          <Box textAlign="center" py={8}>
            <People sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No team members assigned yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Team members will appear here once projects are assigned
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell><strong>Employee</strong></TableCell>
                  <TableCell><strong>Contact</strong></TableCell>
                  <TableCell><strong>Designation</strong></TableCell>
                  <TableCell><strong>Department</strong></TableCell>
                  <TableCell><strong>Projects</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.map(emp => (
                  <TableRow 
                    key={emp.id}
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600">
                            {emp.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.empId}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${getEmployeeProjects(emp.id).length} Projects`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => viewEmployeeDetails(emp)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Employee Details Modal */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedEmployee && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {selectedEmployee.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {selectedEmployee.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployee.designation}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setShowModal(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Badge color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Employee ID
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedEmployee.empId}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Email color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedEmployee.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Work color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Designation
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedEmployee.designation}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Business color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Department
                          </Typography>
                          <Typography variant="body2" fontWeight="600">
                            {selectedEmployee.department}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Assigned Projects ({getEmployeeProjects(selectedEmployee.id).length})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {getEmployeeProjects(selectedEmployee.id).length === 0 ? (
                    <Alert severity="info">
                      This employee is not assigned to any of your projects yet
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      {getEmployeeProjects(selectedEmployee.id).map(proj => (
                        <Card key={proj.id} variant="outlined">
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {proj.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {proj.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                  {proj.startDate} to {proj.endDate}
                                </Typography>
                              </Box>
                              <Chip
                                label={proj.status}
                                size="small"
                                color={getStatusColor(proj.status)}
                              />
                            </Box>
                            <Box>
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
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setShowModal(false)} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Team;