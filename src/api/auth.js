import axios from 'axios';

// Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const apiClient = axios.create(API_CONFIG);

// API Endpoints
const ENDPOINTS = {
  BRIDGE_TOKEN: '/api/auth/bridge-token',
};

/**
 * Fetch bridge token from authentication API
 * @returns {Promise<Object>} Bridge token response data
 * @throws {Error} When request fails
 */
export const getBridgeToken = async () => {
  try {
    const response = await apiClient.get(ENDPOINTS.BRIDGE_TOKEN);
    return response.data;
  } catch (error) {
    // Enhanced error handling
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bridge token';
    const statusCode = error.response?.status;
    
    console.error('Bridge Token Error:', {
      message: errorMessage,
      status: statusCode,
      endpoint: ENDPOINTS.BRIDGE_TOKEN,
    });
    
    throw new Error(`Bridge Token Request Failed: ${errorMessage}`);
  }
};

// Optional: Add request/response interceptors for better debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Response Error: ${error.response?.status} ${error.config?.url}`);
    return Promise.reject(error);
  }
);