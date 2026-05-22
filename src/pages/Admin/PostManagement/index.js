import React, { useState, useEffect, useRef } from 'react';
import PostService from '../../../services/postService';
import AmenityService from '../../../services/amenityService';
import UserService from '../../../services/userService';
import PackageService from '../../../services/packageService';
import './PostManagement.css'; 

const PostManagement = () => {
    // ---- State quản lý danh sách & Bộ lọc Tab ----
    const [posts, setPosts] = useState([]);
    const [currentTab, setCurrentTab] = useState('ALL'); 
    const [loading, setLoading] = useState(false);
    
    // ---- State dữ liệu danh mục đồng bộ từ API ----
    const [systemAmenities, setSystemAmenities] = useState([]);
    const [systemPackages, setSystemPackages] = useState([]);

    // ---- State số lượng thống kê đếm trên Badge ----
    const [counts, setCounts] = useState({ all: 0, pending: 0, active: 0, rejected: 0, expired: 0, hidden: 0 });

    // ---- State điều khiển đóng/mở các Modal ----
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    // ---- State lưu bài đăng và dữ liệu liên quan đang được xem chi tiết ----
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [detailPost, setDetailPost] = useState(null);
    const [landlordInfo, setLandlordInfo] = useState(null); 
    const [postPackageDetail, setPostPackageDetail] = useState({ posting: null, boosting: null });

    // ---- State dữ liệu biểu mẫu thêm bài đăng mới ----
    const [formData, setFormData] = useState({
        title: '', content: '', address: '', price: '', area: '',
        latitude: '', longitude: '', roomType: 'SINGLE_ROOM',
        postingTier: 'NORMAL', boostingTier: 'NORMAL', amenities: []
    });
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Bản đồ OpenStreetMap (Leaflet) References
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);

    // Tải cấu hình tiện nghi và gói cước hệ thống khi khởi chạy
    useEffect(() => {
        fetchSystemAmenities();
        fetchSystemPackages();
    }, []);

    // Tự động tải lại danh sách bài đăng khi chuyển đổi các Tab bộ lọc
    useEffect(() => {
        fetchPostsData();
        fetchTabCounts();
    }, [currentTab]);

    // Render bản đồ động khi modal chi tiết hiển thị
    useEffect(() => {
        if (isDetailModalOpen && detailPost?.latitude && detailPost?.longitude) {
            if (window.L) {
                const lat = detailPost.latitude;
                const lng = detailPost.longitude;

                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                if (mapContainerRef.current) {
                    mapRef.current = window.L.map(mapContainerRef.current).setView([lat, lng], 16);
                    
                    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap contributors'
                    }).addTo(mapRef.current);

                    window.L.marker([lat, lng])
                        .addTo(mapRef.current)
                        .bindPopup(`<b>${detailPost.title}</b><br>${detailPost.address}`)
                        .openPopup();
                }
            }
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isDetailModalOpen, detailPost]);

    const fetchSystemAmenities = async () => {
        try {
            const res = await AmenityService.getAmenities();
            if (res) setSystemAmenities(res || []);
        } catch (error) {
            console.error("Lỗi lấy danh sách tiện nghi:", error);
        }
    };

    const fetchSystemPackages = async () => {
        try {
            const res = await PackageService.getPackages();
            if (res && res.code === 200) {
                setSystemPackages(res.data || []);
            } else if (Array.isArray(res)) {
                setSystemPackages(res);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách gói cước hệ thống:", error);
        }
    };

    const fetchTabCounts = async () => {
        try {
            const [resAll, resPending, resActive, resRejected, resHidden] = await Promise.all([
                PostService.getPosts(), PostService.getPendingPosts(),
                PostService.getActivePosts(), PostService.getRejectPosts(), PostService.getHiddenPosts()
            ]);
            
            const allItems = resAll?.data || [];
            const expiredCount = allItems.filter(item => item.status === 'EXPIRED').length;

            setCounts({
                all: allItems.length,
                pending: resPending?.data?.length || 0,
                active: resActive?.data?.length || 0,
                rejected: resRejected?.data?.length || 0,
                expired: expiredCount,
                hidden: resHidden?.data?.length || 0
            });
        } catch (error) {
            console.error("Lỗi đếm số lượng bản ghi tabs:", error);
        }
    };

    const fetchPostsData = async () => {
        setLoading(true);
        try {
            let response;
            switch (currentTab) {
                case 'ALL': response = await PostService.getPosts(); break;
                case 'PENDING': response = await PostService.getPendingPosts(); break;
                case 'ACTIVE': response = await PostService.getActivePosts(); break;
                case 'REJECTED': response = await PostService.getRejectPosts(); break;
                case 'EXPIRED': 
                    const res = await PostService.getPosts();
                    if (res && res.code === 200) {
                        setPosts(res.data.filter(item => item.status === 'EXPIRED') || []);
                    }
                    setLoading(false);
                    return;
                case 'HIDDEN': response = await PostService.getHiddenPosts(); break;
                default: response = await PostService.getPosts();
            }
            if (response && response.code === 200) {
                setPosts(response.data || []);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách bài viết:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = async (post) => {
        setDetailPost(post);
        setLandlordInfo(null);
        setPostPackageDetail({ posting: null, boosting: null });
        setIsDetailModalOpen(true);

        if (systemPackages.length > 0) {
            const postingPkg = systemPackages.find(p => p.tier?.value === post.postingTier || p.tier === post.postingTier);
            const boostingPkg = systemPackages.find(p => p.tier?.value === post.boostingTier || p.tier === post.boostingTier);
            setPostPackageDetail({
                posting: postingPkg || null,
                boosting: boostingPkg || null
            });
        }

        if (post.landlordId) {
            try {
                const userRes = await UserService.getUserById(post.landlordId);
                if (userRes) {
                    setLandlordInfo(userRes.data || userRes);
                }
            } catch (error) {
                console.error("Không tìm thấy hồ sơ chủ nhà tương ứng:", error);
            }
        }
    };

    const renderRatingStars = (rating) => {
        const validRating = rating ? Math.min(Math.max(Math.round(rating), 1), 5) : 5; 
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`post-star-icon ${i <= validRating ? 'filled-star' : 'empty-star'}`}>
                    {i <= validRating ? '★' : '☆'}
                </span>
            );
        }
        return (
            <div className="post-rating-stars-wrapper" title={`Đánh giá uy tín: ${rating || 5}/5 sao`}>
                {stars}
                <span className="post-rating-text-value">({rating ? rating.toFixed(1) : "5.0"})</span>
            </div>
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityCheckboxChange = (amenityName) => {
        setFormData(prev => {
            const current = [...prev.amenities];
            if (current.includes(amenityName)) {
                return { ...prev, amenities: current.filter(item => item !== amenityName) };
            } else {
                return { ...prev, amenities: [...current, amenityName] };
            }
        });
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleCreatePostSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        
        Object.keys(formData).forEach(key => {
            if (key === 'amenities') {
                formData.amenities.forEach(name => data.append('amenities', name));
            } else {
                data.append(key, formData[key]);
            }
        });

        selectedFiles.forEach(file => data.append('images', file));

        try {
            const res = await PostService.createPost(data);
            if (res.code === 200) {
                alert("Đã thêm bài đăng phòng thành công!");
                setIsFormModalOpen(false);
                refreshUI();
                setFormData({
                    title: '', content: '', address: '', price: '', area: '',
                    latitude: '', longitude: '', roomType: 'SINGLE_ROOM',
                    postingTier: 'NORMAL', boostingTier: 'NORMAL', amenities: []
                });
                setSelectedFiles([]);
            }
        } catch (error) {
            alert("Gặp lỗi trong quá trình xử lý tạo bài đăng.");
        }
    };

    const refreshUI = () => {
        fetchPostsData();
        fetchTabCounts();
    };

    const handleApprove = async (id) => {
        try {
            const res = await PostService.approvePost(id);
            if (res.code === 200) refreshUI();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRejectSubmit = async () => {
        try {
            const res = await PostService.rejectPost(selectedPostId);
            if (res.code === 200) {
                setIsRejectModalOpen(false);
                refreshUI();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleHide = async (id) => {
        try {
            const res = await PostService.toggleActiveHiddenPost(id);
            if (res.code === 200) refreshUI();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hành động này sẽ loại bỏ vĩnh viễn dữ liệu bài đăng. Xác nhận xóa?")) {
            try {
                const res = await PostService.deletePost(id);
                if (res.code === 200) refreshUI();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return "0 đ";
        return val.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    return (
        <div className="post-mgmt-wrapper">
            <main className="post-mgmt-main">
                
                {/* Header điều hướng */}
                <div className="post-mgmt-header">
                    <div>
                        <h1 className="post-mgmt-title">Quản Lý Kiểm Duyệt Bài Đăng</h1>
                    </div>
                    <button className="post-mgmt-btn-add" onClick={() => setIsFormModalOpen(true)}>
                        <span className="material-symbols-outlined">add_circle</span>
                        Đăng Phòng Mới
                    </button>
                </div>

                {/* Danh sách các tab */}
                <div className="post-mgmt-tabs-container">
                    <button className={`post-mgmt-tab ${currentTab === 'ALL' ? 'post-tab-active' : ''}`} onClick={() => setCurrentTab('ALL')}>
                        Tất cả bài viết <span className="post-mgmt-badge post-badge-all">{counts.all}</span>
                    </button>
                    <button className={`post-mgmt-tab ${currentTab === 'PENDING' ? 'post-tab-active' : ''}`} onClick={() => setCurrentTab('PENDING')}>
                        Chờ duyệt <span className="post-mgmt-badge post-badge-pending">{counts.pending}</span>
                    </button>
                    <button className={`post-mgmt-tab ${currentTab === 'ACTIVE' ? 'post-tab-active' : ''}`} onClick={() => setCurrentTab('ACTIVE')}>
                        Đang hiển thị <span className="post-mgmt-badge post-badge-active">{counts.active}</span>
                    </button>
                    <button className={`post-mgmt-tab ${currentTab === 'REJECTED' ? 'post-tab-active' : ''}`} onClick={() => setCurrentTab('REJECTED')}>
                        Bị từ chối <span className="post-mgmt-badge post-badge-rejected">{counts.rejected}</span>
                    </button>
                    <button className={`post-mgmt-tab ${currentTab === 'EXPIRED' ? 'post-tab-active' : ''}`} onClick={() => setCurrentTab('EXPIRED')}>
                        Hết hạn đăng <span className="post-mgmt-badge post-badge-expired">{counts.expired}</span>
                    </button>
                    <button className={`post-mgmt-tab ${currentTab === 'HIDDEN' ? 'post-tab-active' : ''}`} onClick={() => setCurrentTab('HIDDEN')}>
                        Đã ẩn <span className="post-mgmt-badge post-badge-hidden">{counts.hidden}</span>
                    </button>
                </div>

                {/* Khu vực nạp dữ liệu */}
                {loading ? (
                    <div className="post-mgmt-loading">
                        <div className="post-spinner"></div>
                        <p>Đang đồng bộ hóa dữ liệu từ hệ thống máy chủ...</p>
                    </div>
                ) : (
                    <div className="post-mgmt-grid">
                        {posts.length === 0 ? (
                            <div className="post-mgmt-empty">
                                <span className="material-symbols-outlined">folder_open</span>
                                <p>Không tìm thấy bài viết nào tương thích với danh mục bộ lọc.</p>
                            </div>
                        ) : (
                            posts.map((item) => (
                                <div className="post-card-container" key={item.id}>
                                    <div className="post-card-banner">
                                        <img 
                                            src={item.images && item.images.length > 0 ? item.images[0] : "https://via.placeholder.com/400x250?text=No+Room+Image"} 
                                            alt={item.title} 
                                            className="post-card-img" 
                                        />
                                        <span className={`post-card-status-pill post-status-${item.status?.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    
                                    <div className="post-card-body">
                                        <div className="post-card-main-info">
                                            <h3 className="post-card-heading" title={item.title}>{item.title}</h3>
                                            <p className="post-card-address">
                                                <span className="material-symbols-outlined">location_on</span>
                                                {item.address}
                                            </p>
                                            <div className="post-card-specs">
                                                <span><span className="material-symbols-outlined">square_foot</span> {item.area} m²</span>
                                                <span><span className="material-symbols-outlined">corporate_fare</span> {item.roomType}</span>
                                            </div>
                                        </div>

                                        <div className="post-card-pricing-section">
                                            <span className="post-card-amount">{formatCurrency(item.price)}</span>
                                            <span className="post-card-period">/ tháng</span>
                                        </div>

                                        <div className="post-card-actions-wrapper">
                                            <button className="post-btn-action post-action-view" onClick={() => handleOpenDetail(item)}>
                                                <span className="material-symbols-outlined">visibility</span> Chi tiết
                                            </button>

                                            {item.status === 'PENDING' && (
                                                <>
                                                    <button className="post-btn-action post-action-reject" onClick={() => { setSelectedPostId(item.id); setIsRejectModalOpen(true); }}>
                                                        <span className="material-symbols-outlined">block</span> Từ chối
                                                    </button>
                                                    <button className="post-btn-action post-action-approve" onClick={() => handleApprove(item.id)}>
                                                        <span className="material-symbols-outlined">task_alt</span> Duyệt
                                                    </button>
                                                </>
                                            )}

                                            {item.status === 'ACTIVE' && (
                                                <button className="post-btn-action post-action-hide" onClick={() => handleToggleHide(item.id)}>
                                                    <span className="material-symbols-outlined">visibility_off</span> Ẩn bài
                                                </button>
                                            )}

                                            {item.status === 'HIDDEN' && (
                                                <button className="post-btn-action post-action-show" onClick={() => handleToggleHide(item.id)}>
                                                    <span className="material-symbols-outlined">visibility</span> Hiện bài
                                                </button>
                                            )}

                                            <button className="post-btn-action post-action-delete" onClick={() => handleDelete(item.id)}>
                                                <span className="material-symbols-outlined">delete_forever</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>

            {/* MODAL 1: CHI TIẾT BÀI ĐĂNG */}
            {isDetailModalOpen && detailPost && (
                <div className="post-mgmt-modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="post-mgmt-modal-card post-modal-large-size" onClick={e => e.stopPropagation()}>
                        <div className="post-modal-header">
                            <h3>Bảng Kiểm Duyệt Nội Dung Chi Tiết</h3>
                            <button className="post-modal-close-btn" onClick={() => setIsDetailModalOpen(false)}>×</button>
                        </div>
                        <div className="post-modal-detail-content">
                            
                            <div className="post-detail-images-gallery">
                                {detailPost.images && detailPost.images.map((img, idx) => (
                                    <img key={idx} src={img} alt={`room-${idx}`} className="post-detail-gallery-img" />
                                ))}
                                {(!detailPost.images || detailPost.images.length === 0) && <p>Không tìm thấy tư liệu hình ảnh kèm theo.</p>}
                            </div>

                            <div className="post-detail-layout-grid">
                                <div className="post-detail-info-left">
                                    <h2 className="post-detail-main-title">{detailPost.title}</h2>
                                    <p className="post-detail-price-tag">Chi phí thuê: <span>{formatCurrency(detailPost.price)}</span>/tháng</p>
                                    <p className="post-detail-meta-text"><b>Địa chỉ thực tế:</b> {detailPost.address}</p>
                                    <p className="post-detail-meta-text"><b>Diện tích căn phòng:</b> {detailPost.area} m² | <b>Loại hình:</b> {detailPost.roomType}</p>
                                    
                                    <div className="post-detail-package-comparison-row">
                                        <div className="post-package-subbox">
                                            <h5>Gói đăng tin (Posting)</h5>
                                            <span className="post-package-badge-name">{detailPost.postingTier}</span>
                                            {postPackageDetail.posting ? (
                                                <div className="post-package-meta-list">
                                                    <span>Hạn dùng: {postPackageDetail.posting.activeDays} ngày</span>
                                                    <span>Hạn mức: {postPackageDetail.posting.limitQuota} bài</span>
                                                    <span>Trị giá: {formatCurrency(postPackageDetail.posting.price)}</span>
                                                </div>
                                            ) : <p className="post-package-no-data">Gói mặc định hệ thống</p>}
                                        </div>

                                        <div className="post-package-subbox">
                                            <h5>Gói đẩy bài (Boosting)</h5>
                                            <span className="post-package-badge-name-boost">{detailPost.boostingTier}</span>
                                            {postPackageDetail.boosting ? (
                                                <div className="post-package-meta-list">
                                                    <span>Hạn dùng: {postPackageDetail.boosting.activeDays} ngày</span>
                                                    <span>Trị giá: {formatCurrency(postPackageDetail.boosting.price)}</span>
                                                </div>
                                            ) : <p className="post-package-no-data">Không sử dụng gói đẩy</p>}
                                        </div>
                                    </div>

                                    <div className="post-detail-description">
                                        <h4>Nội dung mô tả căn hộ:</h4>
                                        <p>{detailPost.content}</p>
                                    </div>

                                    <div className="post-detail-amenities-section">
                                        <h4>Tiện ích sẵn có phòng cung cấp:</h4>
                                        <div className="post-detail-amenities-list">
                                            {detailPost.amenities && detailPost.amenities.map((am, i) => (
                                                <span key={i} className="post-detail-am-badge">{am.name || am}</span>
                                            ))}
                                            {(!detailPost.amenities || detailPost.amenities.length === 0) && <span>Chưa thiết lập danh mục tiện ích.</span>}
                                        </div>
                                    </div>

                                    {/* KHỐI THÔNG TIN CHỦ TRỌ (ĐÃ FIX HIỂN THỊ AVATAR VÀ ẨN TRẠNG THÁI) */}
                                    <div className="post-detail-landlord-card">
                                        <h4>Thông tin hồ sơ chủ trọ:</h4>
                                        {landlordInfo ? (
                                            <div className="post-landlord-profile-container">
                                                {landlordInfo.avatar ? (
                                                    <img 
                                                        src={landlordInfo.avatar} 
                                                        alt="Chủ trọ Avatar" 
                                                        className="post-landlord-avatar-img"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                ) : null}
                                                
                                                {/* Khung SVG Avatar dự phòng nếu không tải được URL ảnh từ DB */}
                                                <div className="post-landlord-avatar-fallback" style={{ display: landlordInfo.avatar ? 'none' : 'block' }}>
                                                    <svg viewBox="0 0 24 24">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z"/>
                                                    </svg>
                                                </div>

                                                <div className="post-landlord-text-details">
                                                    <p className="post-landlord-username-row">
                                                        <b>Chủ hộ:</b> {landlordInfo.username || "Chưa cập nhật"}
                                                        {landlordInfo.verified && (
                                                            <span className="material-symbols-outlined post-icon-verified" title="Tài khoản đối tác tin cậy">
                                                                verified
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p><b>Hộp thư điện tử:</b> {landlordInfo.email || "Không công khai"}</p>
                                                    <p><b>Số điện thoại liên lạc:</b> {landlordInfo.phone || "Không khả dụng"}</p>
                                                    
                                                    <div className="post-landlord-star-rating-block">
                                                        <span className="rating-label-title">Đánh giá tín nhiệm:</span>
                                                        {renderRatingStars(landlordInfo.rating)}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="post-mini-loading">Đang tải hồ sơ định danh của chủ trọ...</p>
                                        )}
                                    </div>
                                </div>

                                {/* Khối hiển thị bản đồ độc lập (Đã ẩn Text vĩ độ kinh độ) */}
                                <div className="post-detail-map-right">
                                    <h4>Tọa độ vị trí địa lý thực tế:</h4>
                                    <div 
                                        id="post-leaflet-map-container" 
                                        ref={mapContainerRef}
                                        className="post-leaflet-map-frame"
                                    ></div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: TẠO MỚI BÀI ĐĂNG */}
            {isFormModalOpen && (
                <div className="post-mgmt-modal-overlay" onClick={() => setIsFormModalOpen(false)}>
                    <div className="post-mgmt-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="post-modal-header">
                            <h3>Khởi tạo bài đăng cho thuê mới</h3>
                            <button className="post-modal-close-btn" onClick={() => setIsFormModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleCreatePostSubmit} className="post-modal-form">
                            <input type="text" name="title" placeholder="Tiêu đề bài viết..." required onChange={handleInputChange} className="post-field-input" />
                            <input type="text" name="address" placeholder="Vị trí địa chỉ căn hộ..." required onChange={handleInputChange} className="post-field-input" />
                            
                            <div className="post-field-flex-row">
                                <input type="number" name="price" placeholder="Mức giá thuê phòng (VNĐ)" required onChange={handleInputChange} className="post-field-input" />
                                <input type="number" name="area" placeholder="Diện tích mặt sàn (m²)" required onChange={handleInputChange} className="post-field-input" />
                            </div>

                            <div className="post-field-flex-row">
                                <input type="number" step="any" name="latitude" placeholder="Vĩ độ (Latitude) VD: 10.7626" required onChange={handleInputChange} className="post-field-input" />
                                <input type="number" step="any" name="longitude" placeholder="Kinh độ (Longitude) VD: 106.6601" required onChange={handleInputChange} className="post-field-input" />
                            </div>

                            <div className="post-field-flex-row">
                                <select name="roomType" onChange={handleInputChange} className="post-field-input">
                                    <option value="SINGLE_ROOM">Phòng đơn tiêu chuẩn</option>
                                    <option value="APARTMENT">Chung cư mini dịch vụ</option>
                                    <option value="HOMESTAY">Nhà nguyên căn / Homestay</option>
                                </select>
                                <select name="postingTier" onChange={handleInputChange} className="post-field-input">
                                    <option value="NORMAL">Gói Thường (NORMAL)</option>
                                    <option value="PRO">Gói Tin PRO (PRO)</option>
                                </select>
                            </div>

                            <textarea name="content" placeholder="Mô tả chi tiết phòng..." required onChange={handleInputChange} className="post-field-textarea"></textarea>

                            <div className="post-form-amenities-wrapper">
                                <label className="post-form-section-title">Cấu hình danh mục tiện nghi:</label>
                                <div className="post-form-amenities-grid">
                                    {systemAmenities.map((am) => (
                                        <label key={am.id} className="post-form-checkbox-label">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.amenities.includes(am.name)}
                                                onChange={() => handleAmenityCheckboxChange(am.name)} 
                                            />
                                            <span>{am.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="post-upload-box">
                                <span className="material-symbols-outlined">cloud_upload</span>
                                <label>Nhấp để tải lên bộ ảnh căn hộ</label>
                                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                            </div>

                            <div className="post-modal-footer-actions">
                                <button type="button" className="post-modal-btn-back" onClick={() => setIsFormModalOpen(false)}>Quay lại</button>
                                <button type="submit" className="post-modal-btn-submit">Phát hành ngay</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: TỪ CHỐI BÀI */}
            {isRejectModalOpen && (
                <div className="post-mgmt-modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
                    <div className="post-mgmt-modal-card post-modal-small-size" onClick={e => e.stopPropagation()}>
                        <div className="post-modal-header">
                            <h3>Xác thực từ chối bài</h3>
                        </div>
                        <p className="post-modal-warning-text">Hệ thống sẽ chuyển trạng thái bài viết này thành Không Phê Duyệt?</p>
                        <div className="post-modal-footer-actions">
                            <button className="post-modal-btn-back" onClick={() => setIsRejectModalOpen(false)}>Hủy</button>
                            <button className="post-modal-btn-danger" onClick={handleRejectSubmit}>Đồng ý hủy bỏ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManagement;