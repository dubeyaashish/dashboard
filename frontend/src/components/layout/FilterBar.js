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
  Tooltip,
  alpha,
  useTheme,
  Collapse,
  Typography,
  InputAdornment,
  Badge
} from '@mui/material';
import { 
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  Tune as TuneIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useFilters } from '../../context/FilterContext';

// Helper function to get status color
const getStatusColor = (status) => {
  const statusColors = {
    'WAITINGJOB': '#F59E0B',
    'WORKING': '#3B82F6',
    'PENDING': '#94A3B8',
    'COMPLETED': '#10B981',
    'CLOSED': '#059669',
    'CANCELLED': '#EF4444',
    'REVIEW': '#8B5CF6'
  };
  
  return statusColors[status] || '#94A3B8';
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
  const priorityColors = {
    'HIGH': '#EF4444',
    'MEDIUM': '#F59E0B',
    'LOW': '#10B981'
  };
  
  return priorityColors[priority] || '#94A3B8';
};

const FilterBar = () => {
  const { filters, filterOptions, updateFilters, resetFilters, setDateRange } = useFilters();
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  
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
    <Paper 
      sx={{ 
        p: 0, 
        mb: 3, 
        borderRadius: 3,
        overflow: 'hidden',
        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
        boxShadow: `0 4px 20px ${alpha(theme.palette.background.default, 0.5)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Box 
        px={3} 
        py={2}
        sx={{ 
          borderBottom: expanded ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center">
          <TuneIcon 
            sx={{ 
              color: theme.palette.primary.main, 
              mr: 1.5,
              fontSize: '1.2rem'
            }} 
          />
          <Typography variant="subtitle1" fontWeight={600}>
            Filter Jobs
          </Typography>
          {activeFiltersCount > 0 && (
            <Badge 
              badgeContent={activeFiltersCount} 
              color="primary"
              sx={{ 
                ml: 1.5,
                '& .MuiBadge-badge': {
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }
              }}
            >
              <Chip 
                label="Active Filters" 
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }} 
              />
            </Badge>
          )}
        </Box>
        
        <Box display="flex" alignItems="center">
          <Button 
            size="small" 
            onClick={handleToggleExpand}
            endIcon={<KeyboardArrowDownIcon 
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }} 
            />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500,
              color: theme.palette.text.secondary
            }}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
      </Box>
      
      <Collapse in={true}>
        <Box px={3} py={2.5}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={expanded ? 4 : 3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(newValue) => updateFilters({ startDate: newValue })}
                  slots={{
                    openPickerIcon: CalendarMonthIcon,
                  }}
                  slotProps={{
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          }
                        }
                      }
                    }
                  }}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={expanded ? 4 : 3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(newValue) => updateFilters({ endDate: newValue })}
                  slots={{
                    openPickerIcon: CalendarMonthIcon,
                  }}
                  slotProps={{
                    textField: { 
                      fullWidth: true,
                      size: "small",
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          }
                        }
                      }
                    }
                  }}
                  format="dd/MM/yyyy"
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={expanded ? 4 : 3}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    }
                  }
                }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => updateFilters({ status: e.target.value })}
                >
                  {filterOptions.statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      <Box display="flex" alignItems="center" width="100%">
                        {status !== 'All' && (
                          <Box
                            component="span"
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: getStatusColor(status),
                              mr: 1.5
                            }}
                          />
                        )}
                        {status === 'All' && filters.status === 'All' && (
                          <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                        )}
                        {status}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={expanded ? 6 : 3}>
              <FormControl 
                fullWidth 
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    }
                  }
                }}
              >
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => updateFilters({ priority: e.target.value })}
                >
                  {filterOptions.priorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      <Box display="flex" alignItems="center" width="100%">
                        {priority !== 'All' && (
                          <Box
                            component="span"
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: getPriorityColor(priority),
                              mr: 1.5
                            }}
                          />
                        )}
                        {priority === 'All' && filters.priority === 'All' && (
                          <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                        )}
                        {priority}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {expanded && (
              <>
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        }
                      }
                    }}
                  >
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={filters.type}
                      label="Job Type"
                      onChange={(e) => updateFilters({ type: e.target.value })}
                    >
                      {filterOptions.types.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type === 'All' && filters.type === 'All' && (
                            <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          )}
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        }
                      }
                    }}
                  >
                    <InputLabel>Province</InputLabel>
                    <Select
                      value={filters.province}
                      label="Province"
                      onChange={(e) => updateFilters({ province: e.target.value })}
                    >
                      {filterOptions.provinces.map((province) => (
                        <MenuItem key={province} value={province}>
                          {province === 'All' && filters.province === 'All' && (
                            <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          )}
                          {province}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl 
                    fullWidth 
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        }
                      }
                    }}
                  >
                    <InputLabel>Team Leader</InputLabel>
                    <Select
                      value={filters.teamLeader}
                      label="Team Leader"
                      onChange={(e) => updateFilters({ teamLeader: e.target.value })}
                    >
                      {filterOptions.teamLeaders.map((leader) => (
                        <MenuItem key={leader} value={leader}>
                          {leader === 'All' && filters.teamLeader === 'All' && (
                            <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          )}
                          {leader}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      </Collapse>
      
      {!expanded && (
        <Box 
          display="flex" 
          justifyContent="center" 
          gap={2} 
          py={1.5}
          px={3}
          sx={{ 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleQuickDateRange('last7Days')}
            startIcon={<DateRangeIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }
            }}
          >
            Last 7 Days
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleQuickDateRange('last30Days')}
            startIcon={<DateRangeIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }
            }}
          >
            Last 30 Days
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => handleQuickDateRange('thisMonth')}
            startIcon={<DateRangeIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              }
            }}
          >
            This Month
          </Button>
        </Box>
      )}
      
      <Box 
        p={2} 
        sx={{ 
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: alpha(theme.palette.background.paper, 0.4)
        }}
      >
        <Box display="flex" alignItems="center">
          <Tooltip title="Reset filters">
            <IconButton 
              size="small" 
              onClick={resetFilters}
              sx={{ mr: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Toggle filter view">
            <IconButton 
              size="small" 
              onClick={handleToggleExpand}
              color={expanded ? 'primary' : 'default'}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => updateFilters({ page: 1 })}
          size="small"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
            }
          }}
        >
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterBar;