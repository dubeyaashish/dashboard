// File: frontend/src/pages/MapView.js (with FilterBar added)
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link,
  Card,
  CardContent,
  CircularProgress,
  alpha,
  useTheme,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Fade
} from '@mui/material';
import { 
  Home as HomeIcon, 
  LocationOn as LocationIcon,
  Map as MapIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useFilters } from '../context/FilterContext';
import { getMapData, getGeographicAnalytics } from '../services/api';
import FilterBar from '../components/layout/FilterBar';
import JobMap from '../components/dashboard/JobMap';
import BarChart from '../components/dashboard/BarChart';
import { useLanguage } from '../context/LanguageContext';

const MapView = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  const [geoAnalytics, setGeoAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { t } = useLanguage(); // For translations
  
  // Fetch map data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use Promise.all to parallelize requests
        const [mapResponse, geoResponse] = await Promise.all([
          getMapData(filters),
          getGeographicAnalytics(filters)
        ]);
        
        if (mapResponse.success) {
          console.log("Map data received:", mapResponse.data.length, "items");
          setMapData(mapResponse.data);
        } else {
          console.error("Map data not successful:", mapResponse);
          setError(t("Failed to load map data"));
        }
        
        if (geoResponse.success) {
          console.log("Geographic analytics data received:", geoResponse.data);
          setGeoAnalytics(geoResponse.data);
        } else {
          console.error("Geographic analytics not successful:", geoResponse);
          setError(error => error || t("Failed to load geographic analytics"));
        }
      } catch (error) {
        console.error('Error fetching geographic data:', error);
        setError(t("An error occurred while loading data. Please check your connection."));
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };
    
    fetchData();
  }, [filters, t]);
  
  // Format province data for charts - similar to Streamlit implementation
  const formatProvinceData = (provinceData) => {
    if (!provinceData || !Array.isArray(provinceData)) return [];
    
    return provinceData
      .filter(item => item.province) // Ensure province exists
      .map(item => ({
        name: item.province || t('Unknown'),
        count: item.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Get top 10 like Streamlit
  };

  // Format district data for chart - similar to Streamlit implementation
  const formatDistrictData = (districtData) => {
    if (!districtData || !Array.isArray(districtData)) return [];
    
    // Flatten the nested district structure
    const districts = [];
    districtData.forEach(province => {
      if (province.districts && Array.isArray(province.districts)) {
        province.districts.forEach(district => {
          if (district.name) {
            districts.push({
              name: `${district.name || t('Unknown')} (${province._id || t('Unknown')})`,
              count: district.count
            });
          }
        });
      }
    });
    
    return districts
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Get top 10 like Streamlit
  };
  
  // Get status counts by province
  const getStatusByProvince = () => {
    if (!geoAnalytics || !geoAnalytics.statusByProvince) return [];
    
    return geoAnalytics.statusByProvince.map(province => {
      const statusObj = { province: province._id || t('Unknown'), total: province.total || 0 };
      
      if (province.statuses && Array.isArray(province.statuses)) {
        province.statuses.forEach(status => {
          statusObj[status.status] = status.count;
        });
      }
      
      return statusObj;
    }).sort((a, b) => b.total - a.total).slice(0, 10);
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 2, md: 3 } }}>
      <Fade in={true} timeout={800}>
        <Box>
          <Box mb={4}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link 
                underline="hover" 
                color="inherit" 
                href="/" 
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {t('Dashboard')}
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {t('Geographic Analysis')}
              </Typography>
            </Breadcrumbs>
            
            <Box 
              mt={2}
              mb={4} 
              sx={{ 
                background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`,
                p: 3,
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box display="flex" alignItems="center" mb={1}>
                <MapIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: '-0.05em' }}>
                  {t('Geographic Distribution Dashboard')}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, maxWidth: '80%', color: theme.palette.text.secondary }}>
                {t('Visualize job distribution across provinces and districts. Analyze geographic patterns and identify high-activity areas with interactive maps and charts.')}
              </Typography>
              <FilterBar />
            </Box>
          </Box>
          
          {error && (
            <Box 
              sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                borderRadius: 2,
                color: theme.palette.error.main
              }}
            >
              <Typography variant="body1">{error}</Typography>
            </Box>
          )}
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="300px">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box mb={2}>
                <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  {t('Job Distribution Map')}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {t('Geographical distribution of')} {mapData.length} {t('jobs in the selected period')}.
                </Typography>
              </Box>
              
              <Box sx={{ height: 600, mb: 4 }}>
                <JobMap 
                  data={mapData} 
                  title="" 
                  loading={loading} 
                />
              </Box>
              
              <Grid container spacing={4} mb={4}>
                <Grid item xs={12} md={6}>
                  <BarChart 
                    data={formatProvinceData(geoAnalytics?.provinceData)} 
                    title={t("Top Provinces by Job Volume")}
                    xAxisKey="name"
                    dataKey="count"
                    horizontal={true}
                    color="#3B82F6" // Blue
                    height={450}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BarChart 
                    data={formatDistrictData(geoAnalytics?.districtBreakdown)} 
                    title={t("Top Districts by Job Volume")}
                    xAxisKey="name"
                    dataKey="count"
                    horizontal={true}
                    color="#10B981" // Green
                    height={450}
                  />
                </Grid>
              </Grid>
              
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <BusinessIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {t("Status Distribution by Province")}
                    </Typography>
                  </Box>
                  
                  <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto', backgroundColor: 'transparent' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("Province")}</TableCell>
                          <TableCell align="center">{t("Total Jobs")}</TableCell>
                          <TableCell align="center">{t("Waiting")}</TableCell>
                          <TableCell align="center">{t("Working")}</TableCell>
                          <TableCell align="center">{t("Completed")}</TableCell>
                          <TableCell align="center">{t("Closed")}</TableCell>
                          <TableCell align="center">{t("Cancelled")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getStatusByProvince().length > 0 ? (
                          getStatusByProvince().map((province, index) => (
                            <TableRow key={index}>
                              <TableCell>{province.province}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={province.total} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ fontWeight: 600 }}
                                />
                              </TableCell>
                              <TableCell align="center">{province.WAITINGJOB || 0}</TableCell>
                              <TableCell align="center">{province.WORKING || 0}</TableCell>
                              <TableCell align="center">{province.COMPLETED || 0}</TableCell>
                              <TableCell align="center">{province.CLOSED || 0}</TableCell>
                              <TableCell align="center">{province.CANCELLED || 0}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              {t("No data available")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
              
              {mapData.length > 0 && (
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {t("Sample Job Locations")}
                      </Typography>
                    </Box>
                    
                    <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto', backgroundColor: 'transparent' }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>{t("Job No")}</TableCell>
                            <TableCell>{t("Status")}</TableCell>
                            <TableCell>{t("Type")}</TableCell>
                            <TableCell>{t("Priority")}</TableCell>
                            <TableCell>{t("Location")}</TableCell>
                            <TableCell>{t("Province")}</TableCell>
                            <TableCell>{t("District")}</TableCell>
                            <TableCell>{t("Customer")}</TableCell>
                            <TableCell>{t("Technician")}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mapData.slice(0, 20).map((job) => (
                            <TableRow key={job.id || job._id}>
                              <TableCell>{job.jobNo}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={t(job.status)} 
                                  size="small" 
                                  color={job.status === 'COMPLETED' ? 'success' : 
                                         job.status === 'WORKING' ? 'info' : 
                                         job.status === 'WAITINGJOB' ? 'warning' : 
                                         job.status === 'CANCELLED' ? 'error' : 'default'} 
                                />
                              </TableCell>
                              <TableCell>{job.type}</TableCell>
                              <TableCell>{job.priority}</TableCell>
                              <TableCell>{job.location?.name || t('N/A')}</TableCell>
                              <TableCell>{job.location?.province || t('N/A')}</TableCell>
                              <TableCell>{job.location?.district || t('N/A')}</TableCell>
                              <TableCell>{job.customerName || t('N/A')}</TableCell>
                              <TableCell>{job.technicianNames || t('N/A')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default MapView;