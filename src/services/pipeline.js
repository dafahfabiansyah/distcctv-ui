import axios from 'axios';

// Configuration - menggunakan konfigurasi yang sama dengan auth.js
const API_CONFIG = {
  baseURL: import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000, // 10 seconds
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
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    })
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
      const response = await api.get(`/api/v2/crm/pipelines/${pipelineId}/leads`, {
        params: {
          date_from: params.date_from || params.dateFrom || '',
          date_to: params.date_to || params.dateTo || '',
          sales: params.sales || '',
          search: params.search || ''
        }
      });
      return response.data;
    } catch (error) {
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
   * Update stage lead (khusus stage saja)
   * @param {string|number} leadId - ID lead
   * @param {string|number} stageId - ID stage baru
   * @returns {Promise} Response dari API
   */
  async updateLeadStage(leadId, stageId) {
    try {
      const response = await api.put(`/api/v2/crm/leads/${leadId}/stage`, {
        stageId: stageId
      });
      return response.data;
    } catch (error) {
      console.error('Error updating lead stage:', error);
      throw error;
    }
  }

  /**
   * Update data lead lengkap (semua field)
   * @param {string|number} leadId - ID lead
   * @param {Object} leadData - Data lead yang akan diupdate
   * @returns {Promise} Response dari API
   */
  async updateLead(leadId, leadData) {
    try {
      const response = await api.put(`/api/v2/crm/leads/${leadId}`, leadData);
      return response.data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  /**
   * Update notes lead (shortcut untuk update field note saja)
   * @param {string|number} leadId - ID lead
   * @param {string} noteText - Text note yang akan disimpan
   * @returns {Promise} Response dari API
   */
  async updateLeadNotes(leadId, noteText) {
    try {
      const response = await api.put(`/api/v2/crm/leads/${leadId}`, {
        note: noteText
      });
      return response.data;
    } catch (error) {
      console.error('Error updating lead notes:', error);
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
      const response = await api.get(`/api/v2/crm/pipelines/${pipelineId}/stages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stages:', error);
      throw error;
    }
  }
}

export default new PipelineService();