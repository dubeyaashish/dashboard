// File: frontend/src/components/customer/JobHistory.js
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
  Pagination,
  Rating,
  Alert
} from '@mui/material';
import { getCustomerJobs } from '../../services/api';

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

const JobHistory = ({ customerId, onSelectJob }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    // Reset state when customer changes
    if (!customerId) {
      setJobs([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Convert ObjectId to string if it's an object
    const customerIdStr = typeof customerId === 'object' ? customerId.toString() : customerId;
    
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching jobs for customer ID: ${customerIdStr}`);
        const response = await getCustomerJobs(customerIdStr, { page, limit });
        
        if (response.success) {
          console.log("Jobs data received:", response.data);
          setJobs(response.data.jobs || []);
          setTotalPages(Math.ceil(response.data.pagination.total / limit));
        } else {
          console.error("API returned error:", response);
          setError("Failed to load job history");
        }
      } catch (error) {
        console.error('Error fetching customer jobs:', error);
        setError(`An error occurred while loading jobs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [customerId, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Job History</Typography>
        
        {!customerId ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography color="text.secondary">Select a customer to view job history</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Job No.</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Closed</TableCell>
                    <TableCell>Technicians</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <TableRow
                        hover
                        key={job._id}
                        onClick={() => {
                          console.log("Selected job:", job);
                          onSelectJob(job);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{job.jobNo}</TableCell>
                        <TableCell>
                          <Chip 
                            label={job.status || 'N/A'} 
                            color={getStatusColor(job.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{job.type || 'N/A'}</TableCell>
                        <TableCell>{job.locationName || 'N/A'}</TableCell>
                        <TableCell>{formatDate(job.createdAt)}</TableCell>
                        <TableCell>{formatDate(job.closeTime)}</TableCell>
                        <TableCell>{job.technicianNames || 'N/A'}</TableCell>
                        <TableCell>
                          {job.reviewScore ? (
                            <Rating 
                              value={job.reviewScore} 
                              readOnly 
                              size="small" 
                              precision={0.5} 
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No job history found for this customer
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default JobHistory;