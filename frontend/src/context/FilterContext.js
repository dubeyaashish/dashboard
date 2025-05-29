// File: frontend/src/context/FilterContext.js (FIXED - Maintains existing functionality)
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getFilterOptions } from '../services/api';

// Initial filter values - KEEP EXISTING STRUCTURE
const initialFilters = {
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
  endDate: new Date(),
  status: 'All',
  type: 'All',
  priority: 'All',
  province: 'All',
  teamLeader: 'All',
  technician: 'All',
  technicianId: null,         // Keep for backward compatibility
  technicianIds: [],          // NEW: Array for multi-select
  page: 1,
  limit: 10
};

// Initial filter options (will be updated from API)
const initialFilterOptions = {
  statuses: ['All'],
  types: ['All'],
  priorities: ['All'],
  provinces: ['All'],
  teamLeaders: ['All'],
  technicians: []
};

// Create the context
const FilterContext = createContext();

// Custom hook to use the filter context
export const useFilters = () => useContext(FilterContext);

// Context provider component
export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState(initialFilterOptions);
  const [loading, setLoading] = useState(true);
  
  // Load filter options from backend on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      try {
        console.log('Loading filter options from backend...');
        const response = await getFilterOptions();
        
        if (response.success) {
          console.log('Filter options loaded successfully:', response.data);
          console.log('Types received:', response.data.types);
          console.log('Technicians received:', response.data.technicians?.length);
          setFilterOptions(response.data);
        } else {
          console.error('Failed to load filter options:', response);
          // Keep default options if API fails
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
        // Keep default options if error occurs
      } finally {
        setLoading(false);
      }
    };
    
    loadFilterOptions();
  }, []);
  
  // Function to update filters - FIXED to maintain consistency
  const updateFilters = (newFilters) => {
    console.log('Updating filters with:', newFilters);
    
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // IMPORTANT: Maintain consistency between single and multi-select technician filters
      if (newFilters.hasOwnProperty('technicianIds')) {
        if (Array.isArray(newFilters.technicianIds) && newFilters.technicianIds.length > 0) {
          // Multi-select: Set first technician as single selection for backward compatibility
          updated.technicianId = newFilters.technicianIds[0];
          updated.technician = newFilters.technician || 'Selected';
        } else {
          // No selection: Clear both
          updated.technicianId = null;
          updated.technician = 'All';
          updated.technicianIds = [];
        }
      }
      
      // Handle single technician selection (backward compatibility)
      if (newFilters.hasOwnProperty('technicianId')) {
        if (newFilters.technicianId && newFilters.technicianId !== 'All') {
          updated.technicianIds = [newFilters.technicianId];
          updated.technician = newFilters.technician || 'Selected';
        } else {
          updated.technicianIds = [];
          updated.technician = 'All';
          updated.technicianId = null;
        }
      }
      
      // Handle legacy technician field
      if (newFilters.hasOwnProperty('technician')) {
        if (newFilters.technician === 'All') {
          updated.technicianId = null;
          updated.technicianIds = [];
        }
      }
      
      console.log('Updated filters:', updated);
      return updated;
    });
  };
  
  // Function to reset filters to default
  const resetFilters = () => {
    console.log('Resetting filters to default');
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
    
    console.log(`Setting date range ${range}:`, { start, end });
    updateFilters({ startDate: start, endDate: end });
  };
  
  // Refresh filter options (can be called manually)
  const refreshFilterOptions = async () => {
    setLoading(true);
    try {
      console.log('Refreshing filter options...');
      const response = await getFilterOptions();
      
      if (response.success) {
        console.log('Filter options refreshed:', response.data);
        console.log('Types refreshed:', response.data.types);
        console.log('Technicians refreshed:', response.data.technicians?.length);
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Error refreshing filter options:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Legacy function for backward compatibility
  const updateFilterOptions = (data) => {
    console.log('Legacy updateFilterOptions called with:', data);
    if (data) {
      setFilterOptions(prev => ({ ...prev, ...data }));
    }
  };
  
  // Value to be provided by the context
  const value = {
    filters,
    filterOptions,
    loading,
    updateFilters,
    resetFilters,
    setDateRange,
    refreshFilterOptions,
    updateFilterOptions // Keep for backward compatibility
  };
  
  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;