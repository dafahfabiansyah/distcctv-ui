// services/auth.js
import axios from 'axios'

// Configuration - menggunakan konfigurasi yang sama dengan api/auth.js
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
}

// Create axios instance
const api = axios.create(API_CONFIG)

/**
 * Get bridge token dari backend untuk user yang sudah login via web session
 * @returns {Promise<Object>} Response dengan success status dan data/error
 */
export const getBridgeToken = async () => {
  try {
    // Panggil endpoint bridge-token yang memerlukan web session authentication
    const response = await api.get('/api/auth/bridge-token', {
      withCredentials: true // Untuk mengirim session cookies
    })
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: {
          bridge_token: response.data.data.token, // Bridge token untuk di-exchange
          user: response.data.data.user
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: response.data?.message || 'Failed to get bridge token'
        }
      }
    }
  } catch (error) {
    console.error('Get bridge token error:', error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Network error'
      }
    }
  }
}

/**
 * Get bridge token directly dengan email dan password (tanpa web session)
 * @param {string} email - Email user
 * @param {string} password - Password user
 * @returns {Promise<Object>} Response dengan success status dan data/error
 */
export const getBridgeTokenDirect = async (email, password) => {
  try {
    const response = await api.post('/api/auth/get-bridge-token', {
      email,
      password
    })
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: {
          bridge_token: response.data.data.token, // Bridge token untuk di-exchange
          user: response.data.data.user
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: response.data?.message || 'Failed to get bridge token'
        }
      }
    }
  } catch (error) {
    console.error('Get bridge token direct error:', error)
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Network error'
      }
    }
  }
}

/**
 * Exchange bridge token dengan API token permanen
 * @param {string} bridgeToken - Bridge token yang didapat dari getBridgeTokenDirect
 * @returns {Promise<Object>} Response dengan success status dan data/error
 */
export const exchangeBridgeToken = async (bridgeToken) => {
  try {
    const response = await api.post('/api/auth/exchange-bridge-token', {}, {
      headers: {
        'Authorization': `Bearer ${bridgeToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: {
          token: response.data.token,
          user: response.data.user,
          expires_at: response.data.expires_at,
          is_existing: response.data.message.includes('existing')
        }
      }
    } else {
      return {
        success: false,
        error: {
          message: response.data?.message || 'Failed to exchange bridge token'
        }
      }
    }
  } catch (error) {
    console.error('Exchange Bridge Token Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      endpoint: '/api/auth/exchange-bridge-token'
    })
    
    return {
      success: false,
      error: {
        message: error.response?.data?.message || error.message || 'Network error'
      }
    }
  }
}

/**
 * Verify current API token
 * @param {string} apiToken - API token yang akan diverifikasi (optional, akan ambil dari localStorage jika tidak ada)
 * @returns {Promise<Object>} Response dengan success status dan data/error
 */
export const verifyToken = async (apiToken = null) => {
  try {
    const token = apiToken || localStorage.getItem('access_token')
    if (!token) {
      throw new Error('No token found')
    }
    
    const response = await api.get('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Verify Token Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      endpoint: '/api/auth/verify'
    })
    
    return {
      success: false,
      error: error.response?.data || error.message
    }
  }
}

/**
 * Login dengan email dan password
 * @param {string} email - Email user
 * @param {string} password - Password user
 * @returns {Promise<Object>} Response dengan success status dan data/error
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Login Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      endpoint: '/api/auth/login'
    })
    
    return {
      success: false,
      error: error.response?.data || error.message
    }
  }
}

/**
 * Get current user data
 * @returns {Promise<Object>} Response dengan success status dan data/error
 */
export const getMe = async () => {
  try {
    const token = localStorage.getItem('access_token')
    if (!token) {
      throw new Error('No token found')
    }
    
    const response = await api.get('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Get Me Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      endpoint: '/api/auth/me'
    })
    
    return {
      success: false,
      error: error.response?.data || error.message
    }
  }
}

/**
 * Logout dan invalidate token
 * @param {string} apiToken - API token yang akan di-invalidate
 * @returns {Promise<Object>} Response dengan success status
 */
export const logout = async (apiToken) => {
  try {
    const response = await api.post('/api/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Logout Error:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      endpoint: '/api/auth/logout'
    })
    
    return {
      success: false,
      error: error.response?.data || error.message
    }
  }
}

// Add request/response interceptors untuk debugging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Auth API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Auth Request Error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    console.log(`✅ Auth API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ Auth Response Error: ${error.response?.status} ${error.config?.url}`)
    return Promise.reject(error)
  }
)