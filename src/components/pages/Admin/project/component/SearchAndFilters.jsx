// FILE: src/pages/Projects/components/SearchAndFilters.jsx
import React from "react";
import {
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
  Box,
} from "@mui/material";
import { Search, FilterList } from "@mui/icons-material";

const SearchAndFilters = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  timelineFilter,
  setTimelineFilter,
  managerFilter,
  setManagerFilter,
  clearFilters,
  getUniqueManagers,
  filteredCount,
  totalCount,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider" }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Planning">Planning</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Timeline</InputLabel>
            <Select
              value={timelineFilter}
              label="Timeline"
              onChange={(e) => setTimelineFilter(e.target.value)}
            >
              <MenuItem value="All">All Timeline</MenuItem>
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="On Track">On Track</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Near Deadline">Near Deadline</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Manager</InputLabel>
            <Select
              value={managerFilter}
              label="Manager"
              onChange={(e) => setManagerFilter(e.target.value)}
            >
              <MenuItem value="All">All Managers</MenuItem>
              {getUniqueManagers().map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            fullWidth
            variant="outlined"
            onClick={clearFilters}
            startIcon={<FilterList />}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
      <Box mt={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCount} of {totalCount} projects
        </Typography>
      </Box>
    </Paper>
  );
};

export default SearchAndFilters;