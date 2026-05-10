import axios from '../services/axios'

// Thêm từ khóa export trước từng hàm
export const getPackages = async () => {
    const response = await axios.get('/packages');
    return response.data;
};

export const getActiveVouchers = async () => {
    const response = await axios.get('/vouchers/active');
    return response.data;
};

const packageService = {
    getPackages,
    getActiveVouchers
};
export default packageService;