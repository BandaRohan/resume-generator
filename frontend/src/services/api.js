import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
  baseURL: 'https://backend.raxoner.com',  // Use localhost for development
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in all requests
API.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: (email, password) => {
    // For OAuth2 password flow, we need to use URLSearchParams
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    
    return API.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  
  register: (name, email, password) => {
    return API.post('/auth/register', { name, email, password });
  },
  
  guestLogin: () => {
    return API.post('/auth/guest');
  },
  
  getCurrentUser: () => {
    return API.get('/auth/me');
  }
};

// Chat API calls
export const chatAPI = {
  sendMessage: (message, conversationId = null) => {
    return API.post('/chat/', { message, conversation_id: conversationId });
  },
  
  getConversations: (skip = 0, limit = 20) => {
    return API.get(`/conversations/?skip=${skip}&limit=${limit}`);
  },
  
  createConversation: (title) => {
    return API.post('/conversations/', { title });
  },
  
  getConversation: (conversationId) => {
    return API.get(`/conversations/${conversationId}/messages`);
  },
  
  deleteConversation: (conversationId) => {
    return API.delete(`/conversations/${conversationId}`);
  }
};

export default API;
