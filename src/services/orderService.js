import api from './axios';

const ENDPOINT = '/orders';

const OrderService = {
    // [POST] /orders - Tạo đơn hàng mới
    createOrder: async (orderRequest) => {
        try {
            const response = await api.post(`${ENDPOINT}`, orderRequest);
            return response.data; // Trả về ApiResponse
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    // [PUT] /orders/:id - Cập nhật đơn hàng (Admin)
    updateOrder: async (id, orderRequest) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, orderRequest);
            return response.data;
        } catch (error) {
            console.error(`Error updating order ${id}:`, error);
            throw error;
        }
    },

    // [DELETE] /orders/:id - Xóa đơn hàng (Admin)
    deleteOrder: async (id) => {
        try {
            const response = await api.delete(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting order ${id}:`, error);
            throw error;
        }
    },

    // [GET] /orders - Lấy tất cả đơn hàng (Admin)
    getOrders: async () => {
        try {
            const response = await api.get(`${ENDPOINT}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw error;
        }
    },

    // [GET] /orders/my-orders - Lấy đơn hàng của landlord hiện tại
    getMyOrders: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/my-orders`);
            return response.data;
        } catch (error) {
            console.error("Error fetching my orders:", error);
            throw error;
        }
    },

    // [GET] /orders/:id - Lấy chi tiết một đơn hàng theo ID
    getOrderById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    // [GET] /orders/status - Lấy danh sách trạng thái đơn hàng (Enum)
    getOrderStatuses: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/status`);
            return response.data;
        } catch (error) {
            console.error("Error fetching order statuses:", error);
            throw error;
        }
    },

    // [GET] /orders/pending - Lấy đơn hàng đang chờ duyệt/xử lý (Admin)
    getPendingOrders: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/pending`);
            return response.data;
        } catch (error) {
            console.error("Error fetching pending orders:", error);
            throw error;
        }
    },

    // [GET] /orders/success - Lấy danh sách đơn hàng thành công (Admin)
    getSuccessOrders: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/success`);
            return response.data;
        } catch (error) {
            console.error("Error fetching success orders:", error);
            throw error;
        }
    },

    // [GET] /orders/failed - Lấy danh sách đơn hàng thất bại (Admin)
    getFailedOrders: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/failed`);
            return response.data;
        } catch (error) {
            console.error("Error fetching failed orders:", error);
            throw error;
        }
    }
};

export default OrderService;