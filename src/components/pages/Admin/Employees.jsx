// pages/admin/Employees.jsx
import React, { useState } from 'react';
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
  Alert
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
  Close
} from '@mui/icons-material';

const Employees = ({ employees, setEmployees, projects }) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeForm, setEmployeeForm] = useState({
    empId: '', name: '', email: '', designation: '', department: '', role: '', password: ''
  });

  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    setEmployees([...employees, { id: Date.now(), ...employeeForm, projects: [] }]);
    setEmployeeForm({ empId: '', name: '', email: '', designation: '', department: '', role: '', password: '' });
  };

  const getEmployeeProjects = (empId) => {
    return projects.filter(project => 
      project.teamMembers.includes(empId) || project.managerId === empId.toString()
    );
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'error';
      case 'Manager': return 'warning';
      case 'Employee': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" gutterBottom color="primary.main">
        Employee Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Add and manage employees across all departments
      </Typography>

      {/* Add Employee Form */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" fontWeight="600" gutterBottom>
          Add New Employee
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <form onSubmit={handleEmployeeSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Employee ID"
                value={employeeForm.empId}
                onChange={(e) => setEmployeeForm({...employeeForm, empId: e.target.value})}
                required
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Badge /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Full Name"
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
                required
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Person /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                required
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Designation"
                value={employeeForm.designation}
                onChange={(e) => setEmployeeForm({...employeeForm, designation: e.target.value})}
                required
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Work /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Department"
                value={employeeForm.department}
                onChange={(e) => setEmployeeForm({...employeeForm, department: e.target.value})}
                required
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Business /></InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Role"
                value={employeeForm.role}
                onChange={(e) => setEmployeeForm({...employeeForm, role: e.target.value})}
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
                onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                size="large"
              >
                Add Employee
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Employee List */}
      <Paper 
        elevation={0}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box p={3} pb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h6" fontWeight="600">
              All Employees ({employees.length})
            </Typography>
            <TextField
              size="small"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
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
              Add your first employee using the form above
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
                {filteredEmployees.map(emp => (
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
                        label={emp.role} 
                        size="small"
                        color={getRoleColor(emp.role)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${getEmployeeProjects(emp.id).length} Projects`}
                        size="small"
                        variant="outlined"
                        color="info"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => { setSelectedEmployee(emp); setShowModal(true); }}
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

      {/* Employee Projects Modal */}
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
                      {selectedEmployee.designation} • {selectedEmployee.department}
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
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Assigned Projects
              </Typography>
              {getEmployeeProjects(selectedEmployee.id).length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No projects assigned to this employee yet
                </Alert>
              ) : (
                <Stack spacing={2} mt={2}>
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
                            color={
                              proj.status === 'Completed' ? 'success' :
                              proj.status === 'In Progress' ? 'info' : 'default'
                            }
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

export default Employees;