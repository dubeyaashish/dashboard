// File: frontend/src/components/layout/FilterBar.js (COMPLETE FILE with Multi-Select Technician)
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
  const theme = useTheme();
  const { t } = useLanguage();
  
  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };
  
  const handleQuickDateRange = (range) => {
    setDateRange(range);
  };
  
  // Handle refresh filter options
  const handleRefreshFilters = () => {
    console.log('Refreshing filter options...');
    refreshFilterOptions();
  };
  
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'startDate' || key === 'endDate' || key === 'page' || key === 'limit' || key === 'technicianId' || key === 'technicianIds') return false;
    if (key === 'technicianIds' && Array.isArray(value) && value.length > 0) return true;
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
            {/* Start Date */}
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
            
            {/* End Date */}
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
            
            {/* Status Filter */}
            <Grid item xs={12} md={expanded ? 2 : 1.6}>
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
            
            {/* Type Filter */}
            <Grid item xs={12} md={expanded ? 2 : 1.6}>
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
                      <Box display="flex" alignItems="center" width="100%">
                        {type === 'All' && filters.type === 'All' && (
                          <CheckIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                        )}
                        {t(type)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Priority Filter */}
            <Grid item xs={12} md={expanded ? 2 : 1.6}>
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
            
            {/* MULTI-SELECT TECHNICIAN FILTER */}
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
                <InputLabel>{t("Technicians")}</InputLabel>
                <Select
                  multiple
                  value={filters.technicianIds || []}
                  label={t("Technicians")}
                  onChange={(e) => {
                    const values = e.target.value;
                    console.log('Multiple technicians selected:', values);
                    
                    if (values.length === 0 || values.includes('All')) {
                      // If "All" is selected or nothing selected, clear all
                      updateFilters({ 
                        technicianIds: [],
                        technician: 'All'
                      });
                    } else {
                      // Update with selected technician IDs
                      const selectedTechNames = values
                        .map(id => {
                          const tech = filterOptions.technicians.find(t => t.id === id);
                          return tech ? tech.fullName : null;
                        })
                        .filter(name => name)
                        .join(', ');
                      
                      updateFilters({ 
                        technicianIds: values,
                        technician: selectedTechNames || 'All'
                      });
                    }
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return t("All Technicians");
                    }
                    
                    if (selected.length === 1) {
                      const tech = filterOptions.technicians.find(t => t.id === selected[0]);
                      return tech ? tech.fullName : t("1 Selected");
                    }
                    
                    return `${selected.length} ${t("Technicians Selected")}`;
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        borderRadius: 8,
                      },
                    },
                  }}
                >
                  {/* "All" option */}
                  <MenuItem value="All">
                    <Box display="flex" alignItems="center" width="100%">
                      <CheckIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 1, 
                          color: (!filters.technicianIds || filters.technicianIds.length === 0) 
                            ? theme.palette.primary.main 
                            : 'transparent' 
                        }} 
                      />
                      {t("All Technicians")}
                    </Box>
                  </MenuItem>
                  
                  {/* Individual technicians */}
                  {filterOptions.technicians && filterOptions.technicians.length > 0 ? (
                    filterOptions.technicians.map((tech) => (
                      <MenuItem key={tech.id} value={tech.id}>
                        <Box display="flex" alignItems="center" width="100%">
                          <CheckIcon 
                            fontSize="small" 
                            sx={{ 
                              mr: 1, 
                              color: (filters.technicianIds && filters.technicianIds.includes(tech.id))
                                ? theme.palette.primary.main 
                                : 'transparent' 
                            }} 
                          />
                          <Box display="flex" flexDirection="column" width="100%">
                            <Typography variant="body2">
                              {tech.fullName}
                              {tech.code && (
                                <Typography component="span" color="primary" sx={{ ml: 1 }}>
                                  ({tech.code})
                                </Typography>
                              )}
                            </Typography>
                            {tech.position && (
                              <Typography variant="caption" color="text.secondary">
                                {tech.position}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <Typography variant="body2" color="text.secondary">
                        {filterLoading ? t('Loading...') : t('No technicians found')}
                      </Typography>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Expanded filters */}
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