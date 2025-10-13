// FILE: src/api/api.js
// =====================================================

import axios from "axios";

// ===================== GLOBAL AXIOS INSTANCE =====================
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// ===================== INTERCEPTORS =====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

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

// =====================================================
// ===================== AUTH API ======================
// =====================================================
export const login = (empId, password) => api.post("/auth/login", { empId, password });
export const signup = (employee) => api.post("/auth/signup", employee);
export const forgotPassword = (empId) => api.post("/auth/forgot-password", { empId });
export const resetPassword = (token, newPassword) => api.post("/auth/reset-password", { token, newPassword });

// =====================================================
// ===================== DASHBOARD API =================
// =====================================================
export const getDashboardData = (userId, role) =>
  api.get("/dashboard", { params: { userId, role } });

// =====================================================
// ===================== EMPLOYEES API =================
// =====================================================
export const getEmployees = () => api.get("/employees");
export const getEmployeeById = (id) => api.get(`/employees/${id}`);
export const createEmployee = (employee) => api.post("/employees", employee);
export const updateEmployee = (id, employee) => api.put(`/employees/${id}`, employee);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// =====================================================
// ===================== PROJECTS API ==================
// =====================================================
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

// =====================================================
// ===================== REQUESTS API ==================
// =====================================================
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

// =====================================================
// ===================== TASKS API =====================
// =====================================================

// ✅ Get all tasks
export const getTasks = () => api.get("/tasks");

// ✅ Get task by ID
export const getTaskById = (id) => api.get(`/tasks/${id}`);

// ✅ Get tasks by project (aligned with backend /api/tasks/project/{projectId})
export const getTasksByProject = (projectId) => api.get(`/tasks/project/${projectId}`);

// ✅ Create a new task
export const createTask = (task) => api.post("/tasks", task);

// ✅ Update a task
export const updateTask = (id, task) => api.put(`/tasks/${id}`, task);

// ✅ Delete a task
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

// ✅ Assign a task to an employee
export const assignTaskToEmployee = (taskId, employeeId) =>
  api.put(`/tasks/${taskId}/assign`, { employeeId });

// ✅ Get tasks by employee
export const getTasksByEmployee = (employeeId) => api.get(`/tasks/employee/${employeeId}`);

// =====================================================
// ===================== TEAMS API (NEW) ===============
// =====================================================

// ✅ Get all teams
export const getTeams = () => api.get("/teams");

// ✅ Get team by ID
export const getTeamById = (id) => api.get(`/teams/${id}`);

// ✅ Get teams by Project
export const getTeamsByProject = (projectId) => api.get(`/teams/project/${projectId}`);

// ✅ Create a new team
export const createTeam = (team) => api.post("/teams", team);

// ✅ Update a team
export const updateTeam = (id, team) => api.put(`/teams/${id}`, team);

// ✅ Delete a team
export const deleteTeam = (id) => api.delete(`/teams/${id}`);

// =====================================================
export default api;
