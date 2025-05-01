// Frontend configuration to connect with backend
const API_BASE_URL = 'http://localhost:3001';

// Common API endpoints
const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  ADDRESSES: '/api/addresses',
  CARDS: '/api/cards',
  CHECKOUT: '/api/checkout',
};

// Development mode flag
const DEV_MODE = process.env.NODE_ENV !== 'production';

// Export configuration
const config = {
  API_BASE_URL,
  API_ENDPOINTS,
  DEV_MODE,
  
  // Helper function to get full API URL
  getApiUrl: (endpoint) => `${API_BASE_URL}${endpoint}`
};

export default config;