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
    "Huế": "khánh hòa",
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
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const queryParams = new URLSearchParams(location.search);
    const provinceParam = queryParams.get("province");
    const priceParam = queryParams.get("price");
    const searchTerm = queryParams.get('search') || '';
    const typeParam = queryParams.get('type');

    const [filters, setFilters] = useState({
        province: null,
        price: null,
        area: null,
        amenities: [],
        roomType: null
    });

    const [sortType, setSortType] = useState('popular');
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await PostService.getActivePosts({ search: searchTerm });
                if (response && response.data) {
                    setPosts(response.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [searchTerm]);

    // Sửa: Chỉ khởi tạo giá trị ban đầu nếu filters hiện tại đang trống (null)
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            province: provinceParam || prev.province,
            roomType: (typeParam && typeParam !== 'undefined' && typeParam !== 'null') ? decodeURIComponent(typeParam) : prev.roomType,
            price: priceParam ? prev.price : prev.price
        }));
    }, [provinceParam, priceParam, typeParam]);

    useEffect(() => {
        if (loading) return;
        let data = [...posts];

        // Sử dụng logic AND (&&) để tất cả các bộ lọc được áp dụng cùng lúc
        data = data.filter(p => {
            const matchProvince = !filters.province || normalizeProvince(p.address).includes(normalizeProvince(filters.province));

            const matchPrice = !filters.price || (p.price >= filters.price.min && p.price <= filters.price.max);

            const matchArea = !filters.area || (p.area >= filters.area.min && p.area <= filters.area.max);

            const matchAmenities = filters.amenities.length === 0 || filters.amenities.every(n => p.amenities?.some(a => a.name === n));

            const postRoomTypeValue = p.roomType && typeof p.roomType === 'object' ? (p.roomType.value || p.roomType.id) : p.roomType;
            const matchRoomType = !filters.roomType || (postRoomTypeValue && String(postRoomTypeValue).toUpperCase() === String(filters.roomType).toUpperCase());

            return matchProvince && matchPrice && matchArea && matchAmenities && matchRoomType;
        });

        switch (sortType) {
            case 'price-asc': data.sort((a, b) => a.price - b.price); break;
            case 'price-desc': data.sort((a, b) => b.price - a.price); break;
            case 'newest': data.sort((a, b) => Number(b.id) - Number(a.id)); break;
            case 'popular': data.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
            default: break;
        }
        setFilteredPosts(data);
        setCurrentPage(1);
    }, [filters, posts, sortType, loading]);

    const handleFilterChange = (type, value) => setFilters(prev => ({ ...prev, [type]: value }));
    const handleReset = () => { setFilters({ province: null, price: null, area: null, amenities: [], roomType: null }); setSortType('popular'); };

    const indexOfLastPost = currentPage * postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfLastPost - postsPerPage, indexOfLastPost);
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    return (
        <main className="room-page__main">
            <div className="room-page__header">
                <nav className="room-page__breadcrumb">
                    <span>Trang chủ</span> <IconChevronRight width="12" /> <span>Phòng</span>
                </nav>
                <div className="room-page__toolbar">
                    <div className="room-page__title-group">
                        <h1>{searchTerm ? `Kết quả: "${searchTerm}"` : "Tất cả phòng"}</h1>
                    </div>
                    <div className="room-page__actions">
                        <div className="room-page__filter-trigger" onClick={() => setIsSidebarOpen(true)}>
                            <span className="material-symbols-outlined">menu</span> Bộ lọc
                        </div>
                        <div className="room-page__sort-container">
                            <select className="room-page__sort-select" value={sortType} onChange={(e) => setSortType(e.target.value)}>
                                <option value="popular">Phổ biến</option>
                                <option value="price-asc">Giá thấp-cao</option>
                                <option value="price-desc">Giá cao-thấp</option>
                                <option value="newest">Mới nhất</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`room-page__grid ${isSidebarOpen ? 'is-sidebar-open' : ''}`}>
                <aside className="room-page__sidebar-wrapper">
                    <div className="sidebar-header">
                        <h3>Bộ lọc</h3>
                        <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>&times;</button>
                    </div>
                    <Sidebar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
                </aside>
                <section className="room-page__listing">
                    {loading ? <div className="room-page__loading">Đang tải...</div> : (
                        <div className="room-page__property-grid">
                            {currentPosts.length > 0 ? currentPosts.map(item => <PropertyCard key={item.id} data={item} />) : <div className="room-page__no-results">Không tìm thấy.</div>}
                        </div>
                    )}
                    {totalPages >= 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
                </section>
            </div>
        </main>
    );
}

export default PostList;