import React from 'react';
import './LandlordFilterBar.css';

const LandlordFilterBar = ({
                               searchTerm,
                               setSearchTerm,
                               searchPlaceholder = "🔍 Tìm kiếm...",
                               filterStatus,
                               setFilterStatus,
                               statusOptions = [], // Danh sách các lựa chọn Trạng thái tùy biến theo từng Tab
                               sortBy,
                               setSortBy,
                               sortOptions = []    // Danh sách các lựa chọn Sắp xếp tùy biến theo từng Tab
                           }) => {
    return (
        <div className="landlord-filter-bar">
            {/* 🔍 Ô tìm kiếm từ khóa */}
            <div className="filter-group filter-search">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                />
            </div>

            <div className="filter-group-right">
                {/* ⏳ Bộ lọc Trạng thái (Chỉ hiển thị nếu có truyền tùy chọn vào) */}
                {statusOptions.length > 0 && (
                    <div className="filter-group">
                        <label>Trạng thái:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            {statusOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* 🗓️ Bộ lọc Sắp xếp (Chỉ hiển thị nếu có truyền tùy chọn vào) */}
                {sortOptions.length > 0 && (
                    <div className="filter-group">
                        <label>Sắp xếp:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandlordFilterBar;