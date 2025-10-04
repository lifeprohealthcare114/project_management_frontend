import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Grid, Paper } from "@mui/material";
import API from "../api/api";

const Login = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/login", { empId, password });
      const { token, role, id, name } = res.data; // Get token, role, id, and name from backend

      // Save JWT token, role, userId, and name in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", id);
      localStorage.setItem("name", name);

      // Redirect based on role
      if (role === "ADMIN") navigate("/admin-dashboard");
      else if (role === "manager") navigate("/manager-dashboard");
      else navigate("/employee-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Employee Login
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Employee ID"
            fullWidth
            margin="normal"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Login
          </Button>
        </Box>
        <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
          <Grid item><Link to="/forgot-password">Forgot Password?</Link></Grid>
          <Grid item><Link to="/signup">Sign Up</Link></Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Login;
