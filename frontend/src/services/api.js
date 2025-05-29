// File: frontend/src/services/api.js (Complete version with multi-select technician support)
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to build query parameters with multi-select technician support
const buildFilterParams = (filters) => {
  const params = new URLSearchParams();
  
  // Basic filters
  if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.type && filters.type !== 'All') params.append('type', filters.type);
  if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
  if (filters.province && filters.province !== 'All') params.append('province', filters.province);
  if (filters.teamLeader && filters.teamLeader !== 'All') params.append('teamLeader', filters.teamLeader);
  
  // FIXED: Handle technician filtering properly
  if (filters.technicianIds && Array.isArray(filters.technicianIds) && filters.technicianIds.length > 0) {
    // Multi-select: Send as comma-separated string
    params.append('technicianIds', filters.technicianIds.join(','));
    console.log('API: Using multi-select technicians:', filters.technicianIds);
  } else if (filters.technicianId && filters.technicianId !== 'All' && filters.technicianId !== null) {
    // Single select: Backward compatibility
    params.append('technicianId', filters.technicianId);
    console.log('API: Using single technician:', filters.technicianId);
  } else if (filters.technician && filters.technician !== 'All' && filters.technician !== 'Selected') {
    // Legacy name-based filtering
    params.append('technician', filters.technician);
    console.log('API: Using legacy technician filter:', filters.technician);
  }
  
  // Pagination
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  console.log('API: Built filter params:', params.toString());
  return params;
};

// Get filter options from backend
export const getFilterOptions = async () => {
  try {
    console.log('Fetching filter options from backend...');
    const response = await api.get('/jobs/filter-options');
    
    if (response.data && response.data.success) {
      console.log('Filter options received:', response.data.data);
      console.log('Technicians count:', response.data.data.technicians?.length || 0);
      return response.data;
    } else {
      console.error('Failed to fetch filter options:', response.data);
      // Return default options if API fails
      return {
        success: false,
        data: {
          statuses: ['All', 'WAITINGJOB', 'WORKING', 'COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'],
          types: ['All'],
          priorities: ['All', 'HIGH', 'MEDIUM', 'LOW'],
          provinces: ['All'],
          technicians: [],
          teamLeaders: ['All']
        }
      };
    }
  } catch (error) {
    console.error('Error fetching filter options:', error);
    // Return default options if API fails
    return {
      success: false,
      data: {
        statuses: ['All', 'WAITINGJOB', 'WORKING', 'COMPLETED', 'CLOSED', 'CANCELLED', 'REVIEW'],
        types: ['All'],
        priorities: ['All', 'HIGH', 'MEDIUM', 'LOW'],
        provinces: ['All'],
        technicians: [],
        teamLeaders: ['All']
      }
    };
  }
};

