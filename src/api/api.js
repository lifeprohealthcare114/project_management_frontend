// FILE 1: api.js (UPDATED)
// Path: src/api/api.js
// =====================================================

import axios from "axios";

// ===================== GLOBAL AXIOS INSTANCE =====================
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Add JWT token to every request if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: auto logout if unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ===================== AUTH API =====================
export const login = (empId, password) => api.post("/auth/login", { empId, password });
export const signup = (employee) => api.post("/auth/signup", employee);
export const forgotPassword = (empId) => api.post("/auth/forgot-password", { empId });
export const resetPassword = (token, newPassword) => api.post("/auth/reset-password", { token, newPassword });

// ===================== DASHBOARD API =====================
export const getDashboardData = (userId, role) =>
  api.get("/dashboard", { params: { userId, role } });

// ===================== EMPLOYEES API =====================
export const getEmployees = () => api.get("/employees");
export const getEmployeeById = (id) => api.get(`/employees/${id}`);
export const createEmployee = (employee) => api.post("/employees", employee);
export const updateEmployee = (id, employee) => api.put(`/employees/${id}`, employee);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// ===================== PROJECTS API =====================
export const getProjects = () => api.get("/projects");
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (project) => api.post("/projects", project);
export const updateProject = (id, project) => api.put(`/projects/${id}`, project);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Role-based project fetching
export const getProjectsByRole = (userId, role) =>
  api.get("/projects/by-role", { params: { userId, role } });
export const getProjectsByManager = (managerId) =>
  api.get(`/projects/manager/${managerId}`);
export const getProjectsByEmployee = (employeeId) =>
  api.get(`/projects/employee/${employeeId}`);

// ===================== REQUESTS API =====================
export const getRequests = () => api.get("/requests");
export const getRequestById = (id) => api.get(`/requests/${id}`);
export const createRequest = (requestDto) => api.post("/requests", requestDto);
export const deleteRequest = (id) => api.delete(`/requests/${id}`);

// Role-based request fetching
export const getRequestsByRole = (userId, role) =>
  api.get("/requests/by-role", { params: { userId, role } });
export const getRequestsByEmployee = (employeeId) =>
  api.get(`/requests/employee/${employeeId}`);
export const getRequestsByManager = (managerId) =>
  api.get(`/requests/manager/${managerId}`);

// Update request status (Approve/Reject)
export const updateRequestStatus = (id, status, respondedBy) =>
  api.patch(`/requests/${id}/status`, { status, respondedBy });

export default api;