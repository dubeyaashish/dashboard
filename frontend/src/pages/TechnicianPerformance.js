// File: frontend/src/pages/TechnicianPerformance.js (with FilterBar added)
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Divider,
  CircularProgress,
  alpha,
  useTheme,
  Chip,
  Fade
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Engineering as EngineeringIcon,
  Star as StarIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useFilters } from '../context/FilterContext';
import { getTechnicianPerformance } from '../services/api';
import FilterBar from '../components/layout/FilterBar';
import BarChart from '../components/dashboard/BarChart';
import { useLanguage } from '../context/LanguageContext';

const TechnicianPerformance = () => {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { t } = useLanguage(); // For translations
  
  useEffect(() => {
    const fetchPerformanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTechnicianPerformance({
          startDate: filters.startDate,
          endDate: filters.endDate,
          technicianId: filters.technicianId // Pass technician ID from filters
        });
        
        if (response.success) {
          console.log("Received technician performance data:", response.data);
          setPerformanceData(response.data);
        } else {
          console.error("API returned error:", response);
          setError(t("Failed to load technician data. Please try again."));
        }
      } catch (error) {
        console.error('Error fetching technician performance data:', error);
        setError(t("An error occurred while loading data. Please check your connection."));
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };
    
    fetchPerformanceData();
  }, [filters.startDate, filters.endDate, filters.technicianId, t]);
  
  const formatDate = (dateString) => {
    if (!dateString) return t('N/A');
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Function to prepare bar chart data for overall ratings
  const prepareRatingData = (metric) => {
    if (!performanceData || !performanceData.performanceSummary) return [];
    
    return performanceData.performanceSummary
      .map(tech => ({
        name: tech.technicianName,
        value: tech.metrics[metric]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 technicians
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
                <EngineeringIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {t('Technician Performance')}
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
                <TrendingUpIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: '-0.05em' }}>
                  {t('Technician Performance Dashboard')}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, maxWidth: '80%', color: theme.palette.text.secondary }}>
                {t('Analyze technician performance, efficiency, and customer satisfaction ratings. View detailed metrics of each technician\'s work quality and service levels.')}
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
              <Grid container spacing={4} mb={4}>
                <Grid item xs={12} md={6}>
                  <BarChart 
                    data={prepareRatingData('overall')} 
                    title={t("Overall Rating by Technician")} 
                    xAxisKey="name"
                    dataKey="value"
                    color="#6366F1" // Purple
                    height={400}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BarChart 
                    data={prepareRatingData('recommend')} 
                    title={t("Recommendation Rating")} 
                    xAxisKey="name"
                    dataKey="value"
                    color="#EC4899" // Pink
                    height={400}
                  />
                </Grid>
              </Grid>
              
              <Grid container spacing={4} mb={4}>
                <Grid item xs={12} md={4}>
                  <BarChart 
                    data={prepareRatingData('time')} 
                    title={t("Timeliness Rating")} 
                    xAxisKey="name"
                    dataKey="value"
                    color="#10B981" // Green
                    height={350}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <BarChart 
                    data={prepareRatingData('manner')} 
                    title={t("Manner Rating")} 
                    xAxisKey="name"
                    dataKey="value"
                    color="#F59E0B" // Amber
                    height={350}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <BarChart 
                    data={prepareRatingData('knowledge')} 
                    title={t("Knowledge Rating")} 
                    xAxisKey="name"
                    dataKey="value"
                    color="#3B82F6" // Blue
                    height={350}
                  />
                </Grid>
              </Grid>
              
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <AssessmentIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {t("Performance Summary")}
                    </Typography>
                  </Box>
                  
                  <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto', backgroundColor: 'transparent' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("Technician")}</TableCell>
                          <TableCell align="center">{t("Overall Rating")}</TableCell>
                          <TableCell align="center">{t("Time")}</TableCell>
                          <TableCell align="center">{t("Manner")}</TableCell>
                          <TableCell align="center">{t("Knowledge")}</TableCell>
                          <TableCell align="center">{t("Recommend")}</TableCell>
                          <TableCell align="center">{t("Review Count")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performanceData?.performanceSummary?.length > 0 ? (
                          performanceData.performanceSummary.map((tech) => (
                            <TableRow key={tech._id}>
                              <TableCell>{tech.technicianName}</TableCell>
                              <TableCell align="center">
                                <Rating value={tech.metrics.overall} precision={0.1} readOnly size="small" />
                                <Typography variant="body2">{tech.metrics.overall.toFixed(1)}</Typography>
                              </TableCell>
                              <TableCell align="center">{tech.metrics.time.toFixed(1)}</TableCell>
                              <TableCell align="center">{tech.metrics.manner.toFixed(1)}</TableCell>
                              <TableCell align="center">{tech.metrics.knowledge.toFixed(1)}</TableCell>
                              <TableCell align="center">{tech.metrics.recommend.toFixed(1)}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={tech.reviewCount} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ fontWeight: 600 }} 
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              {t("No performance data available")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <StarIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {t("Recent Reviews")}
                    </Typography>
                  </Box>
                  
                  <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto', backgroundColor: 'transparent' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("Job No")}</TableCell>
                          <TableCell>{t("Technician")}</TableCell>
                          <TableCell align="center">{t("Time")}</TableCell>
                          <TableCell align="center">{t("Manner")}</TableCell>
                          <TableCell align="center">{t("Knowledge")}</TableCell>
                          <TableCell align="center">{t("Overall")}</TableCell>
                          <TableCell align="center">{t("Recommend")}</TableCell>
                          <TableCell>{t("Comment")}</TableCell>
                          <TableCell>{t("Date")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performanceData?.recentReviews?.length > 0 ? (
                          performanceData.recentReviews.map((review) => (
                            <TableRow key={review._id}>
                              <TableCell>{review.jobNo || t('N/A')}</TableCell>
                              <TableCell>{review.technicianName}</TableCell>
                              <TableCell align="center">{review.time}</TableCell>
                              <TableCell align="center">{review.manner}</TableCell>
                              <TableCell align="center">{review.knowledge}</TableCell>
                              <TableCell align="center">
                                <Rating value={review.overall} precision={0.5} readOnly size="small" />
                              </TableCell>
                              <TableCell align="center">{review.recommend}</TableCell>
                              <TableCell>
                                {review.comment ? (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      maxWidth: 200, 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap' 
                                    }}
                                  >
                                    {review.comment}
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">{t("No comment")}</Typography>
                                )}
                              </TableCell>
                              <TableCell>{formatDate(review.createdAt)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              {t("No recent reviews available")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default TechnicianPerformance;