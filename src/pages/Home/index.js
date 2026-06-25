import React, { useState, useEffect } from 'react';
import './Home.css';
import { useNavigate, Link } from "react-router-dom";
import PostService from '../../services/postService';
import config from '../../config'

function Home() {
    const navigate = useNavigate();
    const [province, setProvince] = useState("");
    const [budget, setBudget] = useState("");
    const [topViewPost, setTopViewPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopViewPost = async () => {
            try {
                setLoading(true);
                const response = await PostService.getActivePosts();
                if (response && response.code === 200 && Array.isArray(response.data) && response.data.length > 0) {
                    const topPost = response.data.reduce((max, post) => {
                        return (post.views || 0) > (max.views || 0) ? post : max;
                    }, response.data[0]);
                    setTopViewPost(topPost);
                }
            } catch (error) {
                console.error("Lỗi khi lấy phòng có view cao nhất:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTopViewPost();
    }, []);

    const handleSearch = () => {
        let query = [];
        if (province && province !== "-- Chọn tỉnh thành --") {
            query.push(`province=${encodeURIComponent(province)}`);
        }
        if (budget && budget !== "-- Chọn giá --") {
            query.push(`price=${encodeURIComponent(budget)}`);
        }
        const queryString = query.length > 0 ? `?${query.join('&')}` : '';
        navigate(`/postlist${queryString}`);
    };

    const handleCategoryClick = (typeValue) => {
        navigate(`/postlist?type=${encodeURIComponent(typeValue)}`);
    };

    const formatPrice = (price) => {
        if (!price) return "Liên hệ";
        return price.toLocaleString('vi-VN') + "đ";
    };

    return (
        <main className="home-page-wrapper home-main">
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
                                        <option value="">-- Chọn tỉnh thành --</option>
                                        <option>Hà Nội</option>
                                        <option>TP. Hồ Chí Minh</option>
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
                                        <option value="">-- Chọn giá --</option>
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

            <section className="home-section-container">
                <div className="home-section-header">
                    <h2 className="home-section-headline">Khám phá theo loại hình</h2>
                    <p className="home-section-sub-headline">Lựa chọn phong cách sống phù hợp nhất với nhu cầu.</p>
                </div>
                <div className="home-bento-grid">
                    <div className="home-bento-item home-big" onClick={() => handleCategoryClick('APARTMENT')} style={{cursor: 'pointer'}}>
                        <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267" alt="Căn hộ" />
                        <div className="home-bento-overlay">
                            <p>Riêng tư & Tiện nghi</p>
                            <h3>Căn hộ dịch vụ</h3>
                        </div>
                    </div>
                    <div className="home-bento-stack">
                        <div className="home-bento-item home-small" onClick={() => handleCategoryClick('SINGLE')} style={{cursor: 'pointer'}}>
                            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511" alt="Phòng đơn" />
                            <div className="home-bento-overlay"><h3>Phòng đơn</h3></div>
                        </div>
                        <div className="home-bento-item home-small" onClick={() => handleCategoryClick('DORMITORY')} style={{cursor: 'pointer'}}>
                            <img src="https://images.unsplash.com/photo-1505691938895-1758d7feb511" alt="KTX" />
                            <div className="home-bento-overlay"><h3>Ký túc xá cao cấp</h3></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-section-container home-bg-light-gray">
                <div className="home-flex-header">
                    <div>
                        <h2 className="home-section-headline">Xu hướng tìm kiếm tuần này</h2>
                        <p className="home-section-sub-headline" style={{marginTop: '4px'}}>Căn phòng có lượt tương tác lớn nhất hệ thống hiện tại.</p>
                    </div>
                    <Link to={config.routes.postList} className="home-btn-text-link">
                        Xem tất cả phòng →
                    </Link>
                </div>

                {loading ? (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Đang tìm kiếm căn phòng thịnh hành...</div>
                ) : topViewPost ? (
                    <div className="home-wide-card">
                        <div className="home-card-img-box">
                            <img
                                src={topViewPost.images && topViewPost.images.length > 0 ? topViewPost.images[0] : "https://images.unsplash.com/photo-1493809842364-78817add7ffb"}
                                alt={topViewPost.title}
                            />
                            <span className="home-price-badge">{formatPrice(topViewPost.price)} / tháng</span>
                        </div>
                        <div className="home-card-info">
                            <div className="home-card-tags">
                                <span className="home-tag-green">🔥 Thịnh hành</span>
                                <span className="home-tag-gray">👁️ {topViewPost.views || 0} lượt xem</span>
                                <span className="home-tag-gray">📐 {topViewPost.area} $m^2$</span>
                            </div>
                            <h3>{topViewPost.title}</h3>
                            <p className="home-card-desc">
                                {topViewPost.content || `Địa chỉ tại: ${topViewPost.address}. Liên hệ ngay để biết thêm chi tiết.`}
                            </p>

                            <div className="home-amenities">
                                {topViewPost.amenities && topViewPost.amenities.slice(0, 3).map((amenity) => (
                                    <span key={amenity.id}>
                                        <i className="material-symbols-outlined" style={{fontSize: '16px', marginRight: '4px'}}>done</i>
                                        {amenity.name}
                                    </span>
                                ))}
                            </div>

                            <div className="home-card-footer">
                                <span className="home-verified">
                                    <span className="material-symbols-outlined">location_on</span> {topViewPost.address.split(',').pop()}
                                </span>
                                <Link to={`/detail/${topViewPost.id}`} className="home-btn-primary-sm">
                                    Khám phá ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>Chưa có bài đăng nào hiển thị.</div>
                )}
            </section>

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