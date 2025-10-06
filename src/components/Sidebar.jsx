// Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider
} from '@mui/material';
import {
  Dashboard,
  People,
  FolderOpen,
  Assignment,
  Group
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('role');

  // Define menu items based on role
  const getMenuItems = () => {
    if (userRole === 'admin') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin-dashboard' },
        { text: 'Employees', icon: <People />, path: '/admin-employees' },
        { text: 'Projects', icon: <FolderOpen />, path: '/admin-projects' },
        { text: 'Requests', icon: <Assignment />, path: '/admin-requests' }
      ];
    } else if (userRole === 'manager') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/manager-dashboard' },
        { text: 'My Projects', icon: <FolderOpen />, path: '/manager-projects' },
        { text: 'My Team', icon: <Group />, path: '/manager-team' },
        { text: 'Requests', icon: <Assignment />, path: '/manager-requests' }
      ];
    } else {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/employee-dashboard' },
        { text: 'My Projects', icon: <FolderOpen />, path: '/employee-projects' },
        { text: 'My Requests', icon: <Assignment />, path: '/employee-requests' }
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;