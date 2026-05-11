import React, { useState, useEffect } from 'react';
import './Room.css';
import Sidebar from '../../components/Sidebar';
import PropertyCard from '../../components/PropertyCard';
import Pagination from "../../components/Pagination";
import { IconChevronRight } from '../../assets/Icons';
import PostService from '../../services/postService';
import { useLocation } from 'react-router-dom';

export const provinceMap = {
    "TP. Hồ Chí Minh": "hồ chí minh",
    "TP.HCM": "hồ chí minh",
    "Thành phố Hồ Chí Minh": "hồ chí minh",
    "Hồ Chí Minh": "hồ chí minh",
    "Hà Nội": "hà nội",
    "Đà Nẵng": "đà nẵng",
    "Bình Dương": "bình dương",
    "Cần Thơ": "cần thơ",
    "Huế": "huế",
    "Khánh Hòa": "khánh hòa",
    "Đồng Nai": "đồng nai",
    "Long An": "long an",
    "Hải Phòng": "hải phòng",
    "Quảng Ninh": "quảng ninh"
};

export const normalizeProvince = (value) => {
    if (!value) return "";
    const key = value.trim();
    return provinceMap[key] || key.toLowerCase();
};

function PostList() {
    const [posts, setPosts] = useState([]);                 // Dữ liệu gốc từ API
    const [filteredPosts, setFilteredPosts] = useState([]); // Dữ liệu sau khi lọc & sort
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const provinceParam = queryParams.get("province");
    const priceParam = queryParams.get("price");
    const searchTerm = queryParams.get('search') || '';
    // State cho Lọc
    const [filters, setFilters] = useState({
        province: null,
        price: null,
        area: null,
        amenities: []
    });

    // State cho Sắp xếp
    const [sortType, setSortType] = useState('popular');

    // State cho Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    // --- LOGIC PHÂN TRANG ---
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    // Đây là danh sách bài đăng thực tế sẽ hiển thị trên 1 trang
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // 1. Gọi API lấy dữ liệu lần đầu khi vào trang
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await PostService.getActivePosts({
                    search: searchTerm
                });
                if (response && response.data) {
                    setPosts(response.data);
                    setFilteredPosts(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi kết nối API:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [searchTerm]);

    useEffect(() => {
        let initialFilters = { province: null, price: null, area: null, amenities: [] };

        if (provinceParam) {
            initialFilters.province = provinceParam;
        }

        if (priceParam) {
            switch (priceParam) {
                case "Dưới 2 triệu":
                    initialFilters.price = { label: "Dưới 2tr", min: 0, max: 2000000 };
                    break;
                case "2 - 3 triệu":
                    initialFilters.price = { label: "2tr - 3tr", min: 2000000, max: 3000000 };
                    break;
                case "3 - 5 triệu":
                    initialFilters.price = { label: "3tr - 5tr", min: 3000000, max: 5000000 };
                    break;
                case "Trên 5 triệu":
                    initialFilters.price = { label: "Trên 5tr", min: 5000000, max: 100000000 };
                    break;
                default:
                    break;
            }
        }
        setFilters(initialFilters);
    }, [provinceParam, priceParam]);

    useEffect(() => {
        let data = [...posts];

        if (filters.province || filters.price || filters.area || filters.amenities.length > 0) {
            data = data.filter(p => {
                const provinceNorm = normalizeProvince(filters.province);
                const addrNorm = normalizeProvince(p.address);

                const matchProvince = filters.province
                    ? normalizeProvince(p.address).includes(normalizeProvince(filters.province))
                    : false;

                const matchPrice = filters.price
                    ? p.price >= filters.price.min && p.price <= filters.price.max
                    : false;

                const matchArea = filters.area
                    ? p.area >= filters.area.min && p.area <= filters.area.max
                    : false;

                const matchAmenities = filters.amenities.length > 0
                    ? filters.amenities.some(amenityName =>
                        p.amenities?.some(a => a.name === amenityName)
                    )
                    : false;

                // OR logic: chỉ cần một điều kiện đúng
                return matchProvince || matchPrice || matchArea || matchAmenities;
            });
        }

        // Sắp xếp dữ liệu
        switch (sortType) {
            case 'price-asc':
                data.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                data.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                data.sort((a, b) => Number(b.id) - Number(a.id));
                break;
            case 'popular':
                data.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            default:
                break;
        }

        setFilteredPosts(data);
        setCurrentPage(1);
    }, [filters, posts, sortType]);

    // 3. Các hàm điều khiển
    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const handleReset = () => {
        setFilters({ price: null, area: null, amenities: [] });
        setSortType('popular');
    };

    return (
        <main className="room-page-main">
            <div className="room-header-context">
                <nav className="breadcrumb">
                    <span>Trang chủ</span>
                    <IconChevronRight width="12" />
                    <span>Phòng</span>
                </nav>

                <div className="room-header-toolbar">
                    <div className="header-title-group">
                        <h1 className="text-4xl font-extrabold">
                            {searchTerm ? `Kết quả cho: "${searchTerm}"` : "Tất cả phòng"}
                        </h1>
                        <p className="results-count">Hiển thị {filteredPosts.length} bài đăng được chọn lọc</p>
                    </div>

                    <div className="sort-container">
                        <select
                            className="room-sort-select"
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                        >
                            <option value="popular">Sắp xếp: Phổ biến nhất</option>
                            <option value="price-asc">Giá: Thấp đến Cao</option>
                            <option value="price-desc">Giá: Cao đến Thấp</option>
                            <option value="newest">Mới nhất</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="room-layout-grid">
                <Sidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleReset}
                />


                <section className="room-listing-section">
                    {loading ? (
                        <div className="loading-state">Đang tải danh sách phòng...</div>
                    ) : (
                        <div className="property-grid">
                            {currentPosts.length > 0 ? (
                                currentPosts.map((item) => (
                                    <PropertyCard key={item.id} data={item} />
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>Không tìm thấy bài đăng nào phù hợp với bộ lọc.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang */}
                    {totalPages >= 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </section>
            </div>
        </main>
    );
}

export default PostList;