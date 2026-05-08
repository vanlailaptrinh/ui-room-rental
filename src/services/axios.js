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

        const excludePaths = ['/auth/login', '/auth/register', '/auth/verify-otp'];
        const isExcluded = excludePaths.some(path => config.url.includes(path));

        if (!isExcluded) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default instance;