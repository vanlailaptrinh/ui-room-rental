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
export const getUserById = async (userId) => {
    try {
        const response = await axios.get(`${ENDPOINT}/${userId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
export const updateProfile = async (formDataPayload) => {
    try {
        const response = await axios.put(`${ENDPOINT}/profile`, formDataPayload);
        return response.data;
    } catch (error) {
        throw error;
    }
};