import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
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
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider,
  MenuItem,
  InputAdornment,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Visibility,
  Search,
  Person,
  Work,
  Email,
  Badge,
  Business,
  Close,
  Edit,
  Delete,
} from '@mui/icons-material';

import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../../api/api'; // Adjust import path

const Employees = ({ projects }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Separate modals for view and edit
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [employeeForm, setEmployeeForm] = useState({
    empId: '',
    name: '',
    email: '',
    designation: '',
    department: '',
    role: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        setEmployees(response.data || []);
      } catch (err) {
        setError('Failed to fetch employees');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const resetForm = () => {
    setEmployeeForm({
      empId: '',
      name: '',
      email: '',
      designation: '',
      department: '',
      role: '',
      password: '',
    });
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEmployee) {
        // Update existing employee
        const response = await updateEmployee(selectedEmployee.id, employeeForm);
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === selectedEmployee.id ? response.data : emp))
        );
      } else {
        // Create new employee
        const response = await createEmployee(employeeForm);
        setEmployees((prev) => [...prev, response.data]);
      }
      resetForm();
      setShowEditModal(false);
      setSelectedEmployee(null);
    } catch (err) {
      setError('Failed to save employee');
      console.error(err);
    }
  };

  const handleViewClick = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeForm({
      empId: employee.empId || '',
      name: employee.name || '',
      email: employee.email || '',
      designation: employee.designation || '',
      department: employee.department || '',
      role: employee.role || '',
      password: '', // Do not prefill password
    });
    setShowEditModal(true);
  };

  const handleAddNewClick = () => {
    resetForm();
    setSelectedEmployee(null);
    setShowEditModal(true);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
    } catch (err) {
      setError('Failed to delete employee');
      console.error(err);
    } finally {
      setConfirmDeleteOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setEmployeeToDelete(null);
  };

  const getEmployeeProjects = (empId) => {
    return projects.filter(
      (project) => project.teamMembers.includes(empId) || project.managerId === empId.toString()
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    const name = (emp.name || '').toLowerCase();
    const empId = (emp.empId || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    return name.includes(term) || empId.includes(term) || email.includes(term);
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'error';
      case 'Manager':
        return 'warning';
      case 'Employee':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography variant="h6" textAlign="center" mt={5}>Loading employees...</Typography>;
  }

  if (error) {
    return <Typography variant="h6" color="error" textAlign="center" mt={5}>{error}</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Employee Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Add and manage employees across all departments
      </Typography>

      {/* Add New Employee Button */}
      <Box mb={3}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNewClick}
        >
          Add New Employee
        </Button>
      </Box>

      {/* Employee List */}
      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <Box p={3} pb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h6" fontWeight="600">
              All Employees ({employees.length})
            </Typography>
            <TextField
              size="small"
              placeholder="Search by name, emp ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              sx={{ minWidth: 250 }}
            />
          </Box>
        </Box>
        <Divider />
        {employees.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No employees added yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add your first employee using the button above
            </Typography>
          </Box>
        ) : filteredEmployees.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria
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
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Projects</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow
                    key={emp.id}
                    sx={{ '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{emp.name.charAt(0)}</Avatar>

                        <Box>
                          <Typography variant="body2" fontWeight="600">{emp.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{emp.empId}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.designation}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>
                      <Chip label={emp.role} size="small" color={getRoleColor(emp.role)} />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${getEmployeeProjects(emp.id).length} Projects`} size="small" variant="outlined" color="info" />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton size="small" color="primary" title="View Details" onClick={() => handleViewClick(emp)}>
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="warning" title="Edit Employee" onClick={() => handleEditClick(emp)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" title="Delete Employee" onClick={() => handleDeleteClick(emp)}>
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* View Details Modal */}
      <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="md" fullWidth>
        {selectedEmployee && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {selectedEmployee.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">{selectedEmployee.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployee.designation} • {selectedEmployee.department}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setShowViewModal(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>Assigned Projects</Typography>
              {getEmployeeProjects(selectedEmployee.id).length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>No projects assigned to this employee yet</Alert>
              ) : (
                <Stack spacing={2} mt={2}>
                  {getEmployeeProjects(selectedEmployee.id).map((proj) => (
                    <Card key={proj.id} variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="600">{proj.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{proj.description}</Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                              {proj.startDate} to {proj.endDate}
                            </Typography>
                          </Box>
                          <Chip
                            label={proj.status}
                            size="small"
                            color={proj.status === "Completed" ? "success" : proj.status === "In Progress" ? "info" : "default"}
                          />
                        </Box>
                        <Box>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="caption" color="text.secondary">Progress</Typography>
                            <Typography variant="caption" fontWeight="600">{proj.progress}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={proj.progress} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="contained" onClick={() => setShowViewModal(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog open={showEditModal} onClose={() => { setShowEditModal(false); resetForm(); setSelectedEmployee(null); }} maxWidth="md" fullWidth>
        <DialogTitle>{selectedEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleEmployeeSubmit}>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={employeeForm.empId}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, empId: e.target.value })}
                  required
                  size="small"
                  disabled={!!selectedEmployee}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Badge /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Person /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={employeeForm.designation}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Work /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Department"
                  value={employeeForm.department}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                  required
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Business /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  value={employeeForm.role}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                  required
                  size="small"
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                  {...(selectedEmployee ? {} : { required: true })}
                  size="small"
                  helperText={selectedEmployee ? "Leave blank to keep current password" : ""}
                />
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end" spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Button type="submit" variant="contained">
                    {selectedEmployee ? "Update" : "Add"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      resetForm();
                      setSelectedEmployee(null);
                      setShowEditModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete employee{' '}
          <strong>{employeeToDelete?.name}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;
