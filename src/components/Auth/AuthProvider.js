import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/authContext';
import { getUserProfile } from '../../services/userService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUserProfile = useCallback(async () => {
        try {
            const response = await getUserProfile();
            const userData = response.data;

            if (userData) {
                setUser(prev => ({
                    ...prev,
                    ...userData,
                }));
            }
        } catch (error) {
            console.error('Không thể lấy thông tin user:', error);
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        setUser(null);
    }, []);

    // Init Auth (Lazy Login)
    useEffect(() => {
        const initAuth = () => {
            const accessToken = localStorage.getItem('accessToken');

            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode(accessToken);
                const currentTime = Date.now() / 1000;

                // Token hết hạn
                if (decoded.exp < currentTime) {
                    logout();
                    setLoading(false);
                    return;
                }

                // Set basic user trước để render app ngay
                setUser({
                    email: decoded.sub,
                    role: decoded.role,
                });
                setLoading(false);
                refreshUserProfile();
            } catch (error) {
                console.error('Token không hợp lệ:', error);

                logout();
                setLoading(false);
            }
        };

        initAuth();
    }, [logout, refreshUserProfile]);

    // Login
    const login = useCallback(async (authInfo) => {
        localStorage.setItem('accessToken', authInfo.accessToken);
        localStorage.setItem('refreshToken', authInfo.refreshToken);

        try {
            const decoded = jwtDecode(authInfo.accessToken);

            // Set basic user trước
            setUser({
                email: decoded.sub,
                role: decoded.role,
            });

            // Load profile nền
            refreshUserProfile();
        } catch (error) {
            console.error('Lỗi decode token:', error);
            logout();
        }
    }, [logout, refreshUserProfile]);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        refreshUserProfile,
        isAuthenticated: !!user,
    }), [
        user,
        loading,
        login,
        logout,
        refreshUserProfile,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};