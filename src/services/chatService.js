import api from './axios'; // Sử dụng instance 'api' đồng bộ toàn hệ thống

const ENDPOINT = '/chat';

const ChatService = {
    // [POST] /chat/room - Lấy hoặc khởi tạo phòng chat với một user cụ thể
    getOrCreateChatRoom: async (targetUserId) => {
        try {
            const response = await api.post(`${ENDPOINT}/room`, { targetUserId });
            return response.data; // Trả về ApiResponse chứa thông tin phòng chat (roomId, participantIds,...)
        } catch (error) {
            console.error(`Error getting or creating chat room for user ${targetUserId}:`, error);
            throw error;
        }
    }
};

export default ChatService;