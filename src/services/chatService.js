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
    },
    // ========================================================
    // [POST] /chat/ai - Gửi tin nhắn lên Trợ lý ảo AI
    // ========================================================
    chatAI: async (messageText) => {
        try {
            // "message" là key tương ứng với thuộc tính trong AIChatRequest DTO ở Backend của bạn
            // (Bạn có thể đổi lại thành 'content', 'prompt' nếu Backend quy định khác nhé)
            const response = await api.post(`${ENDPOINT}/ai`, { message: messageText });

            return response.data; // Trả về cấu trúc ApiResponse<Object>
        } catch (error) {
            console.error('Error calling AI Chat Service:', error);
            throw error;
        }
    },

    // ========================================================
    // [POST] /chat/notify-message - Gửi thông báo tin nhắn mới
    // Gửi notification cho người nhận khi có tin nhắn mới
    // ========================================================
    sendMessageNotification: async (recipientId, messagePreview) => {
        try {
            const response = await api.post(`${ENDPOINT}/notify-message`, {
                recipientId,
                messagePreview,
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message notification:', error);
            throw error;
        }
    }
};

export default ChatService;