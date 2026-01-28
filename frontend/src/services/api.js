import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginWithGoogle = async (token) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
};

export const loginWithEmail = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (data) => {
    // data: { email, password, name, role, domain (if owner) }
    const response = await api.post('/auth/register', data);
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
};

export const fetchProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const sendMessage = async (message, ownerId, userId) => {
    const response = await api.post('/chat', { message, ownerId, userId });
    return response.data;
};

export const addRating = async (data) => {
    const response = await api.post('/rating', data);
    return response.data;
};

export const addReminder = async (data) => {
    const response = await api.post('/reminder', data);
    return response.data;
};

// --- OWNER endpoints ---
export const getProductsByOwner = async (ownerId) => {
    const response = await api.get(`/products/${ownerId}`);
    return response.data;
};

export const createProduct = async (data) => {
    const response = await api.post('/products', data);
    return response.data;
};

export const updateProduct = async (id, data) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const getMissingRequests = async (ownerId) => {
    const response = await api.get(`/missing-request/${ownerId}`);
    return response.data;
};

export const getRatings = async (ownerId) => {
    const response = await api.get(`/ratings/${ownerId}`);
    return response.data;
};

export const getChatHistory = async (ownerId) => {
    const response = await api.get(`/chat-history/${ownerId}`);
    return response.data;
};

export default api;
