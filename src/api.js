import axios from 'axios';

export const API_BASE_URL = 'https://onlineassignment-fsad-be.onrender.com';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
