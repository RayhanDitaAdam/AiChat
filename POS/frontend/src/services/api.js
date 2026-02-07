import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('aipos_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle unauthorized errors
api.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('aipos_token');
        window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
});

// Auth
export const login = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Products
export const getProducts = (params) => api.get('/products', { params });
export const createProduct = (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/products', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
};
export const updateProduct = (id, data) => {
    const isFormData = data instanceof FormData;
    return api.patch(`/products/${id}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
};
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');

// Members
export const getMembers = (params) => api.get('/members', { params });
export const getMemberDetail = (id) => api.get(`/members/${id}`);

// Transactions
export const createTransaction = (data) => api.post('/transactions', data);
export const getTransactions = (params) => api.get('/transactions', { params });

// Health
// Health
export const saveMedicalRecord = (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/health/medical-record', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
};
export const analyzeFood = (data) => {
    const isFormData = data instanceof FormData;
    return api.post('/health/analyze-food', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
};
export const getHealthHistory = (memberId) => api.get(`/health/history/${memberId}`);

// Settings
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.patch('/settings', data);

// Rewards
export const getRewards = () => api.get('/rewards');
export const redeemReward = (data) => api.post('/rewards/redeem', data);

// Reports
export const getSalesAnalytics = (period) => api.get('/reports/analytics/sales', { params: { period } });
export const getTopSellingProducts = (limit) => api.get('/reports/analytics/top-products', { params: { limit } });
export const getStockAlerts = (threshold) => api.get('/reports/analytics/stock-alerts', { params: { threshold } });

export default api;
