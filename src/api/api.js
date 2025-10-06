import axios from "axios";

// ===================== AUTH API =====================
const API = axios.create({
  baseURL: "http://localhost:8080/api/auth",
  headers: { "Content-Type": "application/json" },
});

export default API;

// ===================== ADMIN API =====================
const adminAPI = axios.create({
  baseURL: "http://localhost:8080/api/admin",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================== DASHBOARD =====================
export const getDashboardData = () => adminAPI.get("/dashboardData");

// ===================== EMPLOYEES =====================
export const getEmployees = () => adminAPI.get("/employees");
export const createEmployee = (employee) => adminAPI.post("/employees", employee);
export const updateEmployee = (id, employee) => adminAPI.put(`/employees/${id}`, employee);
export const deleteEmployee = (id) => adminAPI.delete(`/employees/${id}`);

// ===================== PROJECTS =====================
export const getProjects = () => adminAPI.get("/projects");
export const createProject = (project) => adminAPI.post("/projects", project);
export const updateProject = (id, project) => adminAPI.put(`/projects/${id}`, project);
export const deleteProject = (id) => adminAPI.delete(`/projects/${id}`);

// ===================== REQUESTS =====================
export const getRequests = () => adminAPI.get("/requests");
export const createRequest = (request) => adminAPI.post("/requests", request);
export const updateRequestStatus = (id, status) =>
  adminAPI.put(`/requests/${id}/status`, JSON.stringify(status), {
    headers: { "Content-Type": "application/json" },
  });
export const updateRequest = (id, request) => adminAPI.put(`/requests/${id}`, request);
export const deleteRequest = (id) => adminAPI.delete(`/requests/${id}`);
