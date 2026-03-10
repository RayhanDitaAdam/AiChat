import axios from 'axios';
import { PATHS } from '../routes/paths.js';

export const getBaseURL = () => {
    const rawUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:4000` : 'http://103.183.74.207');
    // Ensure it ends with /api
    return rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/+$/, '')}/api`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true, // Important for cookies
});

// Fetch CSRF token on app start
// Fetch CSRF token
export const fetchCsrfToken = async () => {
    try {
        const response = await api.get('/csrf-token');
        api.defaults.headers.common['x-csrf-token'] = response.data.csrfToken;
        return response.data.csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token', error);
    }
};

fetchCsrfToken();

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Bypass global redirect for login requests
            if (originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    console.log('[API] Attempting token refresh...');
                    const baseUrl = getBaseURL();
                    const response = await axios.post(`${baseUrl}/auth/refresh`, { refreshToken });
                    const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('token', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);

                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('[API] Refresh failed:', refreshError.response?.data?.message || refreshError.message);
                    processQueue(refreshError, null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    // Redirect handled by RequireAuth or component logic
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // Just reject, don't force redirect here
                return Promise.reject(error);
            }
        }

        // Handle CSRF errors - auto retry once with fresh token
        if (error.response?.status === 403 && error.response?.data?.message?.toLowerCase().includes('csrf') && !originalRequest._csrfRetry) {
            originalRequest._csrfRetry = true;
            console.log('[API] CSRF error detected, fetching fresh token...');
            const freshToken = await fetchCsrfToken();
            if (freshToken) {
                originalRequest.headers['x-csrf-token'] = freshToken;
                return api(originalRequest);
            }
        }

        // Handle Server Errors (Load Balancing) - retry up to 2 times for 502, 503, 504
        if (error.response && [502, 503, 504].includes(error.response.status)) {
            originalRequest._retryCount = originalRequest._retryCount || 0;
            if (originalRequest._retryCount < 2) {
                originalRequest._retryCount += 1;
                console.log(`[API] Server error ${error.response.status}. Retrying request (Attempt ${originalRequest._retryCount})...`);
                // Add a small delay backoff
                await new Promise(res => setTimeout(res, 500 * originalRequest._retryCount));
                return api(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

export const loginWithGoogle = async (token) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
};

export const linkWithGoogle = async (token) => {
    const response = await api.post('/auth/link-google', { token });
    return response.data;
};

export const unlinkWithGoogle = async () => {
    const response = await api.post('/auth/unlink-google');
    return response.data;
};

export const loginWithGitHub = async (code) => {
    const response = await api.post('/auth/github', { code });
    return response.data;
};

export const loginWithEmail = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const verifyKeyFile = async (userId, keyContent) => {
    const response = await api.post('/auth/verify-key-file', { userId, keyContent });
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

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const validateResetToken = async (token) => {
    const response = await api.get(`/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
};

// --- 2FA endpoints ---
export const setup2FA = async () => {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
};

export const verify2FA = async (secret, token) => {
    const response = await api.post('/auth/2fa/verify', { secret, token });
    return response.data;
};

export const disable2FA = async () => {
    const response = await api.post('/auth/2fa/disable');
    return response.data;
};

export const login2FA = async (userId, code) => {
    const response = await api.post('/auth/2fa/login', { userId, code });
    return response.data;
};

export const resend2FA = async (userId) => {
    const response = await api.post('/auth/2fa/resend', { userId });
    return response.data;
};

export const sendMessage = async (message, ownerId, userId = undefined, sessionId = undefined, latitude = undefined, longitude = undefined, guestId = undefined, metadata = undefined) => {
    const response = await api.post('/chat', { message, ownerId, userId, sessionId, latitude, longitude, guestId, metadata });
    return response.data;
};

export const getChatSessions = async (ownerId, excludeStaffChats = false) => {
    const response = await api.get(`/chat/history?ownerId=${ownerId}&excludeStaffChats=${excludeStaffChats}`);
    return response.data;
};

export const createChatSession = async (ownerId) => {
    const response = await api.post('/chat/sessions', { ownerId });
    return response.data;
};

export const getSessionMessages = async (sessionId, excludeStaffChats = false) => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages?excludeStaffChats=${excludeStaffChats}`);
    return response.data;
};

export const deleteChatSession = async (sessionId) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
};

export const toggleSessionPin = async (sessionId) => {
    const response = await api.patch(`/chat/sessions/${sessionId}/pin`);
    return response.data;
};

// Workshop (Bengkel) API
export const getWorkOrders = async (status) => {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await api.get('/workshop/work-orders', { params });
    return response.data;
};

export const createWorkOrder = async (data) => {
    const response = await api.post('/workshop/work-orders', data);
    return response.data;
};

export const updateWorkOrder = async (id, data) => {
    const response = await api.patch(`/workshop/work-orders/${id}`, data);
    return response.data;
};

export const deleteWorkOrder = async (id) => {
    const response = await api.delete(`/workshop/work-orders/${id}`);
    return response.data;
};

export const addWorkOrderItem = async (workOrderId, data) => {
    const response = await api.post(`/workshop/work-orders/${workOrderId}/items`, data);
    return response.data;
};

export const deleteWorkOrderItem = async (itemId) => {
    const response = await api.delete(`/workshop/items/${itemId}`);
    return response.data;
};

export const getVehicleHistory = async (plate) => {
    const response = await api.get(`/workshop/history/${encodeURIComponent(plate)}`);
    return response.data;
};

// Workshop — Mechanics
export const getMechanics = async () => {
    const response = await api.get('/workshop/mechanics');
    return response.data;
};
export const createMechanic = async (data) => {
    const response = await api.post('/workshop/mechanics', data);
    return response.data;
};
export const updateMechanic = async (id, data) => {
    const response = await api.patch(`/workshop/mechanics/${id}`, data);
    return response.data;
};
export const deleteMechanic = async (id) => {
    const response = await api.delete(`/workshop/mechanics/${id}`);
    return response.data;
};

// Workshop — Commission
export const getMechanicCommissions = async (month) => {
    const params = month ? { month } : {};
    const response = await api.get('/workshop/commission', { params });
    return response.data;
};

// Workshop — Attendance
export const getAttendances = async (params = {}) => {
    const response = await api.get('/workshop/attendance', { params });
    return response.data;
};
export const createAttendance = async (data) => {
    const response = await api.post('/workshop/attendance', data);
    return response.data;
};
export const clockIn = async (mechanicId) => {
    const response = await api.post(`/workshop/mechanics/${mechanicId}/clock-in`);
    return response.data;
};
export const clockOut = async (mechanicId) => {
    const response = await api.post(`/workshop/mechanics/${mechanicId}/clock-out`);
    return response.data;
};
export const deleteAttendance = async (id) => {
    const response = await api.delete(`/workshop/attendance/${id}`);
    return response.data;
};

// Workshop — Suppliers
export const getSuppliers = async () => {
    const response = await api.get('/workshop/suppliers');
    return response.data;
};
export const createSupplier = async (data) => {
    const response = await api.post('/workshop/suppliers', data);
    return response.data;
};
export const updateSupplier = async (id, data) => {
    const response = await api.patch(`/workshop/suppliers/${id}`, data);
    return response.data;
};
export const deleteSupplier = async (id) => {
    const response = await api.delete(`/workshop/suppliers/${id}`);
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
export const getChatPolling = async (since, ownerId) => {
    const response = await api.get(`/chat/history?since=${since}&ownerId=${ownerId}`);
    return response.data;
};

export const requestStaff = async (ownerId, latitude, longitude, targetStaffId) => {
    const response = await api.post('/chat/call-staff', { ownerId, latitude, longitude, targetStaffId });
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

export const getStoreStaff = async (ownerId) => {
    const response = await api.get(`/chat/store-staff/${ownerId}`);
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
export const getProductsByOwner = async (ownerId, params = {}) => {
    const response = await api.get(`/products/${ownerId}`, { params });
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

export const bulkDeleteProducts = async (productIds) => {
    const response = await api.post('/products/bulk-delete', { productIds });
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

export const fetchMyStoreConfig = async () => {
    const response = await api.get('/owner/config');
    return response.data;
};

export const updateMyStoreConfig = async (data) => {
    const response = await api.patch('/owner/config', data);
    return response.data;
};

// --- OWNER MEMBER/TEAM endpoints ---
export const getStoreMembers = async () => {
    const response = await api.get('/owner/members');
    return response.data;
};

export const updateMemberRole = async (memberId, role) => {
    const response = await api.patch(`/owner/members/${memberId}/role`, { role });
    return response.data;
};

export const updateStaffMember = async (memberId, data) => {
    const response = await api.patch(`/owner/members/${memberId}`, data);
    return response.data;
};

export const deleteStaffMember = async (memberId) => {
    const response = await api.delete(`/owner/members/${memberId}`);
    return response.data;
};

export const bulkDeleteStaffMembers = async (memberIds) => {
    const response = await api.post('/owner/members/bulk-delete', { memberIds });
    return response.data;
};

export const createStaffAccount = async (data) => {
    const response = await api.post('/owner/staff', data);
    return response.data;
};

export const getStaffActivity = async (staffId) => {
    const response = await api.get(`/owner/staff/${staffId}/activity`);
    return response.data;
};

export const getStaffRoles = async () => {
    const response = await api.get('/owner/roles');
    return response.data;
};

export const createStaffRole = async (data) => {
    // data: { name, permissions }
    const response = await api.post('/owner/roles', data);
    return response.data;
};

export const updateStaffRole = async (roleId, data) => {
    const response = await api.patch(`/owner/roles/${roleId}`, data);
    return response.data;
};

export const deleteStaffRole = async (roleId) => {
    const response = await api.delete(`/owner/roles/${roleId}`);
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
export const getAdminStats = async (days = 7) => {
    const response = await api.get(`/admin/stats?days=${days}`);
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

export const updateOwnerCategory = async (ownerId, businessCategory) => {
    const response = await api.patch(`/admin/owners/${ownerId}/category`, { businessCategory });
    return response.data;
};

export const createAdminOwner = async (data) => {
    const response = await api.post('/admin/owners', data);
    return response.data;
};

export const updateAdminOwner = async (ownerId, data) => {
    const response = await api.patch(`/admin/owners/${ownerId}`, data);
    return response.data;
};

export const deleteAdminOwner = async (ownerId) => {
    const response = await api.delete(`/admin/owners/${ownerId}`);
    return response.data;
};

export const getAdminUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const updateAdminUserMenus = async (userId, disabledMenus) => {
    const response = await api.patch(`/admin/users/${userId}/menus`, { disabledMenus });
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

// --- SUPER ADMIN endpoints ---
export const getSuperAdmins = async () => {
    const response = await api.get('/admin/super/admins');
    return response.data;
};

export const createSuperAdmin = async (data) => {
    const response = await api.post('/admin/super/admins', data);
    return response.data;
};

export const updateSuperAdmin = async (userId, data) => {
    const response = await api.patch(`/admin/super/admins/${userId}`, data);
    return response.data;
};

export const deleteSuperAdmin = async (userId) => {
    const response = await api.delete(`/admin/super/admins/${userId}`);
    return response.data;
};


// Used by ADMIN & SUPER_ADMIN to download the system guide
export const downloadSystemGuide = async () => {
    return api.get('/admin/guide', { responseType: 'blob' });
};

export const fetchWeather = async (lat, lng) => {
    const response = await api.get(`/weather${lat && lng ? `?lat=${lat}&lng=${lng}` : ''}`);
    return response.data;
};

// --- FACILITY TASK endpoints ---
export const getFacilityTasks = () => api.get('/facility/tasks').then(res => res.data);
export const createFacilityTask = (data) => api.post('/facility/tasks', data).then(res => res.data);
export const updateFacilityTask = (id, data) => api.patch(`/facility/tasks/${id}`, data).then(res => res.data);
export const deleteFacilityTask = (id) => api.delete(`/facility/tasks/${id}`).then(res => res.data);
export const updateFacilityTaskReport = (id, data) => api.patch(`/facility/tasks/${id}/report`, data).then(res => res.data);

export const getPublicStores = async () => {
    const response = await api.get('/auth/stores');
    return response.data;
};

// --- POS / HEALTH INTEGRATION ---
export const getPOSProducts = async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
};

export const getPOSMembers = async (params) => {
    const response = await api.get('/pos/members', { params });
    return response.data;
};

export const getMemberDetail = async (id) => {
    const response = await api.get(`/pos/members/${id}`);
    return response.data;
};

export const lookupPOSMember = async (identifier) => {
    const response = await api.get('/pos/members/lookup', { params: { identifier } });
    return response.data;
};

export const getPOSTransactions = async (params) => {
    const response = await api.get('/pos/transactions', { params });
    return response.data;
};

export const createTransaction = async (data) => {
    const response = await api.post('/pos/transactions', data);
    return response.data;
};

export const getPendingProducts = async () => {
    const response = await api.get('/products/owner/pending');
    return response.data;
};

export const updateProductStatus = (productId, status) =>
    api.patch(`/products/approval/${productId}`, { status }).then(res => res.data);

export const bulkUpdateProductStatus = (data) =>
    api.patch('/products/approval/bulk', data).then(res => res.data);

export const getProductForecasting = () =>
    api.get('/products/owner/forecasting').then(res => res.data);

export const getPOSRewards = async () => {
    const response = await api.get('/pos/rewards');
    return response.data;
};

export const redeemPOSReward = async (data) => {
    const response = await api.post('/pos/rewards/redeem', data);
    return response.data;
};

export const getPOSSettings = async () => {
    const response = await api.get('/pos/settings');
    return response.data;
};

export const updatePOSSettings = async (data) => {
    const response = await api.post('/pos/settings', data);
    return response.data;
};

export const getPOSReports = async (type, params) => {
    const response = await api.get(`/pos/reports/${type}`, { params });
    return response.data;
};

export const saveMedicalRecord = async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/pos/health/medical-record', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
};

export const analyzeFood = async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('/pos/health/analyze-food', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
};

export const getHealthHistory = async (memberId) => {
    const response = await api.get(`/pos/health/history/${memberId}`);
    return response.data;
};

// --- CONTRIBUTOR endpoints ---
export const requestContributor = async (ownerId) => {
    const response = await api.post('/contributor/request', { ownerId });
    return response.data;
};

export const getContributorRequests = async () => {
    const response = await api.get('/contributor/requests');
    return response.data;
};

export const getMyContributorRequests = async () => {
    const response = await api.get('/contributor/my-requests');
    return response.data;
};

export const updateContributorRequest = async (requestId, status) => {
    const response = await api.put(`/contributor/requests/${requestId}`, { status });
    return response.data;
};

export const cancelContributorRequest = async (requestId) => {
    const response = await api.delete(`/contributor/requests/${requestId}`);
    return response.data;
};

export const getContributors = async () => {
    const response = await api.get('/contributor/list');
    return response.data;
}

export const bulkRemoveContributors = async (userIds) => {
    const response = await api.post('/contributor/bulk-remove', { userIds });
    return response.data;
};

// --- JOB VACANCY endpoints ---
export const getOwnerVacancies = () => api.get('/vacancies/owner').then(res => res.data);
export const createVacancy = (data) => api.post('/vacancies', data).then(res => res.data);
export const updateVacancy = (id, data) => api.patch(`/vacancies/${id}`, data).then(res => res.data);
export const deleteVacancy = (id) => api.delete(`/vacancies/${id}`).then(res => res.data);
export const getPublicVacancies = () => api.get('/vacancies/public').then(res => res.data);

export const applyToVacancy = (vacancyId, reason) => api.post(`/vacancies/${vacancyId}/apply`, { reason }).then(res => res.data);
export const getUserApplications = () => api.get('/vacancies/my-applications').then(res => res.data);
export const getVacancyApplicants = (vacancyId) => api.get(`/vacancies/${vacancyId}/applicants`).then(res => res.data);
export const updateApplicationStatus = (id, status) => api.patch(`/vacancies/applications/${id}/status`, { status }).then(res => res.data);
export const getAllOwnerApplicants = () => api.get('/vacancies/owner/all-applicants').then(res => res.data);

// --- COMPANY SOP endpoints ---
export const getCompanySops = () => api.get('/sop').then(res => res.data);
export const uploadCompanySop = (formData) => api.post('/sop/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
}).then(res => res.data);
export const deleteCompanySop = (id) => api.delete(`/sop/${id}`).then(res => res.data);
export const updateCompanySop = (id, data) => api.put(`/sop/${id}`, data).then(res => res.data);

// Expiry
export const getExpiries = () => api.get('/expiry').then(res => res.data);
export const createExpiry = (data) => api.post('/expiry', data).then(res => res.data);
export const deleteExpiry = (id) => api.delete(`/expiry/${id}`).then(res => res.data);
export const assignProductToExpiry = (expiryId, data) => api.post(`/expiry/${expiryId}/products`, data).then(res => res.data);
export const removeProductFromExpiry = (expiryId, productId) => api.delete(`/expiry/${expiryId}/products/${productId}`).then(res => res.data);

export const getContributorAuditLogs = async () => {
    const response = await api.get('/contributor/audit-logs');
    return response.data;
};

export default api;
