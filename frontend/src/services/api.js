import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Job API calls
export const getJobOverview = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.type && filters.type !== 'All') params.append('type', filters.type);
  if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
  if (filters.province && filters.province !== 'All') params.append('province', filters.province);
  if (filters.teamLeader && filters.teamLeader !== 'All') params.append('teamLeader', filters.teamLeader);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  try {
    const response = await api.get(`/jobs/overview?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job overview:', error);
    throw error;
  }
};

export const getMapData = async (filters) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) params.append('endDate', filters.endDate.toISOString());
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.type && filters.type !== 'All') params.append('type', filters.type);
  if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
  if (filters.province && filters.province !== 'All') params.append('province', filters.province);
  
  try {
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
      
      // Process customer data to ensure required fields
      response.data.data.customers = response.data.data.customers.map(customer => {
        // Ensure customer has an ID
        if (!customer._id) {
          console.warn("Customer missing _id:", customer);
        }
        
        // Ensure customer has a name or fallback
        if (!customer.name && !customer.code) {
          console.warn("Customer missing name and code:", customer);
        }
        
        return customer;
      });
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

// Analytics API calls
export const getTechnicianPerformance = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
  if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
  
  try {
    const response = await api.get(`/analytics/technician-performance?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching technician performance:', error);
    throw error;
  }
};

export const getGeographicAnalytics = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.startDate) queryParams.append('startDate', params.startDate.toISOString());
  if (params.endDate) queryParams.append('endDate', params.endDate.toISOString());
  
  try {
    const response = await api.get(`/analytics/geographic?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching geographic analytics:', error);
    throw error;
  }
};

export default api;