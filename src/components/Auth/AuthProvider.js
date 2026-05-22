import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../context/authContext';
import UserService from '../../services/userService';
import AuthService from '../../services/authService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshTimerRef = useRef(null); // Dùng ref để quản lý bộ đếm thời gian tránh bị lặp

    // 1. Hàm logout dọn dẹp bộ nhớ và bộ đếm
    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }
        setUser(null);
    }, []);

    // 2. Hàm gọi API Refresh Token
    const handleRefreshToken = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            logout();
            return null;
        }

        try {
            // Giả định AuthService của bạn có hàm refreshToken nhận vào refreshToken cũ
            // Hoặc nếu API của bạn nhận qua header/cookie thì có thể điều chỉnh lại dòng này
            const response = await AuthService.refreshToken({ refreshToken }); 
            const authInfo = response.data;

            if (authInfo && authInfo.accessToken) {
                localStorage.setItem('accessToken', authInfo.accessToken);
                if (authInfo.refreshToken) {
                    localStorage.setItem('refreshToken', authInfo.refreshToken);
                }
                return authInfo.accessToken;
            } else {
                logout();
                return null;
            }
        } catch (error) {
            console.error('Không thể refresh token (có thể refreshToken đã hết hạn):', error);
            logout();
            return null;
        }
    }, [logout]);

    // 3. Cơ chế lập lịch Tự động gia hạn trước 5 phút (Silent Refresh)
    const scheduleTokenRefresh = useCallback((accessToken) => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }

        try {
            const decoded = jwtDecode(accessToken);
            const currentTime = Date.now() / 1000;
            
            // Thời gian còn lại của token (giây)
            const timeLeft = decoded.exp - currentTime;
            
            // Đổi 5 phút ra giây = 300 giây. 
            // Nếu token có thời hạn quá ngắn (< 5p), ta sẽ refresh sau 1 giây thay vì số âm
            const refreshBuffer = 300; 
            const delayInSeconds = timeLeft - refreshBuffer;
            const delayInMilliseconds = Math.max(delayInSeconds, 1) * 1000;

            console.log(`Hệ thống sẽ tự động gia hạn token sau: ${(delayInMilliseconds / 60000).toFixed(2)} phút`);

            refreshTimerRef.current = setTimeout(async () => {
                console.log('Bắt đầu tự động gia hạn token ngầm...');
                const newAccessToken = await handleRefreshToken();
                if (newAccessToken) {
                    // Nếu lấy được token mới thành công, tiếp tục lập lịch cho lần tiếp theo
                    scheduleTokenRefresh(newAccessToken);
                }
            }, delayInMilliseconds);

        } catch (error) {
            console.error('Lỗi khi lập lịch refresh token:', error);
        }
    }, [handleRefreshToken]);

    // Lấy full profile nền (background)
    const refreshUserProfile = useCallback(async () => {
        try {
            const response = await UserService.getUserProfile();
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

    // 4. Khởi tạo Auth (Chạy khi ép F5 tải lại trang)
    useEffect(() => {
        const initAuth = async () => {
            let accessToken = localStorage.getItem('accessToken');

            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                let decoded = jwtDecode(accessToken);
                const currentTime = Date.now() / 1000;

                // KIỂM TRA ĐỀ XUẤT: Nếu token đã hết hạn HOẶC chỉ còn dưới 5 phút (300 giây) là hết hạn
                if (decoded.exp - currentTime < 300) {
                    console.log('Token sắp hết hạn hoặc đã hết hạn, tiến hành lấy token mới ngay lập tức...');
                    const newTrackToken = await handleRefreshToken();
                    if (newTrackToken) {
                        accessToken = newTrackToken;
                        decoded = jwtDecode(accessToken); // Cập nhật lại thông tin decode
                    } else {
                        setLoading(false);
                        return; // Hàm handleRefreshToken đã tự logout bên trong nếu lỗi
                    }
                }

                // Set basic user từ token hợp lệ
                setUser({
                    email: decoded.sub,
                    role: decoded.role,
                });

                setLoading(false);

                // Bật chế độ chạy ngầm hẹn giờ gia hạn cho thời gian sử dụng tiếp theo
                scheduleTokenRefresh(accessToken);

                // Fetch profile nền (lazy)
                refreshUserProfile();
            } catch (error) {
                console.error('Token không hợp lệ tại bước khởi tạo:', error);
                logout();
                setLoading(false);
            }
        };

        initAuth();

        // Cleanup: Xóa bộ đếm khi component bị unmount
        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [logout, refreshUserProfile, handleRefreshToken, scheduleTokenRefresh]);

    // Login thủ công bằng tài khoản mật khẩu
    const login = useCallback(async (authInfo) => {
        localStorage.setItem('accessToken', authInfo.accessToken);
        localStorage.setItem('refreshToken', authInfo.refreshToken);

        const decoded = jwtDecode(authInfo.accessToken);
        setUser({
            email: decoded.sub,
            role: decoded.role,
        });

        // Kích hoạt hẹn giờ gia hạn
        scheduleTokenRefresh(authInfo.accessToken);

        await refreshUserProfile();
    }, [refreshUserProfile, scheduleTokenRefresh]);

    // Login bằng Google
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

            // Kích hoạt hẹn giờ gia hạn
            scheduleTokenRefresh(authInfo.accessToken);

            await refreshUserProfile();

            return authInfo;
        } catch (error) {
            console.error('Lỗi xử lý loginWithGoogle trong Provider:', error);
            throw error; 
        }
    }, [refreshUserProfile, scheduleTokenRefresh]);

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