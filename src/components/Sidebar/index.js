import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { IconVerified, IconChevronRight } from '../../assets/Icons';
import AmenityService from '../../services/amenityService';
import roomService from '../../services/roomService';

function Sidebar({ filters, onFilterChange, onReset }) {
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedRoomType, setSelectedRoomType] = useState("");

    const [dbAmenities, setDbAmenities] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    const provinces = [
        "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Bình Dương", "Đồng Nai",
        "Cần Thơ", "Hải Phòng", "Long An", "Quảng Ninh", "Huế", "Khánh Hòa"
    ].sort();

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const response = await AmenityService.getAmenities();
                if (response && response.data) {
                    setDbAmenities(response.data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchAmenities();
    }, []);

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                setLoadingTypes(true);
                const response = await roomService.getRoomTypes();

                const actualData = Array.isArray(response)
                    ? response
                    : (response && Array.isArray(response.data) ? response.data : []);

                setRoomTypes(actualData);
            } catch (error) {
                console.error(error);
                setRoomTypes([]);
            } finally {
                setLoadingTypes(false);
            }
        };
        fetchRoomTypes();
    }, []);

    useEffect(() => {
        if (filters.province) setSelectedProvince(filters.province);
        if (filters.price) setSelectedPrice(filters.price);
        if (filters.area) setSelectedArea(filters.area);
        setSelectedRoomType(filters.roomType || "");
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

    const handleRoomTypeChange = (e) => {
        const value = e.target.value;
        setSelectedRoomType(value);
        onFilterChange('roomType', value || null);
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
        setSelectedRoomType("");
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

                <div className="filter-section">
                    <h3 className="filter-title">Loại phòng</h3>
                    {loadingTypes ? (
                        <p style={{ fontSize: '12px', color: '#999' }}>Đang tải...</p>
                    ) : (
                        <select
                            className="province-select"
                            value={selectedRoomType}
                            onChange={handleRoomTypeChange}
                        >
                            <option value="">-- Chọn loại phòng --</option>
                            {Array.isArray(roomTypes) && roomTypes.map((type) => (
                                <option key={type.id || type.value} value={type.value || type.id}>
                                    {type.name || type.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="filter-section">
                    <h3 className="filter-title">Khoảng giá</h3>
                    <div className="chip-group">
                        {priceOptions.map((opt) => (
                            <button key={opt.label}
                                    className={`chip-btn ${selectedPrice?.label === opt.label ? 'active' : ''}`}
                                    onClick={() => handleSelect('price', opt, setSelectedPrice)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="filter-section">
                    <h3 className="filter-title">Diện tích</h3>
                    <div className="chip-group">
                        {areaOptions.map((opt) => (
                            <button key={opt.label}
                                    className={`chip-btn ${selectedArea?.label === opt.label ? 'active' : ''}`}
                                    onClick={() => handleSelect('area', opt, setSelectedArea)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

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
                            <p style={{ fontSize: '12px', color: '#999' }}>Đang tải tiện ích...</p>
                        )}
                    </div>

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

            {/*<div className="verified-card">*/}
            {/*    <div className="verified-bg-icon">*/}
            {/*        <IconVerified width="120" height="120" />*/}
            {/*    </div>*/}
            {/*    <h4 className="verified-header">*/}
            {/*        <IconVerified width="20" height="20" />*/}
            {/*        Danh sách đã xác thực*/}
            {/*    </h4>*/}
            {/*    <p className="verified-desc">*/}
            {/*        Mỗi phòng đều được kiểm tra trực tiếp về chất lượng và độ an toàn.*/}
            {/*    </p>*/}
            {/*</div>*/}
        </aside>
    );
}

export default Sidebar;