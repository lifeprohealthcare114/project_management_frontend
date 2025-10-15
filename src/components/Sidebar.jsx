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
  Divider,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Dashboard, People, FolderOpen, Assignment } from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const userRole = localStorage.getItem('role')?.toLowerCase();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const getMenuItems = () => {
    if (userRole === 'admin') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/admin-dashboard' },
        { text: 'Employees', icon: <People />, path: '/admin-employees' },
        { text: 'Projects', icon: <FolderOpen />, path: '/admin-projects' },
        { text: 'Requests', icon: <Assignment />, path: '/admin-requests' },
      ];
    } else if (userRole === 'manager') {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/manager-dashboard' },
        { text: 'My Projects', icon: <FolderOpen />, path: '/manager-projects' },
        { text: 'Requests', icon: <Assignment />, path: '/manager-requests' },
      ];
    } else {
      return [
        { text: 'Dashboard', icon: <Dashboard />, path: '/employee-dashboard' },
        { text: 'My Projects', icon: <FolderOpen />, path: '/employee-projects' },
        { text: 'My Requests', icon: <Assignment />, path: '/employee-requests' },
      ];
    }
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
  <Toolbar
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: { xs: 56, sm: 64 }, // MUI default AppBar heights for mobile & desktop
    px: 2,
    bgcolor: 'primary.main', // sidebar logo background color
    boxShadow: 1, // optional subtle shadow for separation
  }}
>
  <img
    src="/logo.png" // make sure logo.png is in public folder
    alt="Company Logo"
    style={{
      maxHeight: 40, // restrict logo height
      width: 'auto',
      display: 'block',
    }}
  />
</Toolbar>


      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': { backgroundColor: 'primary.light', '&:hover': { backgroundColor: 'primary.light' } },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? mobileOpen : true}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
