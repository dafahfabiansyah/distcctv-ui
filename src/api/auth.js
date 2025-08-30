import axios from 'axios';

// Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000, // 10 seconds
  withCredentials: true, // Enable cookies for session authentication
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
const apiClient = axios.create(API_CONFIG);

// API Endpoints
const ENDPOINTS = {
  GET_BRIDGE_TOKEN: '/api/auth/get-bridge-token',
  EXCHANGE_BRIDGE_TOKEN: '/api/auth/exchange-bridge-token',
  VERIFY_TOKEN: '/api/auth/verify',
  LOGOUT: '/api/auth/logout',
};

/**
 * Fetch bridge token from authentication API
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Bridge token response data
 * @throws {Error} When request fails
 */
export const getBridgeToken = async (email, password) => {
  try {
    const response = await apiClient.post(ENDPOINTS.GET_BRIDGE_TOKEN, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    // Enhanced error handling
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bridge token';
    const statusCode = error.response?.status;
    
    console.error('Bridge Token Error:', {
      message: errorMessage,
      status: statusCode,
      endpoint: ENDPOINTS.GET_BRIDGE_TOKEN,
    });
    
    throw new Error(`Bridge Token Request Failed: ${errorMessage}`);
  }
};

/**
 * Exchange bridge token for permanent API token
 * @param {string} bridgeToken - Bridge token to exchange
 * @returns {Promise<Object>} API token response data
 * @throws {Error} When request fails
 */
export const exchangeBridgeToken = async (bridgeToken) => {
  try {
    const response = await apiClient.post(ENDPOINTS.EXCHANGE_BRIDGE_TOKEN, {
      bridge_token: bridgeToken
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to exchange bridge token';
    const statusCode = error.response?.status;
    
    console.error('Exchange Bridge Token Error:', {
      message: errorMessage,
      status: statusCode,
      endpoint: ENDPOINTS.EXCHANGE_BRIDGE_TOKEN,
    });
    
    throw new Error(`Exchange Bridge Token Request Failed: ${errorMessage}`);
  }
};

/**
 * Verify API token
 * @param {string} apiToken - API token to verify
 * @returns {Promise<Object>} Verification response data
 * @throws {Error} When request fails
 */
export const verifyApiToken = async (apiToken) => {
  try {
    const response = await apiClient.get(ENDPOINTS.VERIFY_TOKEN, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to verify token';
    const statusCode = error.response?.status;
    
    console.error('Verify Token Error:', {
      message: errorMessage,
      status: statusCode,
      endpoint: ENDPOINTS.VERIFY_TOKEN,
    });
    
    throw new Error(`Verify Token Request Failed: ${errorMessage}`);
  }
};

/**
 * Logout and invalidate API token
 * @param {string} apiToken - API token to invalidate
 * @returns {Promise<Object>} Logout response data
 * @throws {Error} When request fails
 */
export const logoutUser = async (apiToken) => {
  try {
    const response = await apiClient.post(ENDPOINTS.LOGOUT, {}, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to logout';
    const statusCode = error.response?.status;
    
    console.error('Logout Error:', {
      message: errorMessage,
      status: statusCode,
      endpoint: ENDPOINTS.LOGOUT,
    });
    
    throw new Error(`Logout Request Failed: ${errorMessage}`);
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