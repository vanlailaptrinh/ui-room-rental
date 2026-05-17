import axios from './axios';

const ENDPOINT = '/chat';
const USERS_ENDPOINT = '/users';

/**
 * POST /chat/room
 * Body: { targetUserId }
 * Returns: { roomId, participantIds, createdAt, updatedAt }
 */
export const getOrCreateChatRoom = async (targetUserId) => {
    const response = await axios.post(`${ENDPOINT}/room`, { targetUserId });
    return response.data?.data;
};

/**
 * GET /users — lấy tất cả users
 * Returns: [{ id, username, email, phone, avatar, role }]
 */
export const getAllUsers = async () => {
    const response = await axios.get(USERS_ENDPOINT);
    return response.data?.data || [];
};
