// File: frontend/src/pages/Dashboard.js (FIXED - Add map data loading)
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
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
  Person as PersonIcon,
  Engineering as EngineeringIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Map as MapIcon
} from '@mui/icons-material';
import { useFilters } from '../context/FilterContext';
import { getJobOverview, getMapData } from '../services/api';
import FilterBar from '../components/layout/FilterBar';
import MetricCard from '../components/dashboard/MetricCard';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import BarChart from '../components/dashboard/BarChart';
import DataTable from '../components/dashboard/DataTable';
import JobMap from '../components/dashboard/JobMap';

const Dashboard = () => {
  const { filters, updateFilters } = useFilters();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [mapData, setMapData] = useState([]); // Add map data state
  const [mapLoading, setMapLoading] = useState(false); // Add map loading state
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
        }, 800);
      }
    };
    
    fetchDashboardData();
  }, [filters]);
  
  // ADDED: Fetch map data separately when needed
  useEffect(() => {
    const fetchMapData = async () => {
      setMapLoading(true);
      try {
        console.log('📍 Dashboard: Fetching map data...');
        const response = await getMapData(filters);
        if (response.success) {
          console.log('✅ Dashboard: Map data received:', response.data.length, 'jobs');
          setMapData(response.data);
        } else {
          console.error('❌ Dashboard: Map data failed:', response);
          setMapData([]);
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching map data:', error);
        setMapData([]);
      } finally {
        setMapLoading(false);
      }
    };
    
    // Only fetch map data when we're not loading main dashboard data
    if (!loading) {
      fetchMapData();
    }
  }, [filters, loading]);
  
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
    { id: 'technician_names', label: 'Technicians', minWidth: 180 },
    { id: 'createdAt', label: 'Created At', minWidth: 150, format: 'date' }
  ];
  
  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 2,
        px: { xs: 2, sm: 2, md: 3 },
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Fade in={true} timeout={800}>
        <Box>
          {/* Header section */}
          <Box 
            mb={3}
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
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '100ms' : '0ms' }}>
                <Box>
                  <MetricCard 
                    title="Total Jobs" 
                    value={dashboardData?.metrics?.totalJobs?.toLocaleString() || '0'} 
                    delta={5.2}
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
                    delta={2.8}
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
          
          {/* Tabs section */}
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: alpha(theme.palette.divider, 0.1), 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: alpha(theme.palette.background.paper, 0.4),
              borderRadius: '12px 12px 0 0',
              px: 2,
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
                label="Map View" 
                icon={<MapIcon />} 
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
          
          {/* Tab content */}
          <Box
            sx={{
              backgroundColor: alpha(theme.palette.background.paper, 0.2),
              borderRadius: '0 0 12px 12px',
              p: 3,
              minHeight: '60vh',
            }}
          >
            {/* Overview Tab */}
            {tabValue === 0 && (
              <>
                {/* Status and Priority charts */}
                <Grid container spacing={4} mb={4}>
                  <Grid item xs={12} md={6}>
                    <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '150ms' : '0ms' }}>
                      <Box sx={{ height: 500, width: '100%' }}>
                        <StatusPieChart 
                          data={dashboardData?.distributions?.status || []} 
                          title="Job Status Distribution" 
                        />
                      </Box>
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '300ms' : '0ms' }}>
                      <Box sx={{ height: 500, width: '100%' }}>
                        <BarChart 
                          data={dashboardData?.distributions?.priority || []} 
                          title="Job Priority Distribution" 
                          xAxisKey="_id"
                          dataKey="count"
                          color="#F59E0B"
                          height={470}
                        />
                      </Box>
                    </Fade>
                  </Grid>
                </Grid>
                
                {/* Province and District charts */}
                <Grid container spacing={4} mb={4}>
                  <Grid item xs={12} md={6}>
                    <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '450ms' : '0ms' }}>
                      <Box sx={{ height: 550, width: '100%' }}>
                        <BarChart 
                          data={dashboardData?.distributions?.province || []} 
                          title="Most Jobs by Province" 
                          xAxisKey="_id"
                          dataKey="count"
                          horizontal={true}
                          color="#3B82F6"
                          height={520}
                        />
                      </Box>
                    </Fade>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Fade in={!loading} timeout={{ enter: 1000 }} style={{ transitionDelay: !loading ? '600ms' : '0ms' }}>
                      <Box sx={{ height: 550, width: '100%' }}>
                        <BarChart 
                          data={dashboardData?.distributions?.district || []} 
                          title="Most Jobs by District" 
                          xAxisKey="_id"
                          dataKey="count"
                          horizontal={true}
                          color="#10B981"
                          height={520}
                        />
                      </Box>
                    </Fade>
                  </Grid>
                </Grid>
                
                <Divider 
                  sx={{ 
                    my: 3,
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
            
            {/* ADDED: Map View Tab */}
            {tabValue === 1 && (
              <>
                <Box mb={3}>
                  <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MapIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Job Distribution Map
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Geographical distribution of {mapData.length} jobs in the selected period.
                    {mapData.length === 0 && !mapLoading && (
                      <span style={{ color: theme.palette.warning.main }}>
                        {' '}No jobs found with valid coordinates for the current filters.
                      </span>
                    )}
                  </Typography>
                </Box>
                
                {/* FIXED: Map with proper data */}
                <Box sx={{ height: 600, mb: 4 }}>
                  <JobMap 
                    data={mapData} 
                    title="" 
                    loading={mapLoading}
                  />
                </Box>
                
                {/* Map Statistics */}
                {!mapLoading && mapData.length > 0 && (
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                          {mapData.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Jobs with Location Data
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {new Set(mapData.map(job => job.location?.province)).size}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Provinces Covered
                        </Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                          {new Set(mapData.map(job => job.technicianNames)).size}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Unique Technician Teams
                        </Typography>
                      </Card>
                    </Grid>
                  </Grid>
                )}
                
                {/* Debug info for development */}
                {process.env.NODE_ENV === 'development' && (
                  <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1, mb: 2 }}>
                    <Typography variant="caption">
                      Debug: Map data: {mapData.length} jobs, Loading: {mapLoading.toString()}
                    </Typography>
                  </Box>
                )}
              </>
            )}
            
            {/* Customer Tab */}
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
            
            {/* Technician Performance Tab */}
            {tabValue === 3 && (
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
                  onClick={() => window.location.href = '/technicians'}
                >
                  Go to Technician Performance
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Fade>
    </Container>
  );
};

export default Dashboard;