import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Avatar, 
  Box,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  alpha,
  Tooltip,
  useTheme,
  Button
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  DarkMode as DarkModeIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const Header = ({ toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const notificationsOpen = Boolean(notificationsAnchorEl);
  const theme = useTheme();
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(8px)',
        background: alpha(theme.palette.background.default, 0.8)
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Search Bar */}
        <Box 
          sx={{ 
            position: 'relative', 
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.white, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.12),
            },
            marginRight: 2,
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
              marginLeft: 3,
              width: 'auto',
            },
            display: { xs: 'none', md: 'block' }
          }}
        >
          <Box sx={{ padding: theme.spacing(0, 2), height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SearchIcon />
          </Box>
          <InputBase
            placeholder="Search jobs, customers, technicians..."
            sx={{
              color: 'inherit',
              padding: theme.spacing(1, 1, 1, 0),
              paddingLeft: `calc(1em + ${theme.spacing(4)})`,
              transition: theme.transitions.create('width'),
              width: '100%',
              [theme.breakpoints.up('md')]: {
                width: '20ch',
                '&:focus': {
                  width: '30ch',
                },
              },
            }}
          />
        </Box>
        
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Job Management Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Help">
            <IconButton color="inherit" sx={{ mx: 0.5 }}>
              <HelpIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Theme">
            <IconButton color="inherit" sx={{ mx: 0.5 }}>
              <DarkModeIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsClick}
              sx={{ 
                mx: 0.5,
                '& .MuiBadge-badge': {
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
                }
              }}
            >
              <Badge 
                badgeContent={4} 
                color="error"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={notificationsAnchorEl}
            open={notificationsOpen}
            onClose={handleNotificationsClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 4,
              sx: {
                mt: 1.5,
                width: 320,
                borderRadius: 2,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Box p={2}>
              <Typography variant="subtitle1" fontWeight={600}>Recent Notifications</Typography>
            </Box>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight={500}>New job assigned (#JOB-1234)</Typography>
                <Typography variant="caption" color="text.secondary">10 minutes ago</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight={500}>Customer review received</Typography>
                <Typography variant="caption" color="text.secondary">1 hour ago</Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight={500}>Job status update: Completed</Typography>
                <Typography variant="caption" color="text.secondary">3 hours ago</Typography>
              </Box>
            </MenuItem>
            <Box p={1.5} display="flex" justifyContent="center">
              <Button size="small" color="primary">View all notifications</Button>
            </Box>
          </Menu>
          
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                color="inherit"
                sx={{ p: 0.5 }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: theme.palette.primary.main,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  width: 200,
                  borderRadius: 2,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <Box p={2} sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography variant="subtitle2" fontWeight={600}>Admin User</Typography>
                <Typography variant="caption" color="text.secondary">admin@example.com</Typography>
              </Box>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <PersonIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.text.secondary }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.text.secondary }} />
                Settings
              </MenuItem>
              <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mt: 1 }}>
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.error.main }} />
                  <Typography color="error">Logout</Typography>
                </MenuItem>
              </Box>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;