// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Box, Typography, Tabs, Tab, Button, Divider } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Business as BusinessIcon, 
  AssignmentTurnedIn as AssignmentIcon,
  Today as TodayIcon,
  LocationOn as LocationIcon
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
        setLoading(false);
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
          setMapLoading(false);
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>Job Management Dashboard</Typography>
        <FilterBar />
      </Box>
      
      {/* Metric Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total Jobs" 
            value={dashboardData?.metrics?.totalJobs?.toLocaleString() || '0'} 
            delta={5.2} // Example, replace with actual delta
            icon={<DashboardIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Closed Jobs" 
            value={dashboardData?.metrics?.closedJobs?.toLocaleString() || '0'} 
            delta={2.8} // Example, replace with actual delta
            icon={<AssignmentIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Today's Jobs" 
            value={dashboardData?.metrics?.todayJobs?.toLocaleString() || '0'} 
            icon={<TodayIcon fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Today's Closed" 
            value={dashboardData?.metrics?.todayClosed?.toLocaleString() || '0'} 
            icon={<BusinessIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Customers" />
          <Tab label="Technician Performance" />
        </Tabs>
      </Box>
      
      {/* Overview Tab */}
      {tabValue === 0 && (
        <>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <StatusPieChart 
                data={dashboardData?.distributions?.status || []} 
                title="Job Status Distribution" 
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <BarChart 
                data={dashboardData?.distributions?.priority || []} 
                title="Job Priority Distribution" 
                xAxisKey="_id"
                dataKey="count"
                color="#FFA500"
              />
            </Grid>
          </Grid>
          
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <BarChart 
                data={dashboardData?.distributions?.province || []} 
                title="Most Jobs by Province" 
                xAxisKey="_id"
                dataKey="count"
                horizontal={true}
                color="#1E90FF"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <BarChart 
                data={dashboardData?.distributions?.district || []} 
                title="Most Jobs by District" 
                xAxisKey="_id"
                dataKey="count"
                horizontal={true}
                color="#32CD32"
              />
            </Grid>
          </Grid>
          
          <Typography variant="h5" gutterBottom mb={2}>
            Job Map <LocationIcon fontSize="medium" sx={{ verticalAlign: 'middle', ml: 1 }} />
          </Typography>
          
          <Box mb={4} sx={{ height: 600 }}>
            <JobMap 
              data={mapData} 
              title="Job Distribution Map" 
              loading={mapLoading} 
            />
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" gutterBottom mb={2}>
            Recent Jobs
          </Typography>
          
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
        </>
      )}
      
      {/* Customer Tab - Will be implemented as a separate component */}
      {tabValue === 1 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5">Customer Analysis</Typography>
          <Typography variant="body1" mt={2}>
            Switch to the dedicated Customer View page for detailed customer analysis.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.href = '/customers'}
          >
            Go to Customer View
          </Button>
        </Box>
      )}
      
      {/* Technician Performance Tab - Will be implemented as a separate component */}
      {tabValue === 2 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5">Technician Performance</Typography>
          <Typography variant="body1" mt={2}>
            Switch to the dedicated Technician Performance page for detailed analysis.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.href = '/technician-performance'}
          >
            Go to Technician Performance
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;