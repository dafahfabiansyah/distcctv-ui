import axios from 'axios'

// Configuration - menggunakan konfigurasi yang sama dengan auth.js dan pipeline.js
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  headers: {
    'Content-Type': 'application/json',
  },
}

// Create axios instance
const api = axios.create(API_CONFIG)

// Add request interceptor untuk menambahkan bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    console.log('Using token:', token ? `${token.substring(0, 20)}...` : 'No token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Don't set Content-Type if data is FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor untuk debugging
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('Dashboard API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    })
    return Promise.reject(error)
  }
)

/**
 * Generate default date range (today to 7 days ahead)
 * @returns {Object} Object dengan from dan to date dalam format YYYY-MM-DD
 */
const getDefaultDateRange = () => {
  const today = new Date()
  const sevenDaysLater = new Date()
  sevenDaysLater.setDate(today.getDate() + 7)
  
  return {
    from: today.toISOString().split('T')[0], // Format YYYY-MM-DD
    to: sevenDaysLater.toISOString().split('T')[0]
  }
}

/**
 * Service untuk mengelola data dashboard CRM v2
 */
class DashboardService {

  /**
   * Mengambil card data (Lead Count, Opportunity Value, Won, Lose)
   * @param {Object} params - Parameter filter (from, to)
   * @returns {Promise} Response dari API
   */
  async getCardData(params = {}) {
    try {
      const defaultRange = getDefaultDateRange()
      const queryParams = {
        from: params.from || defaultRange.from,
        to: params.to || defaultRange.to
      }
      
      console.log('Card data query params:', queryParams)
      
      const response = await api.get('/api/v2/crm/dashboard/card-data', {
        params: queryParams
      })
      return response.data
    } catch (error) {
      console.error('Error fetching card data:', error)
      throw error
    }
  }

  /**
   * Mengambil sales target data
   * @returns {Promise} Response dari API
   */
  async getSalesTargetData() {
    try {
      const response = await api.get('/api/v2/crm/dashboard/sales-target-data')
      return response.data
    } catch (error) {
      console.error('Error fetching sales target data:', error)
      throw error
    }
  }

  /**
   * Menyimpan sales target baru
   * @param {Object} targetData - Data sales target
   * @returns {Promise} Response dari API
   */
  async storeSalesTarget(targetData) {
    try {
      const response = await api.post('/api/v2/crm/dashboard/sales-target', targetData)
      return response.data
    } catch (error) {
      console.error('Error storing sales target:', error)
      throw error
    }
  }

  /**
   * Mengambil sales achievement data
   * @returns {Promise} Response dari API
   */
  async getSalesAchievement() {
    try {
      const response = await api.get('/api/v2/crm/dashboard/sales-achivment')
      return response.data
    } catch (error) {
      console.error('Error fetching sales achievement:', error)
      throw error
    }
  }

  /**
   * Mengambil sales statistic data
   * @param {Object} params - Parameter filter
   * @returns {Promise} Response dari API
   */
  async getSalesStatistic(params = {}) {
    try {
      const response = await api.get('/api/v2/crm/dashboard/sales-statistic', {
        params: params
      })
      return response.data
    } catch (error) {
      console.error('Error fetching sales statistic:', error)
      throw error
    }
  }

  /**
   * Mengambil sales statistic per day
   * @param {Object} params - Parameter filter
   * @returns {Promise} Response dari API
   */
  async getSalesStatisticPerDay(params = {}) {
    try {
      const response = await api.get('/api/v2/crm/dashboard/sales-statistic-perday', {
        params: params
      })
      return response.data
    } catch (error) {
      console.error('Error fetching sales statistic per day:', error)
      throw error
    }
  }

  /**
   * Mengambil dashboard summary (optimized endpoint untuk semua data dashboard)
   * @param {Object} params - Parameter filter (from, to)
   * @returns {Promise} Response dari API
   */
  async getDashboardSummary(params = {}) {
    try {
      const defaultRange = getDefaultDateRange()
      const queryParams = {
        from: params.from || defaultRange.from,
        to: params.to || defaultRange.to
      }
      
      console.log('Dashboard summary query params:', queryParams)
      
      const response = await api.get('/api/v2/crm/dashboard/dashboard-summary', {
        params: queryParams
      })
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      throw error
    }
  }

  /**
   * Mengambil main dashboard data
   * @returns {Promise} Response dari API
   */
  async getDashboard() {
    try {
      const response = await api.get('/api/v2/crm/dashboard')
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      throw error
    }
  }
}

// Create and export dashboard service instance
const dashboardService = new DashboardService()

export { dashboardService }
export default dashboardService
