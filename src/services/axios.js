import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080/room-rental/api'
});
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    // Nếu có token VÀ đường dẫn không chứa chữ '/auth' (không phải login/register)
    // thì mới đính kèm token vào Header
    if (token && !config.url.includes('/auth')) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;