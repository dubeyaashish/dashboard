// File: frontend/src/components/technician/TechnicianJobsTable.js - Add Excel download

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  TablePagination,
  Alert,
  Grid,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
  Button
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { getTechnicianJobs } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

// Excel export utility function
const exportToExcel = (data, filename = 'technician-jobs') => {
  // Create CSV content
  const headers = [
    'Job No.',
    'Status', 
    'Type',
    'Priority',
    'Customer Name',
    'Customer Phone',
    'Customer Email',
    'Location Name',
    'Province',
    'District',
    'Address',
    'Technicians',
    'Technician Count',
    'Appointment Time',
    'Created Date',
    'Updated Date'
  ];
  
  const csvContent = [
    headers.join(','),
    ...data.map(job => [
      job.jobNo || '',
      job.status || '',
      job.type || '',
      job.priority || '',
      job.customerContact?.name || '',
      job.customerContact?.phone || '',
      job.customerContact?.email || '',
      job.location?.name || '',
      job.location?.province || '',
      job.location?.district || '',
      job.location?.address || '',
      job.technicianNames || '',
      job.technicianCount || 0,
      job.appointmentTime ? new Date(job.appointmentTime).toLocaleString() : '',
      job.createdAt ? new Date(job.createdAt).toLocaleString() : '',
      job.updatedAt ? new Date(job.updatedAt).toLocaleString() : ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  // Create and download file
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Status and priority color functions (keep existing ones)
const getStatusColor = (status) => {
  const statusColors = {
    'WAITINGJOB': 'warning',
    'WORKING': 'info',
    'PENDING': 'default',
    'COMPLETED': 'success',
    'CLOSED': 'success',
    'CANCELLED': 'error',
    'REVIEW': 'secondary'
  };
  return statusColors[status] || 'default';
};

const getPriorityColor = (priority) => {
  const priorityColors = {
    'HIGH': 'error',
    'MEDIUM': 'warning',
    'LOW': 'success'
  };
  return priorityColors[priority] || 'default';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Error';
  }
};

const TechnicianJobsTable = ({ filters }) => {
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]); // Store all jobs for export
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const theme = useTheme();
  const { t } = useLanguage();

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getTechnicianJobs({
          startDate: filters.startDate,
          endDate: filters.endDate,
          technicianId: filters.technicianId,
          status: filters.status,
          type: filters.type,
          priority: filters.priority,
          page: page + 1,
          limit: rowsPerPage
        });
        
        if (response.success) {
          console.log("Technician jobs data received:", response.data);
          setJobs(response.data.jobs || []);
          setTotalCount(response.data.pagination?.total || 0);
          setSummary(response.data.summary || null);
        } else {
          console.error("API returned error:", response);
          setError(t("Failed to load technician jobs"));
        }
      } catch (error) {
        console.error('Error fetching technician jobs:', error);
        setError(t("An error occurred while loading jobs"));
      } finally {
        setLoading(false);
      }
    };

    if (filters) {
      fetchJobs();
    }
  }, [filters, page, rowsPerPage, t]);

  // Handle Excel export
  const handleExcelExport = async () => {
    setExportLoading(true);
    try {
      // Fetch ALL jobs for export (no pagination)
      const response = await getTechnicianJobs({
        startDate: filters.startDate,
        endDate: filters.endDate,
        technicianId: filters.technicianId,
        status: filters.status,
        type: filters.type,
        priority: filters.priority,
        page: 1,
        limit: 10000 // Get all jobs
      });
      
      if (response.success && response.data.jobs) {
        const filename = `technician-jobs${filters.technicianId && filters.technicianId !== 'All' ? '_filtered' : ''}`;
        exportToExcel(response.data.jobs, filename);
        
        // Show success message (optional)
        console.log(`Exported ${response.data.jobs.length} jobs to Excel`);
      } else {
        setError(t("Failed to export jobs"));
      }
    } catch (error) {
      console.error('Error exporting jobs:', error);
      setError(t("An error occurred while exporting"));
    } finally {
      setExportLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("Jobs by Technician")}
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("Jobs by Technician")}
          </Typography>
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.background.default, 0.5)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header with Export Button */}
        <Box 
          p={2.5} 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                display: 'block',
                width: 4,
                height: 20,
                borderRadius: 4,
                bgcolor: theme.palette.primary.main,
                mr: 1.5,
                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`
              }
            }}
          >
            {t("Jobs by Technician")}
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            {summary && (
              <Chip 
                label={`${t("Total")}: ${summary.totalJobs}`} 
                size="small" 
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            )}
            
            {/* Excel Export Button */}
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={exportLoading ? <CircularProgress size={16} color="inherit" /> : <GetAppIcon />}
              onClick={handleExcelExport}
              disabled={exportLoading || jobs.length === 0}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 1,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                }
              }}
            >
              {exportLoading ? t('Exporting...') : t('Download Excel')}
            </Button>
          </Box>
        </Box>

        {/* Summary Cards - Keep existing code */}
        {summary && summary.totalJobs > 0 && (
          <Box p={2} sx={{ borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {summary.totalJobs}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("Total Jobs")}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {t("By Status")}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="center">
                    {Object.entries(summary.statusCounts || {}).map(([status, count]) => (
                      <Chip 
                        key={status}
                        label={`${t(status)}: ${count}`} 
                        size="small" 
                        color={getStatusColor(status)}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {t("By Priority")}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="center">
                    {Object.entries(summary.priorityCounts || {}).map(([priority, count]) => (
                      <Chip 
                        key={priority}
                        label={`${t(priority)}: ${count}`} 
                        size="small" 
                        color={getPriorityColor(priority)}
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Table - Keep existing table code */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxHeight: 600,
            bgcolor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
            borderRadius: 0,
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>{t("Job No.")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Status")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Type")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Priority")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Customer")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Location")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Technicians")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Appointment")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("Created")}</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>{t("Actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length > 0 ? (
                jobs.map((job, index) => (
                  <TableRow
                    hover
                    key={job._id || index}
                    sx={{ 
                      '&:nth-of-type(odd)': {
                        bgcolor: alpha(theme.palette.action.hover, 0.05),
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.1),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {job.jobNo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={t(job.status)} 
                        color={getStatusColor(job.status)} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{job.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={job.priority} 
                        color={getPriorityColor(job.priority)} 
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {job.customerContact?.name || 'N/A'}
                        </Typography>
                        {job.customerContact?.phone && (
                          <Typography variant="caption" color="text.secondary">
                            <PhoneIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            {job.customerContact.phone}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {job.location?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          {job.location?.province || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {job.technicianNames}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <PersonIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          {job.technicianCount} {t("technician(s)")}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(job.appointmentTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(job.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={t("View Details")}>
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t("No jobs found")}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination - Keep existing pagination code */}
        {jobs.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{ 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                color: theme.palette.text.secondary,
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TechnicianJobsTable;