import api from './axios';

const ENDPOINT = '/posts';

const PostService = {
    getActivePosts: async (params = {}) => {
        try {
            const response = await api.get(`${ENDPOINT}/active`, { params });
            return response.data;
        } catch (error) {
            // Bạn có thể xử lý log lỗi tập trung ở đây
            console.error("Error fetching active posts:", error);
            throw error;
        }
    },

    getPostById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching post ${id}:`, error);
            throw error;
        }
    },

    getPostHistory: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/history`);
            return response.data;
        } catch (error) {
            console.error("Error fetching post history:", error);
            throw error;
        }
    }
};

export default PostService;