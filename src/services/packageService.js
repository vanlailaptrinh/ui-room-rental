import axios from '../services/axios'

const packageService = {
    getPackages: async () => {
        try {
            const response = await axios.get('/packages');
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gọi API danh sách gói:", error);
            throw error;
        }
    }
};

export default packageService;