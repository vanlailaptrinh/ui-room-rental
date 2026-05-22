import api from './axios';

const ENDPOINT = '/amenities';

const AmenityService = {

    getAmenities: async () => {
        try {
            const response = await api.get(ENDPOINT);
            return response.data;
        } catch (error) {
            console.error("Error fetching amenities list:", error);
            throw error;
        }
    },

    getAmenityById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching amenity with ID ${id}:`, error);
            throw error;
        }
    },

    createAmenity: async (request) => {
        try {
            const response = await api.post(ENDPOINT, request);
            return response.data;
        } catch (error) {
            console.error("Error creating amenity:", error);
            throw error;
        }
    },

    updateAmenity: async (id, request) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, request);
            return response.data;
        } catch (error) {
            console.error(`Error updating amenity with ID ${id}:`, error);
            throw error;
        }
    },

    deleteAmenity: async (id) => {
        try {
            const response = await api.delete(`${ENDPOINT}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting amenity with ID ${id}:`, error);
            throw error;
        }
    }
};

export default AmenityService;