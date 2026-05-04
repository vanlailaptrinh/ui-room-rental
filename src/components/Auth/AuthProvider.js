import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/authContext';
import { getUserProfile } from '../../services/userService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUserProfile = async () => {
        try {
            const response = await getUserProfile();
            const userData = response.data;

            if (userData) {
                setUser(prev => ({ ...prev, ...userData }));
            }
        } catch (error) {
            console.error("Không thể lấy thông tin chi tiết user:", error);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                try {
                    const decoded = jwtDecode(accessToken);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp < currentTime) {
                        logout();
                    } else {
                        setUser({ email: decoded.sub, role: decoded.role });

                        await refreshUserProfile();
                    }
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (authInfo) => {
        localStorage.setItem('accessToken', authInfo.accessToken);
        localStorage.setItem('refreshToken', authInfo.refreshToken);

        const decoded = jwtDecode(authInfo.accessToken);
        setUser({ email: decoded.sub, role: decoded.role });

        await refreshUserProfile();
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user, refreshUserProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};