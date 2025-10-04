import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Paper } from "@mui/material";
import API from "../api/api";

const ForgotPassword = () => {
  const [empId, setEmpId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/forgot-password", { empId }); // send empId instead of email
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending reset link");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>Forgot Password</Typography>
        {message && <Typography>{message}</Typography>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Employee ID"
            fullWidth
            margin="normal"
            value={empId}
            onChange={e => setEmpId(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Send Reset Link</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
