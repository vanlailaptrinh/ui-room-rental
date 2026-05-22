import api from './axios';

const inventoryService = {
    getMyInventories: async () => {
        try {
            // Gọi đến API lấy kho gói cước của cá nhân Landlord
            const response = await api.get('/inventories/my-inventories'); // Hãy điều chỉnh endpoint này khớp với @RequestMapping trong Controller của bạn
            return response.data;
        } catch (error) {
            console.error("Error fetching my inventories:", error);
            throw error;
        }
    }
};

export default inventoryService;