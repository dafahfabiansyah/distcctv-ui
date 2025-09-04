import axios from 'axios';

// Configuration - menggunakan konfigurasi yang sama dengan auth.js
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
   * Update data lead lengkap (semua field) - menggunakan Sanctum API
   * @param {string|number} leadId - ID lead
   * @param {Object} leadData - Data lead yang akan diupdate
   * @returns {Promise} Response dari API
   */
  async updateLead(leadId, leadData) {
    try {
      // Convert object to URLSearchParams untuk format form-data
      const formData = new URLSearchParams();
      Object.keys(leadData).forEach(key => {
        if (leadData[key] !== null && leadData[key] !== undefined) {
          formData.append(key, leadData[key]);
        }
      });

      // Menggunakan endpoint Sanctum yang tidak memerlukan CSRF token
      const response = await api.put(`/api/v2/crm/lead/update/${leadId}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
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

  /**
   * Mengambil data quotations berdasarkan lead ID
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  /**
   * Mengambil quotations untuk lead tertentu (menggunakan Sanctum API)
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  async getQuotations(leadId) {
    try {
      const response = await api.get(`/api/v2/crm/leads/${leadId}/quotations-react`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quotations:', error);
      throw error;
    }
  }

  /**
   * Buat quotation baru (menggunakan Sanctum API)
   * @param {string|number} leadId - ID lead
   * @param {FormData|Object} quotationData - Data quotation
   * @returns {Promise} Response dari API
   */
  async createQuotation(leadId, quotationData) {
    try {
      const response = await api.post(`/api/v2/crm/leads/${leadId}/quotations`, quotationData);
      return response.data;
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  /**
   * Update quotation (menggunakan Sanctum API)
   * @param {string|number} quotationId - ID quotation
   * @param {FormData|Object} quotationData - Data quotation yang diupdate
   * @returns {Promise} Response dari API
   */
  async updateQuotation(quotationId, quotationData) {
    try {
      // For Laravel form-style update, we use POST with _method override
      if (quotationData instanceof FormData) {
        quotationData.append('_method', 'PUT')
      }
      
      // Use POST method as Laravel route is configured for POST
      const response = await api.put(`/api/v2/crm/quotations/${quotationId}`, quotationData);
      return response.data;
    } catch (error) {
      console.error('Error updating quotation:', error);
      throw error;
    }
  }

  /**
   * Mengambil detail quotation berdasarkan ID (menggunakan Sanctum API)
   * @param {string|number} quotationId - ID quotation
   * @returns {Promise} Response dari API
   */
  async getQuotationDetail(quotationId) {
    try {
      const response = await api.get(`/api/v2/crm/quotations/${quotationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quotation detail:', error);
      throw error;
    }
  }

  /**
   * Hapus quotation (menggunakan Sanctum API)
   * @param {string|number} quotationId - ID quotation
   * @returns {Promise} Response dari API
   */
  async deleteQuotation(quotationId) {
    try {
      const response = await api.delete(`/api/v2/crm/quotations/${quotationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quotation:', error);
      throw error;
    }
  }

  /**
   * Pool quotation amount to main lead (menggunakan Sanctum API)
   * @param {string|number} quotationId - ID quotation
   * @returns {Promise} Response dari API
   */
  async poolToMain(quotationId) {
    try {
      const response = await api.post(`/api/v2/crm/quotations/${quotationId}/pool-to-main`);
      return response.data;
    } catch (error) {
      console.error('Error pooling to main:', error);
      throw error;
    }
  }

  /**
   * Mengambil data emails berdasarkan lead ID
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  async getEmails(leadId) {
    try {
      const response = await api.get(`/api/v2/crm/leads/${leadId}/emails`);
      return response.data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Mengambil data activities berdasarkan lead ID
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  async getActivities(leadId) {
    try {
      const response = await api.get(`/api/v2/crm/leads/${leadId}/activities`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Mengambil AI Helper untuk lead tertentu
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  async getAiHelper(leadId) {
    try {
      const response = await api.get(`/api/v2/crm/leads/${leadId}/ai-helper`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI helper:', error);
      throw error;
    }
  }

  /**
   * Mengambil data WhatsApp chats berdasarkan lead ID
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  async getChats(leadId) {
    try {
      const response = await api.get(`/api/v2/crm/leads/${leadId}/chats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  }

  /**
   * Log call untuk lead tertentu
   * @param {string|number} leadId - ID lead
   * @returns {Promise} Response dari API
   */
  async logCall(leadId) {
    try {
      const response = await api.post(`/api/v2/crm/lead/${leadId}/log-call`);
      return response.data;
    } catch (error) {
      console.error('Error logging call:', error);
      throw error;
    }
  }

  /**
   * Mengambil status chat untuk lead tertentu dari gateway
   * @param {string} phone - Nomor telepon lead
   * @param {number} leadTimestamp - Timestamp lead (dalam detik)
   * @returns {Promise} Response dari API
   */
  async getLeadChatStatus(phone, leadTimestamp) {
    try {
      // Menggunakan gateway URL untuk chat status
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'http://127.0.0.1:8000';
      const response = await axios.get(`${gatewayUrl}/inbox/chat-summary`, {
        params: {
          phone: phone,
          leadTimestamp: leadTimestamp
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching lead chat status:', error);
      throw error;
    }
  }

  /**
   * Mengambil chat hot status untuk lead tertentu dari gateway
   * @param {string} phone - Nomor telepon lead
   * @returns {Promise} Response dari API
   */
  async getChatHot(phone) {
    try {
      // Menggunakan gateway URL untuk chat hot status
      const gatewayUrl = import.meta.env.VITE_GATEWAY_URL || 'http://127.0.0.1:8000';
      const response = await axios.get(`${gatewayUrl}/inbox/chat-hot`, {
        params: {
          phone: phone
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat hot status:', error);
      throw error;
    }
  }
}

export default new PipelineService();