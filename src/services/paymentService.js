import api from './axios';

const ENDPOINT = '/payments';

const PaymentService = {
    createPaymentUrl: async (orderId) => {
        try {
            const response = await api.post(`${ENDPOINT}/vnp/create/${orderId}`);
            return response.data; 
        } catch (error) {
            console.error(`Error creating VNPAY payment URL for order ${orderId}:`, error);
            throw error;
        }
    },

    verifyPayment: async (queryParams) => {
        try {
            const response = await api.get(`${ENDPOINT}/vnp/callback`, {
                params: queryParams
            });
            return response.data;
        } catch (error) {
            console.error("Error verifying VNPAY payment callback:", error);
            throw error;
        }
    }
};

export default PaymentService;