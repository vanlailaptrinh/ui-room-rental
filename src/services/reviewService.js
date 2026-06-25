import api from './axios';

const ENDPOINT = '/reviews';

const ReviewService = {

    /**
     * Tạo đánh giá mới (USER, LANDLORD, ADMIN)
     * @param {Object} data - Payload chứa rating, comment, landlordId...
     */
    createReview: async (data) => {
        try {
            const response = await api.post(ENDPOINT, data);
            return response.data;
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    },

    /**
     * Cập nhật đánh giá (USER, LANDLORD, ADMIN)
     * @param {string} id - ID của đánh giá cần sửa
     * @param {Object} data - Payload chứa rating, comment mới
     */
    updateReview: async (id, data) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating review ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa đánh giá (USER, LANDLORD, ADMIN)
     * @param {string} id - ID của đánh giá cần xóa
     */
    deleteReview: async (id) => {
        try {
            const response = await api.delete(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting review ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách đánh giá theo ID của chủ trọ (Public)
     * @param {string} landlordId - ID của chủ trọ
     */
    getReviewsByLandlord: async (landlordId) => {
        try {
            const response = await api.get(`${ENDPOINT}/landlord/${landlordId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews for landlord ${landlordId}:`, error);
            throw error;
        }
    }
};

export default ReviewService;