// File: frontend/src/components/layout/FilterBar.js (Corrected Version)
import React, { useState, useEffect } from 'react';
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
  Badge,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { 
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarMonthIcon,
  Tune as TuneIcon,
  Check as CheckIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useFilters } from '../../context/FilterContext';
import { useLanguage } from '../../context/LanguageContext';

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
  const { 
    filters, 
    filterOptions, 
    loading: filterLoading, 
    updateFilters, 
    resetFilters, 
    setDateRange,
    refreshFilterOptions 
  } = useFilters();
  
  const [expanded, setExpanded] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const theme = useTheme();
  const { t } = useLanguage();
  
  // Set selected technician when filters change
  useEffect(() => {
    if (filters.technicianId && filterOptions.technicians) {
      const tech = filterOptions.technicians.find(t => t.id === filters.technicianId);
      setSelectedTechnician(tech || null);
    } else {
      setSelectedTechnician(null);
    }
  }, [filters.technicianId, filterOptions.technicians]);
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleQuickDateRange = (range) => {
    setDateRange(range);
  };
  
  // Handle technician selection
  const handleTechnicianChange = (event, newValue) => {
    console.log('Technician selected:', newValue);
    setSelectedTechnician(newValue);
    
    if (newValue) {
      updateFilters({ 
        technician: newValue.fullName,
        technicianId: newValue.id
      });
    } else {
      updateFilters({ 
        technician: 'All',
        technicianId: null
      });
    }
  };
  
  // Handle refresh filter options
  const handleRefreshFilters = () => {
    console.log('Refreshing filter options...');
    refreshFilterOptions();
  };
  
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'startDate' || key === 'endDate' || key === 'page' || key === 'limit' || key === 'technicianId') return false;
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
            {t("Filter Jobs")}
          </Typography>
          {filterLoading && (
            <CircularProgress size={16} sx={{ ml: 1 }} />
          )}
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
                label={t("Active Filters")} 
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
          <Tooltip title={t("Refresh filter options")}>
            <IconButton 
              size="small" 
              onClick={handleRefreshFilters}
              disabled={filterLoading}
              sx={{ mr: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
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
            {expanded ? t('Show Less') : t('Show More')}
          </Button>
        </Box>
      </Box>
      
      <Collapse in={true}>
        <Box px={3} py={2.5}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={expanded ? 3 : 2.4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("Start Date")}
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
            
            <Grid item xs={12} md={expanded ? 3 : 2.4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("End Date")}
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
            
            <Grid item xs={12} md={expanded ? 3 : 2.4}>
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
                <InputLabel>{t("Status")}</InputLabel>
                <Select
                  value={filters.status}
                  label={t("Status")}
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
                        {t(status)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={expanded ? 3 : 2.4}>
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
                <InputLabel>{t("Priority")}</InputLabel>
                <Select
                  value={filters.priority}
                  label={t("Priority")}
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
                        {t(priority)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Technician Selector - Always visible */}
            <Grid item xs={12} md={expanded ? 4 : 2.4}>
              <Autocomplete
                id="technician-selector"
                options={filterOptions.technicians || []}
                getOptionLabel={(option) => option.displayName || option.fullName || `${option.firstName} ${option.lastName}`}
                value={selectedTechnician}
                onChange={handleTechnicianChange}
                loading={filterLoading}
                loadingText={t('Loading technicians...')}
                noOptionsText={filterOptions.technicians?.length === 0 ? t('No technicians found') : t('Start typing to search...')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('Technician')}
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
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <EngineeringIcon fontSize="small" color="action" />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {filterLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box display="flex" flexDirection="column">
                      <Typography variant="body2">
                        {`${option.firstName} ${option.lastName}`}
                        {option.code && (
                          <Typography component="span" color="primary" sx={{ ml: 1 }}>
                            ({option.code})
                          </Typography>
                        )}
                      </Typography>
                      {option.position && (
                        <Typography variant="caption" color="text.secondary">
                          {option.position} - {option.type}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            
            {expanded && (
              <>
                <Grid item xs={12} md={4}>
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
                    <InputLabel>{t("Job Type")}</InputLabel>
                    <Select
                      value={filters.type}
                      label={t("Job Type")}
                      onChange={(e) => updateFilters({ type: e.target.value })}
                    >
                      {filterOptions.types.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type === 'All' && filters.type === 'All' && (
                            <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          )}
                          {t(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
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
                    <InputLabel>{t("Province")}</InputLabel>
                    <Select
                      value={filters.province}
                      label={t("Province")}
                      onChange={(e) => updateFilters({ province: e.target.value })}
                    >
                      {filterOptions.provinces.map((province) => (
                        <MenuItem key={province} value={province}>
                          {province === 'All' && filters.province === 'All' && (
                            <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          )}
                          {t(province)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={4}>
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
                    <InputLabel>{t("Team Leader")}</InputLabel>
                    <Select
                      value={filters.teamLeader}
                      label={t("Team Leader")}
                      onChange={(e) => updateFilters({ teamLeader: e.target.value })}
                    >
                      {filterOptions.teamLeaders.map((leader) => (
                        <MenuItem key={leader} value={leader}>
                          {leader === 'All' && filters.teamLeader === 'All' && (
                            <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                          )}
                          {t(leader)}
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
            {t("Last 7 Days")}
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
            {t("Last 30 Days")}
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
            {t("This Month")}
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
          <Tooltip title={t("Reset filters")}>
            <IconButton 
              size="small" 
              onClick={resetFilters}
              sx={{ mr: 1 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t("Toggle filter view")}>
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
          {t("Apply Filters")}
        </Button>
      </Box>
    </Paper>
  );
};

export default FilterBar;