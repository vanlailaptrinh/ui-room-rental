import api from './axios';

const roomService = {
    getRoomTypes: async () => {
        try {
            // Tự động được đính kèm token và baseURL từ instance
            const response = await api.get('/rooms/types');
            return response.data;
        } catch (error) {
            console.error("Error fetching room types:", error);
            throw error;
        }
    }
};

export default roomService;