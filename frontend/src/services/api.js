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
    const response = await api.get(`/customers?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const getCustomerJobs = async (customerId, params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  try {
    const response = await api.get(`/customers/${customerId}/jobs?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer jobs:', error);
    throw error;
  }
};

export const getJobDetails = async (customerId, jobId) => {
  try {
    const response = await api.get(`/customers/${customerId}/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
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