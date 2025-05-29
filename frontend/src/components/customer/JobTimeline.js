// File: frontend/src/components/customer/JobTimeline.js
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Grid,
  Divider,
  Chip,
  Rating,
  Avatar,
  Alert
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Engineering as EngineeringIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { getJobDetails } from '../../services/api';

// Custom step icon based on status
const getStatusIcon = (status) => {
  switch (status) {
    case 'CREATED':
      return <AssignmentIcon />;
    case 'WAITINGJOB':
      return <EngineeringIcon />;
    case 'WORKING':
      return <EngineeringIcon color="primary" />;
    case 'COMPLETED':
      return <EngineeringIcon color="success" />;
    case 'CLOSED':
      return <AssignmentIcon color="success" />;
    case 'CANCELLED':
      return <AssignmentIcon color="error" />;
    case 'REVIEW':
      return <StarIcon color="secondary" />;
    default:
      return <AssignmentIcon />;
  }
};

const getStatusColor = (status) => {
  const statusColors = {
    'WAITINGJOB': 'warning',
    'WORKING': 'info',
    'PENDING': 'default',
    'COMPLETED': 'success',
    'CLOSED': 'success',
    'CANCELLED': 'error',
    'REVIEW': 'secondary',
    'CREATED': 'default'
  };
  
  return statusColors[status] || 'default';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
};

const JobTimeline = ({ customerId, jobId }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerId || !jobId) {
      setJobDetails(null);
      setTimeline([]);
      setError(null);
      return;
    }

    // Make sure IDs are strings
    const customerIdStr = String(customerId);
    const jobIdStr = String(jobId);
    
    console.log(`JobTimeline: Fetching details for job ID: ${jobIdStr}, customer ID: ${customerIdStr}`);

    const fetchJobDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getJobDetails(customerIdStr, jobIdStr);
        
        if (response.success) {
          console.log("Job details received:", response.data);
          setJobDetails(response.data.jobDetails);
          setTimeline(response.data.timeline);
        } else {
          console.error("API returned error for job details:", response);
          setError("Failed to load job details: " + (response.error || "Unknown error"));
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError(`An error occurred while loading job details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [customerId, jobId]);

  if (!customerId || !jobId) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Job Timeline</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography color="text.secondary">Select a job to view detailed timeline</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Job Timeline</Typography>
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Job Timeline</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Job Timeline</Typography>
        
        {jobDetails ? (
          <>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Job Number</Typography>
                      <Typography variant="body1">{jobDetails.jobNo}</Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <Box sx={{ mr: 1 }}>
                      <Chip 
                        label={jobDetails.status} 
                        color={getStatusColor(jobDetails.status)} 
                        size="small" 
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                      <Typography variant="body1">{jobDetails.type}</Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="flex-start">
                    <LocationIcon sx={{ mr: 1, color: 'info.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                      <Typography variant="body1">{jobDetails.location.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {jobDetails.location.address}, {jobDetails.location.district}, {jobDetails.location.province}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <PersonIcon sx={{ mr: 1, color: 'secondary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                      <Typography variant="body1">{jobDetails.customer?.name || 'N/A'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {jobDetails.customer?.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="flex-start" mb={2}>
                    <EngineeringIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Technicians</Typography>
                      {jobDetails.technicians && jobDetails.technicians.length > 0 ? (
                        jobDetails.technicians.map((tech, index) => (
                          <Typography key={index} variant="body2">
                            {tech.name} ({tech.position || 'N/A'})
                          </Typography>
                        ))
                      ) : (
                        <Typography variant="body2">No technicians assigned</Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {jobDetails.review && (
                    <Box display="flex" alignItems="flex-start">
                      <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Customer Review</Typography>
                        <Rating value={jobDetails.review.overall} readOnly precision={0.5} />
                        <Typography variant="body2">
                          Time: {jobDetails.review.time}/5, Manner: {jobDetails.review.manner}/5, 
                          Knowledge: {jobDetails.review.knowledge}/5
                        </Typography>
                        {jobDetails.review.comment && (
                          <Typography variant="body2" color="text.secondary" mt={1}>
                            "{jobDetails.review.comment}"
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Paper>
            
            <Typography variant="h6" gutterBottom>Status Timeline</Typography>
            
            {timeline && timeline.length > 0 ? (
              <Stepper orientation="vertical" sx={{ mt: 2 }}>
                {timeline.map((step, index) => (
                  <Step key={index} active={true} completed={index < timeline.length - 1}>
                    <StepLabel StepIconComponent={() => getStatusIcon(step.status)}>
                      <Typography variant="subtitle1">
                        {step.status}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(step.timestamp)}
                        </Typography>
                        <Typography variant="body2">
                          By: {step.by}
                        </Typography>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <Typography color="text.secondary">No timeline data available</Typography>
              </Box>
            )}
          </>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography color="text.secondary">No job details available. Please select a job.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default JobTimeline;