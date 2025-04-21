// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Button, 
  Divider,
  alpha,
  useTheme,
  Card,
  CardContent,
  Chip,
  Fade
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Business as BusinessIcon, 
  AssignmentTurnedIn as AssignmentIcon,
  Today as TodayIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useFilters } from '../context/FilterContext';
import { getJobOverview, getMapData } from '../services/api';
import FilterBar from '../components/layout/FilterBar';
import MetricCard from '../components/dashboard/metricCard';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import BarChart from '../components/dashboard/BarChart';
import DataTable from '../components/dashboard/DataTable';
import JobMap from '../components/dashboard/JobMap';

const Dashboard = () => {
  const { filters, updateFilters } = useFilters();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const theme = useTheme();
  
  // Fetch dashboard overview data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await getJobOverview(filters);
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 800); // Add a small delay to make loading feel more natural
      }
    };
    
    fetchDashboardData();
  }, [filters]);
  
  // Fetch map data when the map tab is active
  useEffect(() => {
    if (tabValue === 0) {
      const fetchMapData = async () => {
        setMapLoading(true);
        try {
          const response = await getMapData(filters);
          if (response.success) {
            setMapData(response.data);
          }
        } catch (error) {
          console.error('Error fetching map data:', error);
        } finally {
          setTimeout(() => {
            setMapLoading(false);
          }, 1000); // Add a small delay to make loading feel more natural
        }
      };
      
      fetchMapData();
    }
  }, [tabValue, filters]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Table columns definition for recent jobs
  const jobColumns = [
    { id: 'jobNo', label: 'Job No.', minWidth: 100 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'type', label: 'Type', minWidth: 120 },
    { id: 'priority', label: 'Priority', minWidth: 100 },
    { id: 'locationName', label: 'Location', minWidth: 150 },
    { id: 'technicianNames', label: 'Technicians', minWidth: 180 },
    { id: 'createdAt', label: 'Created At', minWidth: 150, format: 'date' }
  ];
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 2, md: 3 } }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Box 
            mb={4} 
            sx={{ 
              background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`,
              p: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={1}>
              <TrendingUpIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: '-0.05em' }}>
                Job Management Dashboard
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, maxWidth: '80%', color: theme.palette.text.secondary }}>
              Monitor all job activities, performance metrics, and geographic distribution of technicians and jobs. 
              Use filters to analyze specific time periods and job types.
            </Typography>
            <FilterBar />
          </Box>
          
          {/* Metric Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '100ms' : '0ms' }}>
                <Box>
                  <MetricCard 
                    title="Total Jobs" 
                    value={dashboardData?.metrics?.totalJobs?.toLocaleString() || '0'} 
                    delta={5.2} // Example, replace with actual delta
                    icon={<DashboardIcon fontSize="large" />}
                    color="primary"
                  />
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '200ms' : '0ms' }}>
                <Box>
                  <MetricCard 
                    title="Closed Jobs" 
                    value={dashboardData?.metrics?.closedJobs?.toLocaleString() || '0'} 
                    delta={2.8} // Example, replace with actual delta
                    icon={<AssignmentIcon fontSize="large" />}
                    color="success"
                  />
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '300ms' : '0ms' }}>
                <Box>
                  <MetricCard 
                    title="Today's Jobs" 
                    value={dashboardData?.metrics?.todayJobs?.toLocaleString() || '0'} 
                    icon={<TodayIcon fontSize="large" />}
                    color="info"
                  />
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '400ms' : '0ms' }}>
                <Box>
                  <MetricCard 
                    title="Today's Closed" 
                    value={dashboardData?.metrics?.todayClosed?.toLocaleString() || '0'} 
                    icon={<BusinessIcon fontSize="large" />}
                    color="warning"
                  />
                </Box>
              </Fade>
            </Grid>
          </Grid>
          
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: alpha(theme.palette.divider, 0.1), 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="dashboard tabs"
              TabIndicatorProps={{
                style: {
                  backgroundColor: theme.palette.primary.main,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                  boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.7)}`
                }
              }}
            >
              <Tab 
                label="Overview" 
                icon={<DashboardIcon />} 
                iconPosition="start" 
                sx={{ 
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              />
              <Tab 
                label="Customers" 
                icon={<PersonIcon />} 
                iconPosition="start"
                sx={{ 
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              />
              <Tab 
                label="Technician Performance" 
                icon={<EngineeringIcon />} 
                iconPosition="start"
                sx={{ 
                  minHeight: 64,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              />
            </Tabs>
            
            <Box>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 2
                }}
              >
                Export Data
              </Button>
            </Box>
          </Box>
          
          {/* Overview Tab */}
          {tabValue === 0 && (
            <>
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                  <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '150ms' : '0ms' }}>
                    <Box>
                      <StatusPieChart 
                        data={dashboardData?.distributions?.status || []} 
                        title="Job Status Distribution" 
                      />
                    </Box>
                  </Fade>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '300ms' : '0ms' }}>
                    <Box>
                      <BarChart 
                        data={dashboardData?.distributions?.priority || []} 
                        title="Job Priority Distribution" 
                        xAxisKey="_id"
                        dataKey="count"
                        color="#F59E0B" // Amber color
                      />
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
              
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                  <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '450ms' : '0ms' }}>
                    <Box>
                      <BarChart 
                        data={dashboardData?.distributions?.province || []} 
                        title="Most Jobs by Province" 
                        xAxisKey="_id"
                        dataKey="count"
                        horizontal={true}
                        color="#3B82F6" // Blue color
                      />
                    </Box>
                  </Fade>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '600ms' : '0ms' }}>
                    <Box>
                      <BarChart 
                        data={dashboardData?.distributions?.district || []} 
                        title="Most Jobs by District" 
                        xAxisKey="_id"
                        dataKey="count"
                        horizontal={true}
                        color="#10B981" // Green color
                      />
                    </Box>
                  </Fade>
                </Grid>
              </Grid>
              
              <Box 
                mb={2} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box display="flex" alignItems="center">
                  <LocationIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Job Map
                  </Typography>
                </Box>
                
                <Box>
                  <Chip 
                    label={`${mapData.length} Jobs`} 
                    size="small" 
                    color="primary" 
                    sx={{ 
                      fontWeight: 500,
                      background: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.light,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }} 
                  />
                </Box>
              </Box>
              
              <Box mb={4} sx={{ height: 600 }}>
                <JobMap 
                  data={mapData} 
                  title="Job Distribution Map" 
                  loading={mapLoading} 
                />
              </Box>
              
              <Divider 
                sx={{ 
                  my: 4, 
                  opacity: 0.2,
                  '&::before, &::after': {
                    borderColor: alpha(theme.palette.divider, 0.2),
                  }
                }} 
              >
                <Chip 
                  label="RECENT JOBS" 
                  size="small" 
                  sx={{ 
                    fontWeight: 600,
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.light,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.05)}`
                  }} 
                />
              </Divider>
              
              <Fade in={!loading} timeout={1000}>
                <Box>
                  <DataTable 
                    data={dashboardData?.jobs || []} 
                    title="Recent Jobs"
                    columns={jobColumns}
                    totalCount={dashboardData?.pagination?.total || 0}
                    page={dashboardData?.pagination?.page - 1 || 0}
                    rowsPerPage={dashboardData?.pagination?.limit || 10}
                    onPageChange={(newPage) => updateFilters({ page: newPage + 1 })}
                    onRowsPerPageChange={(newLimit) => updateFilters({ limit: newLimit, page: 1 })}
                  />
                </Box>
              </Fade>
            </>
          )}
          
          {/* Customer Tab - Will be implemented as a separate component */}
          {tabValue === 1 && (
            <Box 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 4,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.4)
              }}
            >
              <PersonIcon 
                sx={{ 
                  fontSize: 60, 
                  color: alpha(theme.palette.primary.main, 0.3),
                  mb: 2
                }}
              />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Customer Analysis
              </Typography>
              <Typography variant="body1" mt={2} sx={{ color: theme.palette.text.secondary, maxWidth: 500, mx: 'auto', mb: 3 }}>
                Switch to the dedicated Customer View page for detailed customer analysis, including job history, reviews, and performance metrics.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600
                }} 
                onClick={() => window.location.href = '/customers'}
              >
                Go to Customer View
              </Button>
            </Box>
          )}
          
          {/* Technician Performance Tab - Will be implemented as a separate component */}
          {tabValue === 2 && (
            <Box 
              sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 4,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                bgcolor: alpha(theme.palette.background.paper, 0.4)
              }}
            >
              <EngineeringIcon 
                sx={{ 
                  fontSize: 60, 
                  color: alpha(theme.palette.primary.main, 0.3),
                  mb: 2
                }}
              />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Technician Performance
              </Typography>
              <Typography variant="body1" mt={2} sx={{ color: theme.palette.text.secondary, maxWidth: 500, mx: 'auto', mb: 3 }}>
                Switch to the dedicated Technician Performance page for detailed analysis of technician efficiency, customer satisfaction, and job completion rates.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600
                }} 
                onClick={() => window.location.href = '/technician-performance'}
              >
                Go to Technician Performance
              </Button>
            </Box>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default Dashboard;