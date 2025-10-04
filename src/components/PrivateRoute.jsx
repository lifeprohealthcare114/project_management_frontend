import React from "react";
import { Navigate } from "react-router-dom";

// role: the required role for this route (optional)
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // If no token, redirect to login
  if (!token) return <Navigate to="/" replace />;

  // If role is specified and doesn't match, redirect to login
  if (role && role !== userRole) return <Navigate to="/" replace />;

  // If all good, render children (the protected component)
  return children;
};

export default PrivateRoute;
