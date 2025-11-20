import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api') + 'api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  getCategories: (gender = null) => {
    const params = gender ? { gender } : {};
    return api.get('/products/categories/', { params });
  },
  getFeatured: () => api.get('/products/featured/'),
  getOnSale: () => api.get('/products/on_sale/'),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/orders/cart/'),
  addItem: (data) => api.post('/orders/cart/add_item/', data),
  updateItem: (data) => api.post('/orders/cart/update_item/', data),
  removeItem: (data) => api.post('/orders/cart/remove_item/', data),
  checkout: (data) => api.post('/orders/cart/checkout/', data),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders/orders/'),
  getById: (id) => api.get(`/orders/orders/${id}/`),
  cancel: (id) => api.post(`/orders/orders/${id}/cancel/`),
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/users/register/', data),
  login: (data) => api.post('/users/login/', data),
  logout: () => api.post('/users/logout/'),
  getCurrentUser: () => api.get('/users/me/'),
};

export default api;

