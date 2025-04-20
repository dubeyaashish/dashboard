import React, { useState } from 'react';
import { 
  Paper, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useFilters } from '../../context/FilterContext';

const FilterBar = () => {
  const { filters, filterOptions, updateFilters, resetFilters, setDateRange } = useFilters();
  const [expanded, setExpanded] = useState(false);
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleQuickDateRange = (range) => {
    setDateRange(range);
  };
  
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'startDate' || key === 'endDate' || key === 'page' || key === 'limit') return false;
    return value !== 'All';
  }).length;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={expanded ? 12 : 8}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(newValue) => updateFilters({ startDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  inputFormat="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(newValue) => updateFilters({ endDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                  inputFormat="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => updateFilters({ status: e.target.value })}
                >
                  {filterOptions.statuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => updateFilters({ priority: e.target.value })}
                >
                  {filterOptions.priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {expanded && (
              <>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={filters.type}
                      label="Job Type"
                      onChange={(e) => updateFilters({ type: e.target.value })}
                    >
                      {filterOptions.types.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Province</InputLabel>
                    <Select
                      value={filters.province}
                      label="Province"
                      onChange={(e) => updateFilters({ province: e.target.value })}
                    >
                      {filterOptions.provinces.map((province) => (
                        <MenuItem key={province} value={province}>{province}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Team Leader</InputLabel>
                    <Select
                      value={filters.teamLeader}
                      label="Team Leader"
                      onChange={(e) => updateFilters({ teamLeader: e.target.value })}
                    >
                      {filterOptions.teamLeaders.map((leader) => (
                        <MenuItem key={leader} value={leader}>{leader}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
        
        {!expanded && (
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => handleQuickDateRange('last7Days')}
                startIcon={<DateRangeIcon />}
              >
                Last 7 Days
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => handleQuickDateRange('last30Days')}
                startIcon={<DateRangeIcon />}
              >
                Last 30 Days
              </Button>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => handleQuickDateRange('thisMonth')}
                startIcon={<DateRangeIcon />}
              >
                This Month
              </Button>
            </Box>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              {activeFiltersCount > 0 && (
                <Chip 
                  label={`${activeFiltersCount} active filters`} 
                  color="primary" 
                  size="small" 
                  sx={{ mr: 1 }}
                />
              )}
              
              <Tooltip title={expanded ? "Show less filters" : "Show more filters"}>
                <IconButton size="small" onClick={handleToggleExpand} color="primary">
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
                size="small"
                sx={{ mr: 1 }}
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => updateFilters({ page: 1 })}
                size="small"
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterBar;