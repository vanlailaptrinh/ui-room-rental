import axios from '../services/axios';

// Tạo đơn hàng mới
export const createOrder = async (orderRequest) => {
    const response = await axios.post('/orders', orderRequest);
    return response.data;
};

// Cập nhật đơn hàng (Admin)
export const updateOrder = async (id, orderRequest) => {
    const response = await axios.put(`/orders/${id}`, orderRequest);
    return response.data;
};

// Xóa đơn hàng (Admin)
export const deleteOrder = async (id) => {
    const response = await axios.delete(`/orders/${id}`);
    return response.data;
};

// Lấy tất cả đơn hàng (Admin)
export const getOrders = async () => {
    const response = await axios.get('/orders');
    return response.data;
};

// Lấy đơn hàng của landlord
export const getMyOrders = async () => {
    const response = await axios.get('/orders/my-orders');
    return response.data;
};

// Lấy chi tiết đơn hàng
export const getOrderById = async (id) => {
    const response = await axios.get(`/orders/${id}`);
    return response.data;
};

// Lấy danh sách trạng thái đơn hàng
export const getOrderStatuses = async () => {
    const response = await axios.get('/orders/status');
    return response.data;
};

// Lấy đơn hàng theo trạng thái (Admin)
export const getPendingOrders = async () => {
    const response = await axios.get('/orders/pending');
    return response.data;
};

export const getSuccessOrders = async () => {
    const response = await axios.get('/orders/success');
    return response.data;
};

export const getFailedOrders = async () => {
    const response = await axios.get('/orders/failed');
    return response.data;
};

const orderService = {
    createOrder,
    updateOrder,
    deleteOrder,
    getOrders,
    getMyOrders,
    getOrderById,
    getOrderStatuses,
    getPendingOrders,
    getSuccessOrders,
    getFailedOrders
};

export default orderService;