// Job API calls with multi-select technician support
export const getJobOverview = async (filters) => {
  const params = buildFilterParams(filters);
  
  try {
    console.log('Fetching job overview with params:', params.toString());
    const response = await api.get(`/jobs/overview?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job overview:', error);
    throw error;
  }
};

export const getMapData = async (filters) => {
  const params = buildFilterParams(filters);
  
  try {
    console.log('Fetching map data with params:', params.toString());
    const response = await api.get(`/jobs/map-data?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching map data:', error);
    throw error;
  }
};

// Customer API calls
export const getCustomers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  
  try {
    console.log(`Fetching customers with params: ${queryParams.toString()}`);
    const response = await api.get(`/customers?${queryParams.toString()}`);
    
    // Validate and process response data
    if (response.data && response.data.success) {
      // Ensure customers array exists
      if (!response.data.data || !Array.isArray(response.data.data.customers)) {
        console.warn("API returned success but customers array is missing or invalid");
        response.data.data = {
          ...response.data.data,
          customers: []
        };
      }
      
      // Ensure pagination data exists
      if (!response.data.data.pagination) {
        response.data.data.pagination = {
          total: 0,
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 20,
          pages: 0
        };
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    // Return a structured error response
    return {
      success: false,
      error: error.message || 'Failed to fetch customers',
      data: {
        customers: [],
        pagination: {
          total: 0,
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 20,
          pages: 0
        }
      }
    };
  }
};

export const getCustomerJobs = async (customerId, params = {}) => {
  // Validate customerId
  if (!customerId) {
    console.error('Customer ID is required to fetch jobs');
    return {
      success: false,
      error: 'Customer ID is required',
      data: { jobs: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } }
    };
  }
  
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  try {
    console.log(`Fetching jobs for customer ${customerId} with params: ${queryParams.toString()}`);
    const response = await api.get(`/customers/${customerId}/jobs?${queryParams.toString()}`);
    
    // Validate and process response data
    if (response.data && response.data.success) {
      // Ensure jobs array exists
      if (!response.data.data || !Array.isArray(response.data.data.jobs)) {
        console.warn("API returned success but jobs array is missing or invalid");
        response.data.data = {
          ...response.data.data,
          jobs: []
        };
      }
      
      // Ensure pagination data exists
      if (!response.data.data.pagination) {
        response.data.data.pagination = {
          total: 0,
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 10,
          pages: 0
        };
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer jobs for ${customerId}:`, error);
    // Return a structured error response
    return {
      success: false,
      error: error.message || 'Failed to fetch customer jobs',
      data: {
        jobs: [],
        pagination: {
          total: 0,
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 10,
          pages: 0
        }
      }
    };
  }
};

export const getJobDetails = async (customerId, jobId) => {
  // Validate parameters
  if (!customerId || !jobId) {
    console.error('Customer ID and Job ID are required to fetch job details');
    return {
      success: false,
      error: 'Customer ID and Job ID are required',
      data: { jobDetails: null, timeline: [] }
    };
  }
  
  try {
    console.log(`Fetching job details for customer ${customerId}, job ${jobId}`);
    const response = await api.get(`/customers/${customerId}/jobs/${jobId}`);
    
    // Validate and process response data
    if (response.data && response.data.success) {
      // Ensure jobDetails exists
      if (!response.data.data || !response.data.data.jobDetails) {
        console.warn("API returned success but jobDetails is missing or invalid");
        response.data.data = {
          ...response.data.data,
          jobDetails: null,
          timeline: []
        };
      }
      
      // Ensure timeline array exists
      if (!response.data.data.timeline || !Array.isArray(response.data.data.timeline)) {
        response.data.data.timeline = [];
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching job details for customer ${customerId}, job ${jobId}:`, error);
    // Return a structured error response
    return {
      success: false,
      error: error.message || 'Failed to fetch job details',
      data: {
        jobDetails: null,
        timeline: []
      }
    };
  }
};

// Analytics API calls with multi-select technician support
export const getTechnicianPerformance = async (params = {}) => {
  const queryParams = buildFilterParams(params);
  
  try {
    console.log('Fetching technician performance with params:', queryParams.toString());
    const response = await api.get(`/analytics/technician-performance?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    throw error;
  }
};

export const getGeographicAnalytics = async (params = {}) => {
  const queryParams = buildFilterParams(params);
  
  try {
    console.log('Fetching geographic analytics with params:', queryParams.toString());
    const response = await api.get(`/analytics/geographic?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching geographic analytics:', error);
    throw error;
  }
};

// Technician Jobs API call with multi-select support
export const getTechnicianJobs = async (params = {}) => {
  const queryParams = buildFilterParams(params);
  
  try {
    console.log(`Fetching technician jobs with params: ${queryParams.toString()}`);
    const response = await api.get(`/analytics/technician-jobs?${queryParams.toString()}`);
    
    // Validate and process response data
    if (response.data && response.data.success) {
      // Ensure jobs array exists
      if (!response.data.data || !Array.isArray(response.data.data.jobs)) {
        console.warn("API returned success but jobs array is missing or invalid");
        response.data.data = {
          ...response.data.data,
          jobs: []
        };
      }
      
      // Ensure pagination data exists
      if (!response.data.data.pagination) {
        response.data.data.pagination = {
          total: 0,
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 10,
          pages: 0
        };
      }
      
      // Ensure summary exists
      if (!response.data.data.summary) {
        response.data.data.summary = {
          totalJobs: 0,
          statusCounts: {},
          typeCounts: {},
          priorityCounts: {}
        };
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching technician jobs:', error);
    // Return a structured error response
    return {
      success: false,
      error: error.message || 'Failed to fetch technician jobs',
      data: {
        jobs: [],
        pagination: {
          total: 0,
          page: parseInt(params.page) || 1,
          limit: parseInt(params.limit) || 10,
          pages: 0
        },
        summary: {
          totalJobs: 0,
          statusCounts: {},
          typeCounts: {},
          priorityCounts: {}
        }
      }
    };
  }
};

// Technician API calls
export const getTechnicians = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  try {
    console.log(`Fetching technicians with params: ${queryParams.toString()}`);
    
    // Try the real API first
    const response = await api.get(`/technicians?${queryParams.toString()}`);
    
    if (response.data && response.data.success) {
      return response.data;
    }
    
    // If technicians endpoint doesn't exist, use filter options endpoint
    const filterResponse = await getFilterOptions();
    if (filterResponse.success && filterResponse.data.technicians) {
      return {
        success: true,
        data: filterResponse.data.technicians
      };
    }
    
    // Last resort - empty array
    return {
      success: true,
      data: []
    };
    
  } catch (error) {
    console.error('Error fetching technicians:', error);
    
    // Try filter options as fallback
    try {
      const filterResponse = await getFilterOptions();
      if (filterResponse.success && filterResponse.data.technicians) {
        return {
          success: true,
          data: filterResponse.data.technicians
        };
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
    
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

export default api;