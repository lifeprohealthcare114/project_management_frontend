import React, { useEffect, useState, useMemo } from 'react';
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
  Snackbar,
  Popover,
  FormControlLabel,
  Switch,
  Pagination,
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
  Group,
  Assignment,
  SupervisorAccount,
  AdminPanelSettings,
} from '@mui/icons-material';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getProjects,
} from '../../../api/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', department: '', designation: '', projectId: '' });
  const [employeeForm, setEmployeeForm] = useState({
    empId: '',
    name: '',
    email: '',
    designation: '',
    department: '',
    role: '',
    password: '',
    active: true,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverProjects, setPopoverProjects] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      setEmployees(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch employees');
      showSnackbar('Failed to load employees', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const resetForm = () => {
    setEmployeeForm({
      empId: '',
      name: '',
      email: '',
      designation: '',
      department: '',
      role: '',
      password: '',
      active: true,
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

 const handleEmployeeSubmit = async (e) => {
  e.preventDefault();
  try {
    setActionLoading((prev) => ({ ...prev, submit: true }));

    // Prepare payload
    const payload = { ...employeeForm };

    if (selectedEmployee) {
      // Updating employee
      // Remove password if left empty (don't change existing password)
      if (!payload.password) {
        delete payload.password;
      }
    } else {
      // Creating employee
      if (!payload.password) {
        showSnackbar('Password is required', 'error');
        return;
      }
    }

    let response;
    if (selectedEmployee) {
      // Update employee
      response = await updateEmployee(selectedEmployee.id, payload);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === selectedEmployee.id ? response.data : emp))
      );
      showSnackbar('Employee updated successfully');
    } else {
      // Create new employee
      response = await createEmployee(payload);
      setEmployees((prev) => [...prev, response.data]);
      showSnackbar('Employee created successfully');
    }

    // Reset form & close modal
    resetForm();
    setSelectedEmployee(null);
    setShowEditModal(false);
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Failed to save employee';
    setError(errorMsg);
    showSnackbar(errorMsg, 'error');
    console.error(err);
  } finally {
    setActionLoading((prev) => ({ ...prev, submit: false }));
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
      password: '',
      active: employee.active !== undefined ? employee.active : true,
    });
    setShowEditModal(true);
  };

  const handleAddNewClick = () => {
    resetForm();
    setSelectedEmployee(null);
    setShowEditModal(true);
  };

  const handleDeactivateToggle = async (emp) => {
    const updatedEmp = { ...emp, active: !emp.active };
    try {
      setActionLoading((prev) => ({ ...prev, [`deactivate_${emp.id}`]: true }));
      await updateEmployee(emp.id, updatedEmp);
      setEmployees((prev) => prev.map((e) => (e.id === emp.id ? updatedEmp : e)));
      showSnackbar(`Employee ${updatedEmp.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to update status', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [`deactivate_${emp.id}`]: false }));
    }
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      setActionLoading((prev) => ({ ...prev, delete: true }));
      await deleteEmployee(employeeToDelete.id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
      showSnackbar('Employee deleted successfully');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete employee';
      setError(errorMsg);
      showSnackbar(errorMsg, 'error');
      console.error(err);
    } finally {
      setConfirmDeleteOpen(false);
      setEmployeeToDelete(null);
      setActionLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setEmployeeToDelete(null);
  };

const getEmployeeProjects = (empId) => {
  return projects.filter(
    (project) =>
      project.teamMembers?.includes(empId) ||
      Number(project.manager?.id) === Number(empId)
  );
};


  const handleProjectPopoverOpen = (event, emp) => {
    setAnchorEl(event.currentTarget);
    setPopoverProjects(getEmployeeProjects(emp.id));
  };
  const handleProjectPopoverClose = () => {
    setAnchorEl(null);
    setPopoverProjects([]);
  };
  const openPopover = Boolean(anchorEl);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const term = searchTerm.toLowerCase();
      if (
        term &&
        !(
          emp.name?.toLowerCase().includes(term) ||
          emp.empId?.toLowerCase().includes(term) ||
          emp.email?.toLowerCase().includes(term)
        )
      )
        return false;
      if (filters.role && emp.role !== filters.role) return false;
      if (filters.department && emp.department !== filters.department) return false;
      if (filters.designation && emp.designation !== filters.designation) return false;
      if (filters.projectId && !getEmployeeProjects(emp.id).some((p) => p.id === filters.projectId)) return false;
      return true;
    });
  }, [employees, searchTerm, filters, projects]);

  const paginatedEmployees = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredEmployees.slice(start, start + rowsPerPage);
  }, [filteredEmployees, page]);

  const getRoleColor = (role) => {
    const roleLower = (role || '').toLowerCase();
    switch (roleLower) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'employee':
        return 'info';
      default:
        return 'default';
    }
  };

  const summary = useMemo(() => {
    const total = employees.length;
    const byRole = { admin: 0, manager: 0, employee: 0 };
    let withoutProjects = 0;
    employees.forEach((emp) => {
      byRole[emp.role] = (byRole[emp.role] || 0) + 1;
      if (getEmployeeProjects(emp.id).length === 0) withoutProjects += 1;
    });
    return { total, byRole, withoutProjects };
  }, [employees, projects]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <LinearProgress sx={{ width: 200, mb: 2 }} />
          <Typography variant="h6">Loading employees...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Employee Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Add and manage employees across all departments
      </Typography>

      {/* Summary Cards with Icons */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Group color="primary" />
                <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                  Total Employees
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight="700" color="primary.main">
                {summary.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SupervisorAccount color="warning" />
                <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                  Employees by Role
                </Typography>
              </Stack>
              <Stack spacing={1} mt={1}>
                {Object.entries(summary.byRole).map(([role, count]) => (
                  <Stack key={role} direction="row" justifyContent="space-between" alignItems="center">
                    <Chip
                      icon={role === 'admin' ? <AdminPanelSettings /> : role === 'manager' ? <SupervisorAccount /> : <Person />}
                      label={role.charAt(0).toUpperCase() + role.slice(1)}
                      size="small"
                      color={getRoleColor(role)}
                    />
                    <Typography fontWeight={600}>{count}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Badge color="error" />
                <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                  Employees without Projects
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight="700" color="error.main">
                {summary.withoutProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* All your existing code below remains unchanged */}
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Role"
          size="small"
          value={filters.role}
          onChange={(e) => {
            setFilters({ ...filters, role: e.target.value });
            setPage(1);
          }}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="manager">Manager</MenuItem>
          <MenuItem value="employee">Employee</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Department"
          value={filters.department}
          onChange={(e) => {
            setFilters({ ...filters, department: e.target.value });
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small"
          label="Designation"
          value={filters.designation}
          onChange={(e) => {
            setFilters({ ...filters, designation: e.target.value });
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          select
          size="small"
          label="Project"
          value={filters.projectId}
          onChange={(e) => {
            setFilters({ ...filters, projectId: e.target.value });
            setPage(1);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Add New Employee Button */}
      <Box mb={3}>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddNewClick}>
          Add New Employee
        </Button>
      </Box>

      {/* Employee Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
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
        ) : paginatedEmployees.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or filters
            </Typography>
          </Box>
        ) : (
          <>
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
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmployees.map((emp) => (
                    <TableRow
                      key={emp.id}
                      sx={{ '&:hover': { bgcolor: 'action.hover' }, '&:last-child td': { border: 0 } }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main' }}>{emp.name?.charAt(0) || 'E'}</Avatar>
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
                        <Chip
                          label={`${getEmployeeProjects(emp.id).length} Projects`}
                          size="small"
                          variant="outlined"
                          color="info"
                          onClick={(e) => handleProjectPopoverOpen(e, emp)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={<Switch checked={emp.active} onChange={() => handleDeactivateToggle(emp)} />}
                          label={emp.active ? 'Active' : 'Inactive'}
                        />
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
            <Box display="flex" justifyContent="center" mt={2} pb={2}>
              <Pagination
                count={Math.ceil(filteredEmployees.length / rowsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* Project Popover */}
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleProjectPopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box p={2} maxWidth={300}>
          {popoverProjects.length === 0 ? (
            <Typography variant="body2">No projects assigned</Typography>
          ) : (
            popoverProjects.map((proj) => (
              <Card key={proj.id} variant="outlined" sx={{ mb: 1 }}>
                <CardContent>
                  <Typography variant="subtitle2">{proj.name}</Typography>
                  <Typography variant="caption">
                    {proj.managerId === selectedEmployee?.id ? 'Manager' : 'Contributor'}
                  </Typography>
                  <Typography variant="caption" display="block">{proj.status}</Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </Popover>

      {/* View Modal */}
      <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="md" fullWidth>
        {selectedEmployee && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {selectedEmployee.name?.charAt(0) || 'E'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">{selectedEmployee.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployee.designation} • {selectedEmployee.department}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setShowViewModal(false)}><Close /></IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Assigned Projects
              </Typography>
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
                            color={proj.status === 'Completed' ? 'success' : proj.status === 'In Progress' ? 'info' : 'default'}
                          />
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

      {/* Edit Modal */}
      <Dialog
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
          setSelectedEmployee(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <Divider />
        <DialogContent>
          <form onSubmit={handleEmployeeSubmit} id="employee-form">
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
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
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
                  helperText={selectedEmployee ? 'Leave blank to keep current password' : ''}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
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
          <Button type="submit" form="employee-form" variant="contained">
            {selectedEmployee ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={confirmDeleteOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete employee <strong>{employeeToDelete?.name}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default Employees;
