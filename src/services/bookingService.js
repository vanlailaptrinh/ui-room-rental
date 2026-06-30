import api from './axios';

const ENDPOINT = '/bookings';

const BookingService = {
    // ===================== TENANT / USER =====================

    /**
     * POST /bookings
     * Tạo lịch hẹn xem phòng
     * @param {{ postId: string, bookingTime: string }} data
     */
    createBooking: async (data) => {
        const response = await api.post(ENDPOINT, data);
        return response.data;
    },

    /**
     * GET /bookings/my-bookings
     * Xem danh sách lịch hẹn của tôi (tenant)
     */
    getMyBookings: async () => {
        const response = await api.get(`${ENDPOINT}/my-bookings`);
        return response.data;
    },

    /**
     * PUT /bookings/{id}/cancel
     * Hủy lịch hẹn (chỉ khi PENDING)
     */
    cancelBooking: async (id) => {
        const response = await api.put(`${ENDPOINT}/${id}/cancel`);
        return response.data;
    },

    /**
     * PUT /bookings/{id}/confirm-rented
     * USER xác nhận đã thuê trọ sau khi booking được APPROVED.
     */
    confirmRented: async (id) => {
        const response = await api.put(`${ENDPOINT}/${id}/confirm-rented`);
        return response.data;
    },

    // ===================== LANDLORD / ADMIN =====================

    /**
     * GET /bookings/landlord
     * Xem booking gửi đến (landlord)
     */
    getLandlordBookings: async () => {
        const response = await api.get(`${ENDPOINT}/landlord`);
        return response.data;
    },

    /**
     * PUT /bookings/{id}/approve
     * Duyệt lịch hẹn
     */
    approveBooking: async (id) => {
        const response = await api.put(`${ENDPOINT}/${id}/approve`);
        return response.data;
    },

    /**
     * PUT /bookings/{id}/reject
     * Từ chối lịch hẹn
     */
    rejectBooking: async (id) => {
        const response = await api.put(`${ENDPOINT}/${id}/reject`);
        return response.data;
    },

    // ===================== CHUNG =====================

    /**
     * GET /bookings/{id}
     * Chi tiết 1 booking
     */
    getBookingById: async (id) => {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    getBookings: async () => {
        const response = await api.get(ENDPOINT);
        return response.data;
    },
};

export default BookingService;
