import api from './axios';

const ENDPOINT = '/favorites';

const FavoriteService = {
    /**
     * GET /favorites/{postId}/check
     * Kiểm tra bài đăng có trong danh sách yêu thích không
     * @returns {boolean}
     */
    checkFavorite: async (postId) => {
        const res = await api.get(`${ENDPOINT}/${postId}/check`);
        return res.data?.data ?? false;
    },

    /**
     * POST /favorites/{postId}
     * Thêm vào yêu thích
     */
    addFavorite: async (postId) => {
        const res = await api.post(`${ENDPOINT}/${postId}`);
        return res.data;
    },

    /**
     * DELETE /favorites/{postId}
     * Bỏ yêu thích
     */
    removeFavorite: async (postId) => {
        const res = await api.delete(`${ENDPOINT}/${postId}`);
        return res.data;
    },

    /**
     * GET /favorites
     * Lấy toàn bộ danh sách yêu thích (có PostResponse nhúng sẵn)
     */
    getMyFavorites: async () => {
        const res = await api.get(ENDPOINT);
        return res.data;
    },
};

export default FavoriteService;
