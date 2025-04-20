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

const CustomerList = ({ onSelectCustomer, selectedCustomerId }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await getCustomers({ page, limit, search });
        if (response.success) {
          setCustomers(response.data.customers);
          setTotalPages(Math.ceil(response.data.pagination.total / limit));
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500);

    return () => clearTimeout(timer);
  }, [page, search]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Customers</Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search customers..."
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
                      onClick={() => onSelectCustomer(customer)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={customer.name} 
                        secondary={
                          <>
                            {customer.phone && <Typography component="span" variant="body2" display="block">{customer.phone}</Typography>}
                            {customer.email && <Typography component="span" variant="body2" color="text.secondary">{customer.email}</Typography>}
                          </>
                        } 
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No customers found" />
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
