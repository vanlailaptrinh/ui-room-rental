import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/authContext'; // Import cái khung từ thư mục context

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // KIỂM TRA TRẠNG THÁI KHI MỞ TRANG (F5)
    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            try {
                const decoded = jwtDecode(accessToken);
                const currentTime = Date.now() / 1000;

                if (decoded.exp < currentTime) {
                    logout();
                } else {
                    // Lấy email từ 'sub' và role như trong hình Postman bạn gửi
                    setUser({ email: decoded.sub, role: decoded.role });
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, []);

    // HÀM ĐĂNG NHẬP: Xử lý lưu 2 token và giải mã role
    const login = (authInfo) => {
        // 1. Lưu 2 token vào Local Storage
        localStorage.setItem('accessToken', authInfo.accessToken);
        localStorage.setItem('refreshToken', authInfo.refreshToken);

        // 2. Giải mã token lấy thông tin
        const decoded = jwtDecode(authInfo.accessToken);
        
        // 3. Cập nhật state toàn cục
        setUser({ 
            email: decoded.sub, 
            role: decoded.role 
        });
    };

    // HÀM ĐĂNG XUẤT
    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};