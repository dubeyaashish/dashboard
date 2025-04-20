// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FilterProvider } from './context/FilterContext';

// Layout components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import CustomerView from './pages/CustomerView';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#4791db',
      dark: '#115293',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

const App = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <FilterProvider>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Header toggleDrawer={toggleDrawer} />
            <Sidebar open={drawerOpen} />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 0,
                width: { sm: `calc(100% - ${drawerOpen ? 240 : 0}px)` },
                ml: { sm: `${drawerOpen ? 240 : 0}px` },
                transition: theme => theme.transitions.create(['margin', 'width'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              }}
            >
              <Toolbar /> {/* For spacing below app bar */}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<CustomerView />} />
                <Route path="/technicians" element={<div>Technician Management (Coming Soon)</div>} />
                <Route path="/map" element={<div>Map View (Coming Soon)</div>} />
                <Route path="/analytics" element={<div>Analytics (Coming Soon)</div>} />
                <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                <Route path="*" element={<div>Page Not Found</div>} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </FilterProvider>
    </ThemeProvider>
  );
};

export default App;