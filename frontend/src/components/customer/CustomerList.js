// Example of how to update a component with translations
// File: frontend/src/components/customer/CustomerList.js (with translations)
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  InputAdornment, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Box,
  CircularProgress,
  Pagination
} from '@mui/material';
import { Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { getCustomers } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext'; // Import the language hook

const CustomerList = ({ onSelectCustomer, selectedCustomerId }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const { t } = useLanguage(); // Get the translate function
  const limit = 20;

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCustomers({ page, limit, search });
        console.log("Customer API response:", response); // Debug log
        
        if (response.success) {
          setCustomers(response.data.customers || []);
          setTotalPages(Math.ceil(response.data.pagination.total / limit));
        } else {
          console.error("API returned error:", response);
          setError(t("Failed to load customers"));
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        setError(t("An error occurred while loading customers"));
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, search, t]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Modified helper function to use locationName from JobLocation
  const getCustomerDisplayName = (customer) => {
    if (!customer) return t('Unknown');
    
    // Use locationName from the aggregation pipeline which gets it from JobLocation
    if (customer.locationName) return customer.locationName;
    
    // Fallbacks if locationName is not available
    if (customer.name) return customer.name;
    if (customer.code) return `${t('Code')}: ${customer.code}`;
    return customer._id ? `${t('ID')}: ${customer._id.slice(-6)}` : t('Unknown Customer');
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{t('Customers')}</Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('Search customers...')}
          value={search}
          onChange={handleSearchChange}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        
        {error && (
          <Box sx={{ color: 'error.main', mt: 1, mb: 1 }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={400}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <List sx={{ height: 400, overflow: 'auto', mt: 1 }}>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <React.Fragment key={customer._id}>
                    <ListItem 
                      button 
                      selected={selectedCustomerId === customer._id}
                      onClick={() => {
                        console.log("Selected customer:", customer); // Debug log
                        onSelectCustomer(customer);
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={getCustomerDisplayName(customer)}
                        secondary={
                          <>
                            {customer.phone && <Typography component="span" variant="body2" display="block">{customer.phone}</Typography>}
                            {customer.email && <Typography component="span" variant="body2" color="text.secondary">{customer.email}</Typography>}
                            {!customer.phone && !customer.email && <Typography component="span" variant="body2" color="text.secondary">{customer.customerType || t('No contact info')}</Typography>}
                          </>
                        } 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary={t('No customers found')} />
                </ListItem>
              )}
            </List>
            
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

export default CustomerList;