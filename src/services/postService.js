import api from './axios';

const ENDPOINT = '/posts';

const PostService = {

    /**
     * Tạo bài đăng mới
     */
    createPost: async (formData) => {
        try {
            const response = await api.post(ENDPOINT, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    },

    /**
     * Cập nhật bài đăng (ADMIN, LANDLORD)
     */
    updatePost: async (id, formData) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Duyệt bài đăng (ADMIN)
     */
    approvePost: async (id) => {
        try {
            const response = await api.put(`${ENDPOINT}/approve/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error approving post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Từ chối duyệt bài đăng (ADMIN)
     */
    rejectPost: async (id) => {
        try {
            const response = await api.put(`${ENDPOINT}/reject/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error rejecting post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Đăng lại bài đăng đã hết hạn/bị hạ (LANDLORD)
     */
    republishPost: async (id) => {
        try {
            const response = await api.put(`${ENDPOINT}/republish/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error republishing post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Bật/Tắt ẩn bài đăng (ADMIN, LANDLORD)
     */
    toggleActiveHiddenPost: async (id) => {
        try {
            const response = await api.put(`${ENDPOINT}/toggle-active-hidden/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error toggling active/hidden status for post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Xóa bài đăng hoàn toàn (ADMIN, LANDLORD)
     */
    deletePost: async (id) => {
        try {
            const response = await api.delete(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách enum các trạng thái của bài đăng
     */
    getPostStatuses: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/status`);
            return response.data;
        } catch (error) {
            console.error("Error fetching post statuses:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bài đăng của riêng tôi (ADMIN, LANDLORD)
     */
    getMyPosts: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/my-posts`);
            return response.data;
        } catch (error) {
            console.error("Error fetching my posts:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bài đăng theo ID Tiện nghi
     */
    getPostsByAmenity: async (amenityId) => {
        try {
            const response = await api.get(`${ENDPOINT}/amenity/${amenityId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching posts by amenity ${amenityId}:`, error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bài đăng đang ở trạng thái hiển thị / hoạt động (Public)
     */
    getActivePosts: async (params = {}) => {
        try {
            const response = await api.get(`${ENDPOINT}/active`, { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching active posts:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bài đăng chờ duyệt (ADMIN)
     */
    getPendingPosts: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/pending`);
            return response.data;
        } catch (error) {
            console.error("Error fetching pending posts:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bài đăng đã bị ẩn (ADMIN, LANDLORD)
     */
    getHiddenPosts: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/hidden`);
            return response.data;
        } catch (error) {
            console.error("Error fetching hidden posts:", error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bài đăng bị từ chối duyệt (ADMIN, LANDLORD)
     */
    getRejectPosts: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/rejected`);
            return response.data;
        } catch (error) {
            console.error("Error fetching rejected posts:", error);
            throw error;
        }
    },

    /**
     * Lấy toàn bộ danh sách tất cả bài đăng hệ thống (ADMIN)
     */
    getPosts: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data;
        } catch (error) {
            console.error("Error fetching all posts:", error);
            throw error;
        }
    },

    /**
     * Lấy bài đăng lọc theo Tỉnh/Thành phố
     */
    getPostsByProvince: async (province) => {
        try {
            const response = await api.get(`${ENDPOINT}/province`, {
                params: { province }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching posts by province ${province}:`, error);
            throw error;
        }
    },

    /**
     * Lấy thông tin chi tiết của bài đăng cụ thể theo ID
     */
    getPostById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching post ${id}:`, error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử xem bài viết của tài khoản hiện tại
     */
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