import axios from '../services/axios';

const paymentService = {
    createPaymentUrl: async (orderId) => {
        const response = await axios.post(`/payments/vnp/create/${orderId}`);
        return response.data;
    },

    verifyPayment: async (queryParams) => {
        const response = await axios.get(`/payments/vnp/callback`, {
            params: queryParams
        });
        return response.data;
    }
};

export default paymentService;