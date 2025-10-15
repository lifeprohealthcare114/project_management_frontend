// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import your Login component
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';

// Import Admin Components
import AdminDashboard from './components/pages/Admin/Dashboard';
import AdminEmployees from './components/pages/Admin/Employees';
import AdminProjects from './components/pages/Admin/project/Project';
import AdminRequests from './components/pages/Admin/Request';

// Import Manager Components
import ManagerDashboard from './components/pages/Manager/Dashboard';
import ManagerProjects from './components/pages/Manager/ManagerProjects';
import ManagerRequests from './components/pages/Manager/ManagerRequests';

// Import Employee Components
import EmployeeDashboard from './components/pages/Employee/Dashboard';
import EmployeeProjects from './components/pages/Employee/EmployeeProjects';
import EmployeeRequests from './components/pages/Employee/EmployeeRequests';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  // Shared state for all components
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);

  // Read userId once from localStorage
  const userId = parseInt(localStorage.getItem('userId'), 10);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute role="admin">
                <Layout>
                  <AdminDashboard employees={employees} projects={projects} requests={requests} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-employees"
            element={
              <PrivateRoute role="admin">
                <Layout>
                  <AdminEmployees employees={employees} setEmployees={setEmployees} projects={projects} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-projects"
            element={
              <PrivateRoute role="admin">
                <Layout>
                  <AdminProjects projects={projects} setProjects={setProjects} employees={employees} setEmployees={setEmployees} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-requests"
            element={
              <PrivateRoute role="admin">
                <Layout>
                  <AdminRequests requests={requests} setRequests={setRequests} employees={employees} projects={projects} />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager-dashboard"
            element={
              <PrivateRoute role="manager">
                <Layout>
                  <ManagerDashboard managerId={userId} projects={projects} employees={employees} requests={requests} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/manager-projects"
            element={
              <PrivateRoute role="manager">
                <Layout>
                  <ManagerProjects managerId={userId} projects={projects} employees={employees} />
                </Layout>
              </PrivateRoute>
            }
          />
                  <Route
            path="/manager-requests"
            element={
              <PrivateRoute role="manager">
                <Layout>
                  <ManagerRequests managerId={userId} requests={requests} setRequests={setRequests} employees={employees} projects={projects} />
                </Layout>
              </PrivateRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee-dashboard"
            element={
              <PrivateRoute role="employee">
                <Layout>
                  <EmployeeDashboard employeeId={userId} projects={projects} requests={requests} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee-projects"
            element={
              <PrivateRoute role="employee">
                <Layout>
                  <EmployeeProjects employeeId={userId} projects={projects} employees={employees} />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employee-requests"
            element={
              <PrivateRoute role="employee">
                <Layout>
                  <EmployeeRequests employeeId={userId} requests={requests} setRequests={setRequests} projects={projects} />
                </Layout>
              </PrivateRoute>
            }
          />
<Route path="/signup" element={<Signup />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
