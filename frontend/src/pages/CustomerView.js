// src/pages/CustomerView.js
import React, { useState } from 'react';
import { Container, Grid, Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Home as HomeIcon, Person as PersonIcon } from '@mui/icons-material';
import CustomerList from '../components/customer/CustomerList';
import JobHistory from '../components/customer/JobHistory';
import JobTimeline from '../components/customer/JobTimeline';

const CustomerView = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSelectedJob(null); // Reset selected job when customer changes
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            underline="hover" 
            color="inherit" 
            href="/" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Customer View
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" mt={2}>
          Customer Analysis
        </Typography>
        
        {selectedCustomer && (
          <Typography variant="h6" color="text.secondary" mt={1}>
            {selectedCustomer.name}
          </Typography>
        )}
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <CustomerList 
            onSelectCustomer={handleSelectCustomer} 
            selectedCustomerId={selectedCustomer?._id}
          />
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <JobHistory 
                customerId={selectedCustomer?._id} 
                onSelectJob={handleSelectJob} 
              />
            </Grid>
            
            <Grid item xs={12}>
              <JobTimeline 
                customerId={selectedCustomer?._id} 
                jobId={selectedJob?._id} 
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerView;