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
  Rating
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
  const date = new Date(dateString);
  return date.toLocaleString();
};

const JobHistory = ({ customerId, onSelectJob }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!customerId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await getCustomerJobs(customerId, { page, limit });
        if (response.success) {
          setJobs(response.data.jobs);
          setTotalPages(Math.ceil(response.data.pagination.total / limit));
        }
      } catch (error) {
        console.error('Error fetching customer jobs:', error);
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
                        onClick={() => onSelectJob(job)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{job.jobNo}</TableCell>
                        <TableCell>
                          <Chip 
                            label={job.status} 
                            color={getStatusColor(job.status)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{job.type}</TableCell>
                        <TableCell>{job.locationName}</TableCell>
                        <TableCell>{formatDate(job.createdAt)}</TableCell>
                        <TableCell>{formatDate(job.closeTime)}</TableCell>
                        <TableCell>{job.technicianNames}</TableCell>
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
                        No job history found
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