import api from './axios';

const ENDPOINT = '/packages';

const PackageService = {
    // [POST] /packages - Tạo gói dịch vụ mới (ADMIN)
    createPackage: async (packageData) => {
        try {
            const response = await api.post(`${ENDPOINT}`, packageData);
            return response.data; // Trả về ApiResponse chứa PackageResponse
        } catch (error) {
            console.error("Error creating package:", error);
            throw error;
        }
    },

    // [PUT] /packages/:id - Cập nhật thông tin gói dịch vụ (ADMIN)
    updatePackage: async (id, packageData) => {
        try {
            const response = await api.put(`${ENDPOINT}/${id}`, packageData);
            return response.data; // Trả về ApiResponse chứa PackageResponse đã cập nhật
        } catch (error) {
            console.error(`Error updating package ${id}:`, error);
            throw error;
        }
    },

    // [DELETE] /packages/:id - Xóa vĩnh viễn gói dịch vụ (ADMIN)
    deletePackage: async (id) => {
        try {
            const response = await api.delete(`${ENDPOINT}/${id}`);
            return response.data; // Trả về ApiResponse<Void>
        } catch (error) {
            console.error(`Error deleting package ${id}:`, error);
            throw error;
        }
    },

    // [GET] /packages - Lấy danh sách tất cả gói dịch vụ (ADMIN, LANDLORD)
    getPackages: async () => {
        try {
            const response = await api.get(`${ENDPOINT}`);
            return response.data; // Trả về ApiResponse chứa List<PackageResponse>
        } catch (error) {
            console.error("Error fetching packages:", error);
            throw error;
        }
    },

    // [GET] /packages/:id - Lấy chi tiết một gói dịch vụ theo ID (ADMIN, LANDLORD)
    getPackageById: async (id) => {
        try {
            const response = await api.get(`${ENDPOINT}/${id}`);
            return response.data; // Trả về ApiResponse chứa PackageResponse chi tiết
        } catch (error) {
            console.error(`Error fetching package ${id}:`, error);
            throw error;
        }
    },

    // [GET] /packages/types - Lấy danh sách các loại gói dịch vụ (Enum) (ADMIN, LANDLORD)
    getPackageTypes: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/types`);
            return response.data; // Trả về ApiResponse chứa List<EnumResponse>
        } catch (error) {
            console.error("Error fetching package types:", error);
            throw error;
        }
    },

    // [GET] /packages/tiers - Lấy danh sách các cấp độ gói dịch vụ (Enum) (ADMIN, LANDLORD)
    getPackageTiers: async () => {
        try {
            const response = await api.get(`${ENDPOINT}/tiers`);
            return response.data; // Trả về ApiResponse chứa List<EnumResponse>
        } catch (error) {
            console.error("Error fetching package tiers:", error);
            throw error;
        }
    }
};

export default PackageService;