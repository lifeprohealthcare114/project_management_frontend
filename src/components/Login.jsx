import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Grid, Paper } from "@mui/material";
import { login } from "../api/api"; // <-- use named import

const Login = () => {
  const navigate = useNavigate();
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(empId, password); // <-- call login directly
      const { token, role, id, name } = res.data;

      // Normalize role to lowercase before saving
      const normalizedRole = role?.toLowerCase();

      // Save JWT token, normalized role, userId, and name in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("userId", id);
      localStorage.setItem("name", name);

      // Navigate based on role
      if (normalizedRole === "admin") navigate("/admin-dashboard");
      else if (normalizedRole === "manager") navigate("/manager-dashboard");
      else if (normalizedRole === "employee") navigate("/employee-dashboard");
      else navigate("/");
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
          <Grid item>
            <Link to="/forgot-password">Forgot Password?</Link>
          </Grid>
          <Grid item>
            <Link to="/signup">Sign Up</Link>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Login;
