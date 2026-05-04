import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080/room-rental/api'
});

instance.interceptors.request.use((config) => {
    let token = localStorage.getItem('accessToken');

    if (token) {
        if (token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
        }

        if (!config.url.includes('/auth')) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;