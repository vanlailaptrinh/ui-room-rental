import api from './axios';

const ENDPOINT = '/vouchers';

const VoucherService = {
    // [GET] /vouchers - Lấy tất cả voucher (ADMIN)
    getVouchers: async () => {
        try {
            const response = await api.get(`${ENDPOINT}`);
            return response.data; // Trả về ApiResponse chứa List<VoucherResponse>
        } catch (error) {
            console.error("Error fetching all vouchers:", error);
            throw error;
        }
    },

    // [GET] /vouchers/active - Lấy danh sách voucher đang hoạt động (ADMIN, LANDLORD)
    getActiveVouchers: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/active`);
            return response.data;
        } catch (error) {
            console.error("Error fetching active vouchers:", error);
            throw error;
        }
    },

    // [GET] /vouchers/:id - Lấy chi tiết voucher theo ID (ADMIN, LANDLORD)
    getVoucherById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching voucher ${id}:`, error);
            throw error;
        }
    },

    // [POST] /vouchers - Tạo voucher mới (ADMIN)
    createVoucher: async (voucherData) => {
        try {
            // voucherData cần khớp với cấu trúc VoucherRequest ở BE (quantity, discountPercentage, maxDiscountAmount, startedAt, expiredAt)
            const response = await api.post(`${ENDPOINT}`, voucherData);
            return response.data;
        } catch (error) {
            console.error("Error creating voucher:", error);
            throw error;
        }
    },

    // [PUT] /vouchers/:id - Cập nhật thông tin voucher (ADMIN)
    updateVoucher: async (id, voucherData) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, voucherData);
            return response.data;
        } catch (error) {
            console.error(`Error updating voucher ${id}:`, error);
            throw error;
        }
    },

    // [PUT] /vouchers/active/:id - Bật/Tắt nhanh trạng thái hoạt động (ADMIN)
    updateVoucherActive: async (id, isActive) => {
        try {
            // BE nhận @RequestBody boolean, Axios sẽ gửi trực tiếp giá trị boolean làm body raw
            const response = await api.put(`${ENDPOINT}/active/${id}`, isActive, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error(`Error updating active status for voucher ${id}:`, error);
            throw error;
        }
    },

    // [DELETE] /vouchers/:id/hidden - Ẩn voucher / Xóa mềm (ADMIN)
    softDeleteVoucher: async (id) => {
        try {
            const response = await api.delete(`${ENDPOINT}/${id}/hidden`);
            return response.data;
        } catch (error) {
            console.error(`Error soft deleting voucher ${id}:`, error);
            throw error;
        }
    },

    // [DELETE] /vouchers/:id - Xóa vĩnh viễn / Xóa cứng (ADMIN)
    hardDeleteVoucher: async (id) => {
        try {
            const response = await api.delete(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error hard deleting voucher ${id}:`, error);
            throw error;
        }
    }
};

export default VoucherService;