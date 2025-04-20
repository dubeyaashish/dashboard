// src/context/FilterContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

// Initial filter values
const initialFilters = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  status: 'All',
  type: 'All',
  priority: 'All',
  province: 'All',
  teamLeader: 'All',
  page: 1,
  limit: 10
};

// Create the context
const FilterContext = createContext();

// Custom hook to use the filter context
export const useFilters = () => useContext(FilterContext);

// Context provider component
export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({
    statuses: ['All'],
    types: ['All'],
    priorities: ['All'],
    provinces: ['All'],
    teamLeaders: ['All']
  });
  
  // Function to update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Function to reset filters to default
  const resetFilters = () => {
    setFilters(initialFilters);
  };
  
  // Set predefined date ranges
  const setDateRange = (range) => {
    const end = new Date();
    let start = new Date();
    
    switch (range) {
      case 'last7Days':
        start.setDate(end.getDate() - 7);
        break;
      case 'last30Days':
        start.setDate(end.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        end = new Date(end.getFullYear(), end.getMonth(), 0);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }
    
    updateFilters({ startDate: start, endDate: end });
  };
  
  // Update filter options from API data
  const updateFilterOptions = (data) => {
    if (!data) return;
    
    const newOptions = { ...filterOptions };
    
    if (data.statuses && data.statuses.length > 0) {
      newOptions.statuses = ['All', ...data.statuses];
    }
    
    if (data.types && data.types.length > 0) {
      newOptions.types = ['All', ...data.types];
    }
    
    if (data.priorities && data.priorities.length > 0) {
      newOptions.priorities = ['All', ...data.priorities];
    }
    
    if (data.provinces && data.provinces.length > 0) {
      newOptions.provinces = ['All', ...data.provinces];
    }
    
    if (data.teamLeaders && data.teamLeaders.length > 0) {
      newOptions.teamLeaders = ['All', ...data.teamLeaders];
    }
    
    setFilterOptions(newOptions);
  };
  
  // Value to be provided by the context
  const value = {
    filters,
    filterOptions,
    updateFilters,
    resetFilters,
    setDateRange,
    updateFilterOptions
  };
  
  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;