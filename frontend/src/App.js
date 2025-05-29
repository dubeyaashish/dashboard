// File: frontend/src/App.js (Fixed UI Layout Issues)
import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FilterProvider } from './context/FilterContext';
import { LanguageProvider } from './context/LanguageContext';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import CustomerView from './pages/CustomerView';
import TechnicianPerformance from './pages/TechnicianPerformance';
import MapView from './pages/MapView';

const DRAWER_WIDTH = 130;
const HEADER_HEIGHT = 64;

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  
  // Define the dark midnight theme with improved z-index values
  const theme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#6366F1', // Indigo
        light: '#818CF8',
        dark: '#4F46E5',
        contrastText: '#fff',
      },
      secondary: {
        main: '#EC4899', // Pink
        light: '#F472B6',
        dark: '#DB2777',
        contrastText: '#fff',
      },
      background: {
        default: '#0F172A', // Dark blue/black
        paper: '#1E293B',   // Slightly lighter dark blue
      },
      text: {
        primary: '#F1F5F9',
        secondary: '#94A3B8',
      },
      divider: 'rgba(148, 163, 184, 0.12)',
      success: {
        main: '#10B981', // Green
      },
      warning: {
        main: '#F59E0B', // Amber
      },
      error: {
        main: '#EF4444', // Red
      },
      info: {
        main: '#3B82F6', // Blue
      },
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    // FIXED: Improved z-index system
    zIndex: {
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1200, // Higher than default
      drawer: 1100,  // Lower than appBar
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: "#6b6b6b #2b2b2b",
            "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
              backgroundColor: "#2b2b2b",
              width: 8,
            },
            "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
              borderRadius: 8,
              backgroundColor: "#6b6b6b",
              minHeight: 24,
            },
            "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
              backgroundColor: "#959595",
            },
            "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#959595",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
          },
          contained: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)',
            background: 'linear-gradient(145deg, #1E293B 0%, #131f31 100%)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
          },
          head: {
            background: '#1E293B',
            fontWeight: 600,
            color: '#94A3B8',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
            borderRight: '1px solid rgba(148, 163, 184, 0.12)',
            // FIXED: Ensure drawer stays below AppBar
            zIndex: 1100,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            // FIXED: Ensure AppBar is always on top
            zIndex: 1200,
            backdropFilter: 'blur(8px)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
    shape: {
      borderRadius: 10,
    },
  }), []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        <FilterProvider>
          <Router>
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <CssBaseline />
              
              {/* FIXED: Header with proper z-index */}
              <Header toggleDrawer={toggleDrawer} />
              
              {/* FIXED: Sidebar with proper positioning */}
              <Sidebar open={drawerOpen} />
              
              {/* FIXED: Main content area with proper spacing and positioning */}
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  // FIXED: Proper spacing from top and left
                  pt: `${HEADER_HEIGHT + 16}px`, // Header height + padding
                  pl: drawerOpen ? `${DRAWER_WIDTH}px` : '0px',
                  minHeight: '100vh',
                  backgroundColor: theme.palette.background.default,
                  transition: theme.transitions.create(['padding-left'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                  }),
                  // FIXED: Ensure content doesn't get hidden behind fixed elements
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/customers" element={<CustomerView />} />
                  <Route path="/technicians" element={<TechnicianPerformance />} />
                  <Route path="/map" element={<MapView />} />
                  <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
                  <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                  <Route path="*" element={<div>Page Not Found</div>} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </FilterProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;