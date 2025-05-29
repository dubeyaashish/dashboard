// File: frontend/src/pages/CustomerView.js (with FilterBar added)
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Box, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Alert,
  Snackbar,
  alpha,
  useTheme
} from '@mui/material';
import { Home as HomeIcon, Person as PersonIcon } from '@mui/icons-material';
import CustomerList from '../components/customer/CustomerList';
import JobHistory from '../components/customer/JobHistory';
import JobTimeline from '../components/customer/JobTimeline';
import FilterBar from '../components/layout/FilterBar'; // Import FilterBar component
import { useLanguage } from '../context/LanguageContext';

const CustomerView = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { t } = useLanguage(); // For translations

  // Function to get customer name safely
  const getCustomerDisplayName = (customer) => {
    if (!customer) return t('No Customer Selected');
    
    // Try name field first
    if (customer.locationName) return customer.locationName;
    
    // Fallback to code
    if (customer.name) return customer.name;
    if (customer.code) return t('Customer Code') + ': ' + customer.code;
    
    // If both are missing, use ID or "Unknown Customer"
    return customer._id ? t('Customer ID') + ': ' + customer._id.toString().slice(-6) : t('Unknown Customer');
  };

  const handleSelectCustomer = (customer) => {
    console.log("Customer selected:", customer);
    
    // Validate customer object
    if (!customer || typeof customer !== 'object') {
      setError(t("Invalid customer data selected"));
      return;
    }
    
    if (!customer._id) {
      setError(t("Customer ID is missing"));
      return;
    }
    
    setSelectedCustomer(customer);
    setSelectedJob(null); // Reset selected job when customer changes
    setError(null); // Clear any previous errors
  };

  const handleSelectJob = (job) => {
    console.log("Job selected:", job);
    
    // Validate job object
    if (!job || typeof job !== 'object') {
      setError(t("Invalid job data selected"));
      return;
    }
    
    if (!job._id) {
      setError(t("Job ID is missing"));
      return;
    }
    
    setSelectedJob(job);
    setError(null); // Clear any previous errors
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      
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
            <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {t('Customer View')}
          </Typography>
        </Breadcrumbs>
        
        <Box 
          mt={2}
          sx={{ 
            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.default, 0)} 100%)`,
            p: 3,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            {t('Customer Analysis')}
          </Typography>
          
          {selectedCustomer && (
            <Typography variant="h6" color="text.secondary" mt={1}>
              {getCustomerDisplayName(selectedCustomer)}
            </Typography>
          )}
        </Box>
        
        {/* Add FilterBar component */}
        <Box mt={3}>
          <FilterBar />
        </Box>
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