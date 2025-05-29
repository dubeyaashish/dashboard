// File: frontend/src/components/layout/Header.js (Fixed positioning and z-index)
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
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';

const HEADER_HEIGHT = 64;

const Header = ({ toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const notificationsOpen = Boolean(notificationsAnchorEl);
  const theme = useTheme();
  const { t } = useLanguage();
  
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
      elevation={2}
      sx={{ 
        // FIXED: Ensure header is always on top
        zIndex: theme.zIndex.drawer + 1,
        height: HEADER_HEIGHT,
        backdropFilter: 'blur(12px)',
        background: `linear-gradient(90deg, ${alpha(theme.palette.background.default, 0.95)}, ${alpha(theme.palette.background.paper, 0.95)})`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 8px ${alpha(theme.palette.background.default, 0.3)}`,
      }}
    >
      <Toolbar sx={{ height: HEADER_HEIGHT, minHeight: `${HEADER_HEIGHT}px !important` }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ 
            mr: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* FIXED: Search Bar with better positioning */}
        <Box 
          sx={{ 
            position: 'relative', 
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.common.white, 0.08),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '&:hover': {
              backgroundColor: alpha(theme.palette.common.white, 0.12),
              borderColor: alpha(theme.palette.primary.main, 0.3),
            },
            '&:focus-within': {
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
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
          <Box sx={{ 
            padding: theme.spacing(0, 2), 
            height: '100%', 
            position: 'absolute', 
            pointerEvents: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: theme.palette.text.secondary
          }}>
            <SearchIcon fontSize="small" />
          </Box>
          <InputBase
            placeholder={t("Search jobs, customers, technicians...")}
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
        
        {/* FIXED: Title with better responsive behavior */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            display: { xs: 'block', sm: 'block' },
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            background: `linear-gradient(90deg, ${theme.palette.text.primary}, ${alpha(theme.palette.primary.main, 0.8)})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t("Job Management Dashboard")}
        </Typography>
        
        {/* FIXED: Action buttons with better spacing */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          <Tooltip title={t("Help")}>
            <IconButton 
              color="inherit" 
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t("Theme")}>
            <IconButton 
              color="inherit" 
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <DarkModeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t("Notifications")}>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsClick}
              size="small"
              sx={{ 
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
                '& .MuiBadge-badge': {
                  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
                }
              }}
            >
              <Badge 
                badgeContent={4} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    height: 16,
                    minWidth: 16,
                  }
                }}
              >
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* FIXED: Notifications Menu with proper z-index */}
          <Menu
            anchorEl={notificationsAnchorEl}
            open={notificationsOpen}
            onClose={handleNotificationsClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            sx={{ zIndex: theme.zIndex.modal }}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 1.5,
                width: 320,
                maxWidth: '90vw',
                borderRadius: 2,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.95)})`,
                backdropFilter: 'blur(12px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
              <Typography variant="subtitle1" fontWeight={600}>
                {t("Recent Notifications")}
              </Typography>
            </Box>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight={500}>
                  {t("New job assigned (#JOB-1234)")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("10 minutes ago")}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight={500}>
                  {t("Customer review received")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("1 hour ago")}
                </Typography>
              </Box>
            </MenuItem>
            <MenuItem onClick={handleNotificationsClose}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight={500}>
                  {t("Job status update: Completed")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t("3 hours ago")}
                </Typography>
              </Box>
            </MenuItem>
            <Box p={1.5} display="flex" justifyContent="center">
              <Button size="small" color="primary">
                {t("View all notifications")}
              </Button>
            </Box>
          </Menu>
          
          {/* FIXED: User avatar with better positioning */}
          <Box sx={{ ml: 1 }}>
            <Tooltip title={t("Account settings")}>
              <IconButton
                onClick={handleClick}
                size="small"
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                color="inherit"
                sx={{ 
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: theme.palette.primary.main,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
              </IconButton>
            </Tooltip>
            
            {/* FIXED: Account Menu with proper z-index */}
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              sx={{ zIndex: theme.zIndex.modal }}
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1.5,
                  width: 200,
                  borderRadius: 2,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.default, 0.95)})`,
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
                <Typography variant="subtitle2" fontWeight={600}>
                  {t("Admin User")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  admin@example.com
                </Typography>
              </Box>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <PersonIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.text.secondary }} />
                {t("Profile")}
              </MenuItem>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.text.secondary }} />
                {t("Settings")}
              </MenuItem>
              <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mt: 1 }}>
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.error.main }} />
                  <Typography color="error">{t("Logout")}</Typography>
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