import api from './axios'; // Sử dụng instance 'api' đồng bộ toàn hệ thống

const ENDPOINT = '/users';

const UserService = {
    // [GET] /users - Lấy danh sách tất cả người dùng
    getAllUsers: async () => {
        try {
            const response = await api.get(`${ENDPOINT}`);
            return response.data; // Trả về ApiResponse chứa danh sách users
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    },

    // [GET] /users/profile - Lấy thông tin profile cá nhân của user hiện tại
    getUserProfile: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/profile`);
            return response.data; // Trả về ApiResponse chứa thông tin cá nhân
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    // [GET] /users/:userId - Lấy thông tin chi tiết một user theo ID
    getUserById: async (userId) => {
        try {
            const response = await api.get(`${ENDPOINT}/${userId}`);
            return response.data; // Trả về ApiResponse chứa chi tiết user
        } catch (error) {
            console.error(`Error fetching user by id ${userId}:`, error);
            throw error;
        }
    },

    // [PUT] /users/profile - Cập nhật thông tin profile cá nhân
    updateProfile: async (formDataPayload) => {
        try {
            const response = await api.put(`${ENDPOINT}/profile`, formDataPayload);
            return response.data; // Trả về ApiResponse chứa thông tin sau khi cập nhật
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    }
};

export default UserService;