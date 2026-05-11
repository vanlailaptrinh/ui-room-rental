import React, { useState } from 'react';
import './Home.css';
import { useNavigate, Link } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const [province, setProvince] = useState("Chọn tỉnh thành");
    const [budget, setBudget] = useState("Chọn giá");

    const handleSearch = () => {
        navigate(`/postlist?province=${encodeURIComponent(province)}&price=${encodeURIComponent(budget)}`
    )};
        return (
        /* Thêm class bao quanh để định danh toàn bộ trang Home */
        <main className="home-page-wrapper home-main">
            {/* 1. SECTION HERO */}
            <section className="home-hero-section">
                <div className="home-hero-blur-1"></div>
                <div className="home-hero-blur-2"></div>
                <div className="home-hero-content">
                    <h1 className="home-hero-title">
                        Tìm kiếm <span className="home-text-primary">Không gian</span><br/>Sống Lý Tưởng.
                    </h1>
                    <p className="home-hero-subtitle">
                        Nền tảng biên tập các căn hộ, phòng trọ sinh viên được tuyển chọn kỹ lưỡng,
                        mang lại sự an tâm tuyệt đối cho hành trình học tập của bạn.
                    </p>

                    <div className="home-search-bar-container">
                        <div className="home-search-fields">

                            <div className="home-field-group home-border-right">
                                <label>Khu vực</label>
                                <div className="home-input-with-icon">
                                    <select value={province} onChange={(e) => setProvince(e.target.value)}>
                                        <option>-- Chọn tỉnh thành --</option>
                                        <option>Hà Nội</option>
                                        <option>TP. Hồ Chi Minh</option>
                                        <option>Bình Dương</option>
                                        <option>Cần Thơ</option>
                                        <option>Huế</option>
                                        <option>Đà Nẵng</option>
                                        <option>Đồng Nai</option>
                                        <option>Khánh Hòa</option>
                                        <option>Long An</option>
                                        <option>Hải Phòng</option>
                                    </select>
                                </div>
                            </div>
                            <div className="home-field-group">
                                <label>Ngân sách</label>
                                <div className="home-input-with-icon">
                                    <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                                        <option>-- Chọn giá --</option>
                                        <option>Dưới 2 triệu</option>
                                        <option>2 - 3 triệu</option>
                                        <option>3 - 5 triệu</option>
                                        <option>Trên 5 triệu</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button className="home-btn-search-main" onClick={handleSearch}>Tìm kiếm ngay</button>
                    </div>
                </div>
            </section>

            {/* 2. SECTION CATEGORIES */}
            <section className="home-section-container">
                <div className="home-section-header">
                    <h2 className="home-section-headline">Khám phá theo loại hình</h2>
                    <p className="home-section-sub-headline">Lựa chọn phong cách sống phù hợp nhất với nhu cầu.</p>
                </div>
                <div className="home-bento-grid">
                    <div className="home-bento-item home-big">
                        <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" alt="Căn hộ" />
                        <div className="home-bento-overlay">
                            <p>Riêng tư & Tiện nghi</p>
                            <h3>Căn hộ dịch vụ</h3>
                        </div>
                    </div>
                    <div className="home-bento-stack">
                        <div className="home-bento-item home-small">
                            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511" alt="Phòng đơn" />
                            <div className="home-bento-overlay"><h3>Phòng đơn</h3></div>
                        </div>
                        <div className="home-bento-item home-small">
                            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511" alt="KTX" />
                            <div className="home-bento-overlay"><h3>Ký túc xá cao cấp</h3></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SECTION FEATURED ROOMS */}
            <section className="home-section-container home-bg-light-gray">
                <div className="home-flex-header">
                    <h2 className="home-section-headline">Phòng tốt nhất gần trường</h2>
                    <Link to="/room" className="home-btn-text-link">
                        Xem tất cả →
                    </Link>
                </div>

                <div className="home-wide-card">
                    <div className="home-card-img-box">
                        <img src="https://images.unsplash.com/photo-1493809842364-78817add7ffb" alt="Room" />
                        <span className="home-price-badge">7.500.000đ / tháng</span>
                    </div>
                    <div className="home-card-info">
                        <div className="home-card-tags">
                            <span className="home-tag-green">Sẵn sàng</span>
                            <span className="home-tag-gray">500m tới ĐH Kinh Tế</span>
                        </div>
                        <h3>The Nexus Studio - Quận 3</h3>
                        <p className="home-card-desc">Căn hộ studio thiết kế riêng cho sinh viên với đầy đủ nội thất cao cấp, ánh sáng tự nhiên ngập tràn.</p>
                        <div className="home-amenities">
                            <span><i className="material-symbols-outlined">wifi</i> Siêu tốc</span>
                            <span><i className="material-symbols-outlined">security</i> Bảo vệ 24/7</span>
                        </div>
                        <div className="home-card-footer">
                            <span className="home-verified">
                                <span className="material-symbols-outlined">verified</span> Chủ nhà tin cậy
                            </span>
                            <Link to="/detail" className="home-btn-primary-sm">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SECTION PROMOTION BANNER */}
            <section className="home-section-container">
                <div className="home-promo-banner">
                    <div className="home-promo-content">
                        <h2>Ưu đãi độc quyền cho Tân sinh viên 2026</h2>
                        <p>Giảm ngay 10% tháng thuê đầu tiên và miễn phí phí dịch vụ cho các hợp đồng ký sớm.</p>
                        <div className="home-promo-btns">
                            <button className="home-btn-white">Nhận mã ưu đãi</button>
                            <button className="home-btn-outline-white">Tìm hiểu thêm</button>
                        </div>
                    </div>
                    <div className="home-promo-stats">
                        <div className="home-stat-box">
                            <span className="home-stat-number">500+</span>
                            <span className="home-stat-label">Ưu đãi đã nhận</span>
                        </div>
                        <div className="home-stat-box">
                            <span className="home-stat-number">12</span>
                            <span className="home-stat-label">Ngày còn lại</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;