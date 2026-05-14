import api from './axios';
const ENDPOINT = '/auth';

const AuthService = {
    login: async (username, password) => {
        try {
            // SỬA Ở ĐÂY: Đổi key thành 'email' thay vì 'username'
            const response = await api.post(`${ENDPOINT}/login`, { 
                email: username, 
                password: password 
            });
            return response.data;
        } catch (error) {
            console.error("Error during login:", error);
            throw new Error(error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!');
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post(`${ENDPOINT}/register`, userData);
            return response.data;
        } catch (error) {
            console.error("Error during registration:", error);
            throw new Error(error.response?.data?.message || 'Đăng ký thất bại. Email hoặc tài khoản có thể đã tồn tại!');
        }
    },

    verifyOtp: async (email, otp) => {
        try {
            const response = await api.post(`${ENDPOINT}/verify-otp`, { email, otp });
            return response.data;
        } catch (error) {
            console.error("Error verifying OTP:", error);
            throw new Error(error.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
        }
    },

    resendOtp: async (email) => {
        try {
            const response = await api.post(`${ENDPOINT}/resend-otp`, { email });
            return response.data;
        } catch (error) {
            console.error("Error resending OTP:", error);
            throw new Error(error.response?.data?.message || 'Không thể gửi lại mã OTP lúc này!');
        }
    },

    forgetPassword: async (email) => {
        try {
            const response = await api.post(`${ENDPOINT}/forget-password`, { email });
            return response.data;
        } catch (error) {
            console.error('Error forget password:', error);
            throw new Error(error.response?.data?.message || 'Không thể gửi OTP đặt lại mật khẩu!');
        }
    },

    resetPassword: async (email, otp, newPassword, confirmPassword) => {
        try {
            const response = await api.post(`${ENDPOINT}/reset-password`,
                {
                    email, otp, newPassword, confirmPassword
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error reset password:', error);
            throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại!');
        }
    },

    loginGoogle: async (idToken) => {
        try {
            const response = await api.post(`${ENDPOINT}/google`, { idToken });
            return response.data;
        } catch (error) {
            console.error('Google login error:', error);
            throw new Error(error.response?.data?.message || 'Đăng nhập Google thất bại!');
        }
    }
};

export default AuthService;