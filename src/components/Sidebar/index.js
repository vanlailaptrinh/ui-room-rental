import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { IconVerified, IconChevronRight } from '../../assets/Icons';
import AmenityService from '../../services/amenityService';

function Sidebar({filters, onFilterChange, onReset }) {
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState("");

    // State lưu danh sách tiện ích lấy từ API
    const [dbAmenities, setDbAmenities] = useState([]);

    const provinces = [
        "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Bình Dương", "Đồng Nai",
        "Cần Thơ", "Hải Phòng", "Long An", "Quảng Ninh", "Huế", "Khánh Hòa"
    ].sort();

    // Lấy danh sách tiện ích từ Backend khi component mount
    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await AmenityService.getAmenities();
                if (response && response.data) {
                    setDbAmenities(response.data);
                }
            } catch (error) {
                console.error("Không thể tải danh sách tiện ích:", error);
            }
        };
        fetchAmenities();
    }, []);

    useEffect(() => {
        if (filters.province) setSelectedProvince(filters.province);
        if (filters.price) setSelectedPrice(filters.price);
        if (filters.area) setSelectedArea(filters.area);
    }, [filters]);

    const priceOptions = [
        { label: 'Dưới 2tr', min: 0, max: 2000000 },
        { label: '2tr - 3tr', min: 2000000, max: 3000000 },
        { label: '3tr - 5tr', min: 3000000, max: 5000000 },
        { label: 'Trên 5tr', min: 5000000, max: 100000000 },
    ];

    const areaOptions = [
        { label: 'Dưới 20m²', min: 0, max: 20 },
        { label: '20m² - 30m²', min: 20, max: 30 },
        { label: '30m² - 50m²', min: 30, max: 50 },
        { label: 'Trên 50m²', min: 50, max: 500 },
    ];

    const handleProvinceChange = (e) => {
        const value = e.target.value;
        setSelectedProvince(value);
        onFilterChange('province', value);
    };

    const handleSelect = (type, value, setter) => {
        const newValue = value === (type === 'price' ? selectedPrice : selectedArea) ? null : value;
        setter(newValue);
        onFilterChange(type, newValue);
    };

    const handleAmenityChange = (amenityName) => {
        const updated = selectedAmenities.includes(amenityName)
            ? selectedAmenities.filter(item => item !== amenityName)
            : [...selectedAmenities, amenityName];

        setSelectedAmenities(updated);
        onFilterChange('amenities', updated);
    };

    const handleReset = () => {
        setSelectedProvince("");
        setSelectedPrice(null);
        setSelectedArea(null);
        setSelectedAmenities([]);
        onReset();
    };

    return (
        <aside className="room-sidebar">
            <div className="filter-card">

                <div className="filter-section">
                    <h3 className="filter-title">Tỉnh thành</h3>
                    <select
                        className="province-select"
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                    >
                        <option value="">-- Chọn tỉnh thành --</option>
                        {provinces.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>
                {/* Khoảng giá */}
                <div className="filter-section">
                    <h3 className="filter-title">Khoảng giá</h3>
                    <div className="chip-group">
                        {priceOptions.map((opt) => (
                            <button key={opt.label}
                                // So sánh label thay vì so sánh cả object
                                    className={`chip-btn ${selectedPrice?.label === opt.label ? 'active' : ''}`}
                                    onClick={() => handleSelect('price', opt, setSelectedPrice)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Diện tích */}
                <div className="filter-section">
                    <h3 className="filter-title">Diện tích</h3>
                    <div className="chip-group">
                        {areaOptions.map((opt) => (
                            <button key={opt.label}
                                // So sánh label thay vì so sánh cả object
                                    className={`chip-btn ${selectedArea?.label === opt.label ? 'active' : ''}`}
                                    onClick={() => handleSelect('area', opt, setSelectedArea)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tiện ích - Lấy từ DB */}
                <div className="filter-section">
                    <div
                        className="filter-header-toggle"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <h3 className="filter-title">Tiện ích</h3>
                        <IconChevronRight
                            className={`toggle-icon ${isExpanded ? 'rotated' : ''}`}
                            width="16"
                        />
                    </div>

                    <div className={`amenity-list ${isExpanded ? 'expanded' : 'collapsed'}`}>
                        {dbAmenities.length > 0 ? (
                            // Nếu không mở rộng thì chỉ lấy 4 cái đầu (slice)
                            (isExpanded ? dbAmenities : dbAmenities.slice(0, 4)).map(item => (
                                <label className="amenity-item" key={item.id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedAmenities.includes(item.name)}
                                        onChange={() => handleAmenityChange(item.name)}
                                    />
                                    <span>{item.name}</span>
                                </label>
                            ))
                        ) : (
                            <p style={{fontSize: '12px', color: '#999'}}>Đang tải tiện ích...</p>
                        )}
                    </div>

                    {/* Nút Xem thêm/Thu gọn nhanh nếu danh sách dài */}
                    {dbAmenities.length > 4 && (
                        <button
                            className="show-more-text"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Thu gọn' : `Xem thêm (${dbAmenities.length - 4})`}
                        </button>
                    )}
                </div>

                <button className="reset-filter-btn" onClick={handleReset}>Xóa tất cả</button>
            </div>

            {/* Thẻ xác thực */}
            <div className="verified-card">
                <div className="verified-bg-icon">
                    <IconVerified width="120" height="120" />
                </div>
                <h4 className="verified-header">
                    <IconVerified width="20" height="20" />
                    Danh sách đã xác thực
                </h4>
                <p className="verified-desc">
                    Mỗi phòng đều được kiểm tra trực tiếp về chất lượng và độ an toàn.
                </p>
            </div>
        </aside>
    );
}

export default Sidebar;