import api from './axios';

// Định nghĩa endpoint gốc cho các dịch vụ liên quan đến xác thực
const ENDPOINT = '/auth';

const AuthService = {

    login: async (username, password) => {
        try {
            const response = await api.post(`${ENDPOINT}/login`, { username, password });
            return response.data;
        } catch (error) {
            console.error("Error during login:", error);
            // Lấy message từ backend trả về (nếu có), nếu không dùng câu thông báo mặc định
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
    }
};

export default AuthService;