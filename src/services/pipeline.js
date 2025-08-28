import axios from 'axios';

// Configuration - menggunakan konfigurasi yang sama dengan auth.js
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  // timeout: 10000, // 10 seconds timeout untuk development
  headers: {
    'Content-Type': 'application/json',
  },
}

// Create axios instance
const api = axios.create(API_CONFIG)

// Function to get CSRF token
const getCsrfToken = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.baseURL}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
    return response;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
};

// Add request interceptor untuk menambahkan bearer token dan CSRF token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add CSRF token for POST, PUT, PATCH, DELETE requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      // Get CSRF token from cookie or fetch it
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      } else {
        // Try to get CSRF token from Laravel Sanctum
        await getCsrfToken();
      }
      config.withCredentials = true;
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Service untuk mengelola data pipeline dan leads
 */
class PipelineService {
  /**
   * Mengambil data leads berdasarkan pipeline ID
   * @param {string|number} pipelineId - ID pipeline
   * @param {Object} params - Parameter filter (date_from, date_to, sales, search)
   * @returns {Promise} Response dari API
   */
  async getLeads(pipelineId, params = {}) {
    try {
      console.time('API_getLeads');
      console.log('Fetching leads for pipeline:', pipelineId, 'with params:', params);
      
      const response = await api.get(`/api/v2/crm/pipelines/${pipelineId}/leads`, {
        params: {
          date_from: params.dateFrom,
          date_to: params.dateTo,
          sales: params.sales,
          search: params.search
        }
      });
      
      console.timeEnd('API_getLeads');
      console.log('Leads response size:', response.data?.data?.length || 0, 'items');
      return response.data;
    } catch (error) {
      console.timeEnd('API_getLeads');
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  /**
   * Mengambil detail lead berdasarkan ID
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  async getLeadDetail(leadId) {
    try {
      const response = await api.get(`/api/v2/crm/lead/${leadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lead detail:', error);
      throw error;
    }
  }

  /**
   * Update stage lead
   * @param {string|number} leadId - ID lead
   * @param {string|number} stageId - ID stage baru
   * @returns {Promise} Response dari API
   */
  async updateLeadStage(leadId, stageId) {
    try {
      console.log(`Updating lead ${leadId} to stage ${stageId}`);
      const response = await api.put(`/api/v2/crm/leads/${leadId}/stage`, {
        stageId: stageId
      });
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating lead stage:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mengambil data stages berdasarkan pipeline ID
   * @param {string|number} pipelineId - ID pipeline
   * @returns {Promise} Response dari API
   */
  async getStages(pipelineId) {
    try {
      console.time('API_getStages');
      console.log('Fetching stages for pipeline:', pipelineId);
      
      const response = await api.get(`/api/v2/crm/pipelines/${pipelineId}/stages`);
      
      console.timeEnd('API_getStages');
      console.log('Stages response size:', response.data?.data?.length || 0, 'items');
      return response.data;
    } catch (error) {
      console.timeEnd('API_getStages');
      console.error('Error fetching stages:', error);
      throw error;
    }
  }
}

export default new PipelineService();