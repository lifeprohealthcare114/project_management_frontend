import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, Paper, MenuItem } from "@mui/material";
import API from "../api/api";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ empId: "", name: "", email: "", designation: "", department: "", role: "employee", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/signup", formData);
      navigate("/"); // redirect to login
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Employee Sign Up</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField label="Employee ID" name="empId" fullWidth margin="normal" value={formData.empId} onChange={handleChange} required />
          <TextField label="Name" name="name" fullWidth margin="normal" value={formData.name} onChange={handleChange} required />
          <TextField label="Email" name="email" type="email" fullWidth margin="normal" value={formData.email} onChange={handleChange} required />
          <TextField label="Designation" name="designation" fullWidth margin="normal" value={formData.designation} onChange={handleChange} required />
          <TextField label="Department" name="department" fullWidth margin="normal" value={formData.department} onChange={handleChange} required />
          <TextField label="Role" name="role" select fullWidth margin="normal" value={formData.role} onChange={handleChange}>
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
          </TextField>
          <TextField label="Password" name="password" type="password" fullWidth margin="normal" value={formData.password} onChange={handleChange} required />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Sign Up</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Signup;
