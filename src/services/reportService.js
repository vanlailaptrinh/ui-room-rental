import api from './axios';

const ENDPOINT = '/reports';

const ReportService = {
    createReport: async (payload) => {
        const response = await api.post(ENDPOINT, payload);
        return response.data;
    },
    getMyReports: async () => {
        const response = await api.get(`${ENDPOINT}/me`);
        return response.data;
    },
    getAllReports: async () => {
        const response = await api.get(ENDPOINT);
        return response.data;
    },
    resolveReport: async (id) => {
        const response = await api.put(`${ENDPOINT}/${id}/resolve`);
        return response.data;
    }
};

export default ReportService;
