import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/authContext';
import { getUserProfile } from '../../services/userService';
import AuthService from '../../services/authService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Lấy full profile nền (background)
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

                // Render app luôn
                setLoading(false);

                // Fetch profile nền (lazy)
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

        const decoded = jwtDecode(authInfo.accessToken);

        setUser({
            email: decoded.sub,
            role: decoded.role,
        });

        await refreshUserProfile();
    }, [refreshUserProfile]);

    const loginWithGoogle = useCallback(async (idToken) => {
        try {
            const responseData = await AuthService.loginGoogle(idToken);
            const authInfo = responseData.data;
            if (!authInfo || !authInfo.accessToken) {
                throw new Error('Không nhận được token từ server sau khi đăng nhập Google');
            }

            localStorage.setItem('accessToken', authInfo.accessToken);
            localStorage.setItem('refreshToken', authInfo.refreshToken);

            const decoded = jwtDecode(authInfo.accessToken);
            setUser({
                email: decoded.sub,
                role: decoded.role,
            });

            await refreshUserProfile();

            return authInfo;
        } catch (error) {
            console.error('Lỗi xử lý loginWithGoogle trong Provider:', error);
            throw error; 
        }
    }, [refreshUserProfile]);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        logout,
        loginWithGoogle,
        refreshUserProfile,
        isAuthenticated: !!user,
    }), [
        user,
        loading,
        login,
        logout,
        loginWithGoogle,
        refreshUserProfile,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};