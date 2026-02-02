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

export const sendMessage = async (message, ownerId, userId, sessionId, latitude, longitude) => {
    const response = await api.post('/chat', { message, ownerId, userId, sessionId, latitude, longitude });
    return response.data;
};

export const getChatSessions = async (ownerId) => {
    const response = await api.get(`/chat/history?ownerId=${ownerId}`);
    return response.data;
};

export const createChatSession = async (ownerId) => {
    const response = await api.post('/chat/sessions', { ownerId });
    return response.data;
};

export const getSessionMessages = async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
};

export const deleteChatSession = async (sessionId) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
};

export const clearChatHistory = async (ownerId) => {
    const response = await api.delete('/chat/history', { data: { ownerId } });
    return response.data;
};

export const getUserChatHistory = async () => {
    const response = await api.get('/chat/history');
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

// --- LIVE SUPPORT endpoints ---
export const getChatPolling = async (since) => {
    const response = await api.get(`/chat/history?since=${since}`);
    return response.data;
};

export const callStaff = async (ownerId, latitude, longitude) => {
    const response = await api.post('/chat/call-staff', { ownerId, latitude, longitude });
    return response.data;
};

export const stopStaffSupport = async (ownerId, duration) => {
    const response = await api.post('/chat/stop-staff', { ownerId, duration });
    return response.data;
};

export const acceptCall = async (userId) => {
    const response = await api.post('/chat/accept-call', { userId });
    return response.data;
};

export const declineCall = async (userId) => {
    const response = await api.post('/chat/decline-call', { userId });
    return response.data;
};

export const getLiveSupportSessions = async () => {
    const response = await api.get('/owner/live-support');
    return response.data;
};

export const respondToLiveChat = async (userId, message) => {
    const response = await api.post('/owner/live-support/respond', { userId, message });
    return response.data;
};

export const getOwnerLiveChatHistory = async (userId, since = '') => {
    const response = await api.get(`/owner/live-support/${userId}${since ? `?since=${since}` : ''}`);
    return response.data;
};

// --- PUBLIC/USER endpoints ---
export const getPublicOwner = async (domain) => {
    const response = await api.get(`/public/owners/${domain}`);
    return response.data;
};

// --- OWNER endpoints ---
export const getProductsByOwner = async (ownerId) => {
    const response = await api.get(`/products/${ownerId}`);
    return response.data;
};

export const createProduct = async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/products', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const updateProduct = async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await api.patch(`/products/${id}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const uploadProducts = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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

export const updateStoreSettings = async (data) => {
    const response = await api.patch('/owner/settings', data);
    return response.data;
};

// --- SHOPPING LIST endpoints ---
export const getShoppingList = async () => {
    const response = await api.get('/shopping-list');
    return response.data;
};

export const addToShoppingList = async (productId, quantity = 1) => {
    const response = await api.post('/shopping-list/items', { productId, quantity });
    return response.data;
};

export const removeFromShoppingList = async (itemId) => {
    const response = await api.delete(`/shopping-list/items/${itemId}`);
    return response.data;
};

export const printShoppingList = async () => {
    const response = await api.post('/print');
    return response.data;
};


// --- ADMIN endpoints ---
export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

export const getAdminMissingRequests = async () => {
    const response = await api.get('/admin/missing-requests');
    return response.data;
};

export const getAdminOwners = async () => {
    const response = await api.get('/admin/owners');
    return response.data;
};

export const approveOwner = async (ownerId, isApproved) => {
    const response = await api.patch(`/admin/owners/${ownerId}/approve`, { isApproved });
    return response.data;
};

export const updateOwnerConfig = async (ownerId, config) => {
    const response = await api.patch(`/admin/owners/${ownerId}/config`, config);
    return response.data;
};

export const getSystemConfig = async () => {
    const response = await api.get('/admin/system/config');
    return response.data;
};

export const updateSystemConfig = async (config) => {
    const response = await api.patch('/admin/system/config', config);
    return response.data;
};

export const fetchWeather = async (lat, lng) => {
    const response = await api.get(`/weather${lat && lng ? `?lat=${lat}&lng=${lng}` : ''}`);
    return response.data;
};

export default api;
