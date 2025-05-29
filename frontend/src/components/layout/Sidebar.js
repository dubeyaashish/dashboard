import React from 'react';
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
  Typography,
  Avatar,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  LocationOn as LocationIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 210; // Reduced from 240px

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Customers', icon: <PersonIcon />, path: '/customers' },
  { text: 'Technicians', icon: <EngineeringIcon />, path: '/technicians' },
  { text: 'Map View', icon: <LocationIcon />, path: '/map' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
];

const Sidebar = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          ...(!open && {
            width: 0,
            overflowX: 'hidden',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }),
          ...(open && {
            width: drawerWidth,
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        },
      }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: theme.palette.primary.main,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`
            }}
          >
            <AutoGraphIcon />
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              ml: 1.5,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            ศรช
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ mt: 1, mb: 2, borderColor: alpha(theme.palette.divider, 0.1) }} />
      <Box sx={{ overflow: 'auto', px: 1 }}>
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  ...(location.pathname === item.path && {
                    background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                    '&:hover': {
                      background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.25)}, ${alpha(theme.palette.primary.main, 0.1)})`
                    }
                  })
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? theme.palette.text.primary : theme.palette.text.secondary
                  }}
                />
                {location.pathname === item.path && (
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      borderRadius: 4,
                      bgcolor: theme.palette.primary.main,
                      boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.1) }} />
        
        {/* User profile section */}
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ 
                  bgcolor: theme.palette.primary.dark,
                  width: 36,
                  height: 36
                }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
              <Box ml={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  Admin User
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  System Administrator
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;