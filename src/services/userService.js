import axios from './axios';

const ENDPOINT = '/users';
export const getUserProfile = async () => {
    try {
        const response = await axios.get(`${ENDPOINT}/profile`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const updateProfile = async (userData) => {
    try {
        const response = await axios.put(`${ENDPOINT}/profile`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};