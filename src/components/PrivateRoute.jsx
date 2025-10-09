import React from "react";
import { Navigate } from "react-router-dom";

// role: the required role for this route (optional)
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // If no token, redirect to login
  if (!token) return <Navigate to="/" replace />;

  // Normalize both role and userRole to lowercase
  if (role && role.toLowerCase() !== userRole?.toLowerCase()) return <Navigate to="/" replace />;

  // If all good, render children (the protected component)
  return children;
};

export default PrivateRoute;
