import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
});

export const sendMessage = async (message, ownerId, userId) => {
    const response = await api.post('/chat', { message, ownerId, userId });
    return response.data;
};

export default api;
