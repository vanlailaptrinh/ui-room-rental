import { createContext, useContext } from 'react';

// 1. Khởi tạo Context
export const AuthContext = createContext();

// 2. Custom Hook để các component (Header, Login) gọi dùng
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};