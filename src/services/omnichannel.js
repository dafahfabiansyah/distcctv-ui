// Omnichannel API Service
const API_BASE_URL = import.meta.env.VITE_BASE_URL + '/api/omnichannel';

// Get auth token from localStorage or meta tag
const getAuthToken = () => {
  // Try to get token from localStorage first (if using SPA authentication)
  const token = localStorage.getItem('access_token') || 
                localStorage.getItem('auth_token') ||
                sessionStorage.getItem('auth_token') ||
                document.querySelector('meta[name="api-token"]')?.getAttribute('content');
  return token;
};

// Set auth token for testing (you can call this from browser console)
window.setOmnichannelToken = (token) => {
  localStorage.setItem('access_token', token);
  console.log('Omnichannel auth token set:', token);
};

// For testing without token, fallback to CSRF
window.clearOmnichannelToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
  console.log('Omnichannel auth token cleared, will use CSRF fallback');
};

// Get bridge token from Laravel session (for users already logged in via web)
window.getBridgeToken = async () => {
  try {
    const response = await fetch(import.meta.env.VITE_BASE_URL + '/api/bridge-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      },
      credentials: 'include' // Include cookies for session
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.token) {
        localStorage.setItem('access_token', data.data.token);
        console.log('Bridge token obtained and saved:', data.data.token);
        return data.data.token;
      }
    } else {
      console.error('Failed to get bridge token:', response.status);
    }
  } catch (error) {
    console.error('Error getting bridge token:', error);
  }
  return null;
};

// Get chat list with pagination
export const getChatList = async (hasLoaded = [], source = 'all') => {
  try {
    const hasLoadedParam = hasLoaded.length > 0 ? hasLoaded.join(',') : '';
    let token = getAuthToken();
    
    // If no token available, try to get bridge token
    if (!token) {
      console.log('No auth token found, attempting to get bridge token...');
      token = await window.getBridgeToken();
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Fallback to CSRF token for web routes
      headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
    
    // Build URL with source parameter
    const url = new URL(`${API_BASE_URL}/chat-list`);
    if (hasLoadedParam) {
      url.searchParams.append('hasLoaded', hasLoadedParam);
    }
    if (source && source !== 'all') {
      url.searchParams.append('source', source);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chat list: ${response.status}`);
    }
    
    const data = await response.json();
    // Map the API response to match UI expectations
    const mappedData = (data.data || []).map(item => ({
      id: item.conversation_id,
      conversation_id: item.conversation_id,
      name: item.name,
      phone: item.phone,
      email: item.email,
      last_message: item.body,
      updated_at: item.created_at,
      created_at: item.created_at,
      unread_count: item.unread_count || 0,
      is_online: item.is_online || false,
      source: item.source || 'whatsapp' // Use source from API response
    }));
    
    return {
      success: true,
      data: mappedData
    };
  } catch (error) {
    console.error('Error fetching chat list:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
};

// Load conversation messages
export const loadConversation = async (conversationId, loadFromTimestamp = 0) => {
  try {
    const url = `${import.meta.env.VITE_BASE_URL}/api/omnichannel-public/load-conversation/${conversationId}?loadFrom=${loadFromTimestamp}`;
    
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
      
    const response = await fetch(url, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load conversation: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Load conversation response:', data);
    return {
      success: true,
      data: {
        chats: data.data?.chats || data.chats || []
      }
    };
  } catch (error) {
    console.error('Error loading conversation:', error);
    return {
      success: false,
      data: { chats: [] },
      error: error.message
    };
  }
};

// Send message to WhatsApp
export const sendMessage = async (data) => {
  try {
    const formData = new FormData();
    formData.append('message', data.message || '');
    formData.append('userPhone', data.phone || '');
    
    if (data.file) {
      formData.append('file', data.file);
    }
    
    const token = getAuthToken();
    const headers = {
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
    
    const response = await fetch(import.meta.env.VITE_BASE_URL + '/api/send/create/3', {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status}`);
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get latest chat for a specific phone
export const getLatestChat = async (phone) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }
    
    const response = await fetch(`${API_BASE_URL}/latest-chat?phone=${phone}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch latest chat: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching latest chat:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

// Utility function to format timestamp
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};

// Utility function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility function to get message type icon
export const getMessageTypeIcon = (type) => {
  switch (type) {
    case 'chat':
      return 'fa-comment';
    case 'incoming_call':
      return 'fa-phone text-success';
    case 'image':
      return 'fa-image text-primary';
    case 'video':
      return 'fa-video text-danger';
    default:
      return 'fa-ellipsis-h';
  }
};

// Utility function to get message preview text
export const getMessagePreview = (type, body) => {
  switch (type) {
    case 'chat':
      return body;
    case 'incoming_call':
      return 'Panggilan Masuk';
    case 'image':
      return 'Gambar';
    case 'video':
      return 'Video';
    default:
      return '...';
  }
};