import api from './axios';

const ENDPOINT = '/finances';

const FinanceService = {
    // [GET] /finances/statistics/month - Lấy thống kê tài chính theo tháng (ADMIN)
    getFinanceStatsByMonth: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/statistics/month`);
            return response.data; // Trả về ApiResponse chứa List<FinanceResponse>
        } catch (error) {
            console.error("Error fetching monthly finance statistics:", error);
            throw error;
        }
    },

    // [GET] /finances/statistics/quarter - Lấy thống kê tài chính theo quý (ADMIN)
    getFinanceStatsByQuarter: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/statistics/quarter`);
            return response.data; // Trả về ApiResponse chứa List<FinanceResponse>
        } catch (error) {
            console.error("Error fetching quarterly finance statistics:", error);
            throw error;
        }
    },

    // [GET] /finances/statistics/year - Lấy thống kê tài chính theo năm (ADMIN)
    getFinanceStatsByYear: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/statistics/year`);
            return response.data; // Trả về ApiResponse chứa List<FinanceResponse>
        } catch (error) {
            console.error("Error fetching yearly finance statistics:", error);
            throw error;
        }
    }
};

export default FinanceService;