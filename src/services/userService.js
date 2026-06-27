import api from './axios';

const ENDPOINT = '/users';

const UserService = {
    // [GET] /users - Lấy danh sách tất cả người dùng
    getAllUsers: async () => {
        try {
            const response = await api.get(`${ENDPOINT}`);
            return response.data; 
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw error;
        }
    },

    // [GET] /users/banned - Lấy danh sách người dùng bị khóa (ADMIN)
    getBannedUsers: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/banned`);
            return response.data;
        } catch (error) {
            console.error("Error fetching banned users:", error);
            throw error;
        }
    },

    // [GET] /users/profile - Lấy thông tin profile cá nhân
    getUserProfile: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/profile`);
            return response.data;
        } catch (error) {
            console.error("Error fetching user profile:", error);
            throw error;
        }
    },

    // [GET] /users/:userId - Lấy thông tin chi tiết một user theo ID
    getUserById: async (userId) => {
        try {
            const response = await api.get(`${ENDPOINT}/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user by id ${userId}:`, error);
            throw error;
        }
    },

    // [PUT] /users/profile - Cập nhật thông tin profile cá nhân
    updateProfile: async (formDataPayload) => {
        try {
            const response = await api.put(`${ENDPOINT}/profile`, formDataPayload);
            return response.data;
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    // [PUT] /users/:id/status?isActive=... - Khóa hoặc mở khóa tài khoản (ADMIN)
    toggleUserStatus: async (userId, isActive) => {
        try {
            const response = await api.put(`${ENDPOINT}/${userId}/status?isActive=${isActive}`);
            return response.data;
        } catch (error) {
            console.error(`Error toggling status for user ${userId}:`, error);
            throw error;
        }
    }
};

export default UserService;