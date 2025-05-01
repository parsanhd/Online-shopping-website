import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const apiService = {
  // --- Authentication ---
  getSessionInfo: () => api.get('/me'),
  signup: (user) => api.post('/signup', user),
  login: (user) => api.post('/login', user),
  logout: () => api.post('/logout'),
  staffLogin: (staff) => api.post('/staff/login', staff),

  // --- Products ---
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),

  // --- Cart ---
  addToCart: (productid, quantity) => api.post('/cart', { productid, quantity }),
  updateCart: (productid, quantity) => api.put(`/cart/${productid}`, { quantity }),
  deleteFromCart: (productid) => api.delete(`/cart/${productid}`),
  fetchCart: () => api.get('/cart'),

  // --- Addresses ---
  getAddresses: () => api.get('/addresses'),
  addAddress: (address) => api.post('/addresses', address),
  updateAddress: (addressid, address) => api.put(`/addresses/${addressid}`, address), // ✅
  deleteAddress: (addressid) => api.delete(`/addresses/${addressid}`),                // ✅

  // --- Cards ---
  getCards: () => api.get('/cards'),
  addCard: (card) => api.post('/cards', card),
  updateCard: (card_number, card) => api.put(`/cards/${card_number}`, card),          // ✅
  deleteCard: (card_number) => api.delete(`/cards/${card_number}`),                   // ✅

  // --- Checkout ---
  checkout: (checkoutDetails) => api.post('/checkout', checkoutDetails),

  // --- Product manager ---
  addProduct: (product) => api.post('/products', product),
  updateProduct: (productID, productData) => api.put(`/products/${productID}`, productData),
  deleteProduct: (productID) => api.delete(`/products/${productID}`),
  updateStock: (productid, warehouseid, addedQuantity) => api.post('/stock/update', { productid, warehouseid, addedQuantity }),


  // --- Error Handling ---
  handleError: (error) => {
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error.response) {
      errorMessage = error.response.data.message || `Error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    }
    return Promise.reject(errorMessage);
  }
};

export default apiService;