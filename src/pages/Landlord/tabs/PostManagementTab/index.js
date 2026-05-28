import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PostService from '../../../../services/postService';
import { FiEdit2, FiTrash2, FiMapPin, FiEye } from 'react-icons/fi';
import './PostManagementTab.css';
import LandlordFilterBar from '../../components/LandlordFilterBar';

const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN');
};

const PostManagementTab = ({ activeTab }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // States cho Bộ lọc tìm kiếm
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('newest');

    // States cho Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [currentImages, setCurrentImages] = useState([]);

    // Cấu hình danh sách Trạng thái & Sắp xếp riêng cho Tin Đăng
    const statusOptions = [
        { value: 'ALL', label: 'Tất cả tin đăng' },
        { value: 'ACTIVE', label: '🟢 Đang hiển thị' },
        { value: 'PENDING', label: '⏳ Chờ duyệt' },
        { value: 'BOOST_PRO', label: '🚀 Gói Đẩy tin PRO' },
        { value: 'POST_PRO', label: '⭐ Gói Đăng tin PRO' },
    ];

    const sortOptions = [
        { value: 'newest', label: '🗓️ Tin đăng mới nhất' },
        { value: 'oldest', label: '🗓️ Tin đăng cũ nhất' },
        { value: 'viewsDesc', label: '🔥 Lượt xem nhiều nhất' },
    ];

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await PostService.getMyPosts();
            if (res?.code === 200) setListings(res.data || []);
        } catch (err) {
            console.error("Lỗi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'listings') {
            fetchPosts();
        }
    }, [activeTab, fetchPosts]);

    // Xử lý bộ lọc tìm kiếm và sắp xếp dữ liệu động
    const filteredAndSortedListings = useMemo(() => {
        return listings
            .filter((item) => {
                // 1. Lọc theo từ khóa (Tiêu đề hoặc Địa chỉ)
                const title = (item.title || '').toLowerCase();
                const address = (item.address || '').toLowerCase();
                const keyword = searchTerm.toLowerCase().trim();
                const matchKeyword = title.includes(keyword) || address.includes(keyword);

                // 2. Lọc theo trạng thái và gói tin nâng cao
                const itemStatus = (item.status || '').toUpperCase();
                const boostingTier = (item.boostingTier || '').toUpperCase();
                const postingTier = (item.tier || item.postingTier || 'NORMAL').toUpperCase();

                let matchStatus = true;
                if (filterStatus === 'ACTIVE') {
                    matchStatus = itemStatus === 'ACTIVE' || itemStatus === 'ĐANG HIỂN THỊ';
                } else if (filterStatus === 'PENDING') {
                    matchStatus = itemStatus === 'PENDING' || itemStatus === 'CHỜ DUYỆT';
                } else if (filterStatus === 'BOOST_PRO') {
                    matchStatus = boostingTier === 'PRO';
                } else if (filterStatus === 'POST_PRO') {
                    matchStatus = !boostingTier && postingTier === 'PRO';
                }

                return matchKeyword && matchStatus;
            })
            .sort((a, b) => {
                if (sortBy === 'newest' || sortBy === 'oldest') {
                    const timeA = new Date(a.createdAt || 0).getTime();
                    const timeB = new Date(b.createdAt || 0).getTime();
                    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
                }
                if (sortBy === 'viewsDesc') {
                    return (b.views || 0) - (a.views || 0);
                }
                return 0;
            });
    }, [listings, searchTerm, filterStatus, sortBy]);

    // Mở modal và nạp dữ liệu ảnh cũ
    const handleEditClick = (post) => {
        setEditingPost({ ...post });
        setNewImages([]);
        let imagesArray = [];
        if (Array.isArray(post.images)) {
            imagesArray = post.images.map(img => typeof img === 'string' ? img : img.url);
        } else if (post.imageUrl) {
            imagesArray = [post.imageUrl];
        } else if (post.image) {
            imagesArray = [post.image];
        }

        setCurrentImages(imagesArray.filter(Boolean));
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingPost(null);
        setNewImages([]);
        setCurrentImages([]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingPost(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...filesArray]);
        }
    };

    const handleRemoveCurrentImg = (indexToRemove) => {
        setCurrentImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveNewImg = (indexToRemove) => {
        setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', editingPost.title || '');
            formData.append('address', editingPost.address || '');
            formData.append('price', editingPost.price || 0);
            formData.append('area', editingPost.area || '');
            formData.append('description', editingPost.description || '');
            formData.append('remainImages', JSON.stringify(currentImages));
            newImages.forEach(file => formData.append('images', file));

            const res = await PostService.updatePost(editingPost.id, formData);

            setListings(prev => prev.map(item => item.id === editingPost.id ? {
                ...item,
                ...editingPost,
                images: res?.images || currentImages,
                imageUrl: res?.imageUrl || currentImages[0]
            } : item));

            alert("Cập nhật thành công!");
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi cập nhật.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;
        try {
            await PostService.deletePost(id);
            setListings(prev => prev.filter(item => item.id !== id));
            alert("Xóa thành công!");
        } catch (error) {
            alert("Lỗi khi xóa bài đăng.");
        }
    };

    return (
        <section className="landlord-card landlord-full-width landlord-fade-in listing-unified-form">

            {/* Tiêu đề chính */}
            <div className="unified-form-header">
                <div className="header-left">
                    <h3>Danh sách tin đăng</h3>
                    <span className="landlord-ld-count-badge">{filteredAndSortedListings.length} tin</span>
                </div>
                <Link to='/post' className="landlord-btn-primary-small">+ Đăng tin mới</Link>
            </div>

            {/* Khối thanh bộ lọc nhúng phẳng liền mạch */}
            <div className="unified-filter-wrapper">
                <LandlordFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="🔍 Tìm theo tiêu đề bài đăng, địa chỉ..."
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    statusOptions={statusOptions}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOptions={sortOptions}
                />
            </div>

            {/* Bảng danh sách bài đăng */}
            <div className="unified-list-container">
                <div className="landlord-table-responsive">
                    <table className="landlord-table">
                        <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Thông tin phòng</th>
                            <th>Giá thuê</th>
                            <th>Lượt xem</th>
                            <th>Ngày đăng</th>
                            <th>Gói tin</th>
                            <th>Trạng thái</th>
                            <th style={{ textAlign: 'right' }}>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="listing-table-center-td">
                                    <div className="landlord-ld-spinner" />
                                    <div style={{ marginTop: 8 }}>Đang tải danh sách bài đăng...</div>
                                </td>
                            </tr>
                        ) : filteredAndSortedListings.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="listing-table-center-td">
                                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>📋</div>
                                    <div style={{ color: '#64748b' }}>
                                        {listings.length === 0 ? "Bạn chưa có bài đăng nào." : "Không có bài đăng nào khớp với bộ lọc."}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedListings.map((item) => {
                                const boostingTier = (item.boostingTier || '').toUpperCase();
                                const postingTier = (item.tier || item.postingTier || 'NORMAL').toUpperCase();

                                let packageText = 'Tin Thường';
                                let packageClass = 'badge-post-normal';

                                if (boostingTier === 'PRO') {
                                    packageText = 'Đẩy tin PRO';
                                    packageClass = 'badge-boost-pro';
                                } else if (boostingTier === 'NORMAL') {
                                    packageText = 'Đẩy tin Thường';
                                    packageClass = 'badge-boost-normal';
                                } else if (postingTier === 'PRO') {
                                    packageText = 'Đăng tin PRO';
                                    packageClass = 'badge-post-pro';
                                }

                                const isActive = item.status === 'ACTIVE' || item.status === 'Đang hiển thị';

                                return (
                                    <tr key={item.id} className={`listing-row-status-${isActive ? 'active' : 'inactive'}`}>
                                        {/* Cột Ảnh */}
                                        <td className="col-img-td">
                                            <img
                                                src={item.imageUrl || item.image || (Array.isArray(item.images) && item.images[0]) || "https://placehold.co/80x60?text=No+Image"}
                                                alt="room"
                                                className="listing-thumb-img"
                                            />
                                        </td>

                                        {/* Cột Chi tiết phòng */}
                                        <td>
                                            <div className="listing-room-title">{item.title || "Chưa có tiêu đề"}</div>
                                            <div className="listing-address-row">
                                                <FiMapPin size={13} />
                                                <span>
                                                        {item.address ? (item.address.split(',')[0] + ', ' + item.address.split(',').slice(-2)[0]?.trim()) : 'Chưa cập nhật'}
                                                    </span>
                                            </div>
                                        </td>

                                        {/* Cột Giá */}
                                        <td className="listing-price-cell">
                                            {item.price ? `${(item.price / 1000000).toFixed(1)}tr` : 'Liên hệ'}/tháng
                                        </td>

                                        {/* Cột Lượt xem */}
                                        <td>
                                            <div className="listing-views-row"><FiEye /> {item.views || 0}</div>
                                        </td>

                                        {/* Cột Ngày đăng */}
                                        <td className="listing-date-cell">{fmtDate(item.createdAt)}</td>

                                        {/* Cột Gói tin */}
                                        <td>
                                                <span className={`landlord-package-badge ${packageClass}`}>
                                                    {packageText}
                                                </span>
                                        </td>

                                        {/* Cột Trạng thái */}
                                        <td>
                                                <span className={`landlord-status-dot ${isActive ? 'active' : 'inactive'}`}>
                                                    {item.status || 'Chờ duyệt'}
                                                </span>
                                        </td>

                                        {/* Thao tác */}
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="listing-action-group">
                                                <button className="landlord-list-btn-action edit" onClick={() => handleEditClick(item)} title="Chỉnh sửa">
                                                    <FiEdit2 size={18}/>
                                                </button>
                                                <button className="landlord-list-btn-action delete" onClick={() => handleDelete(item.id)} title="Xóa bài">
                                                    <FiTrash2 size={18}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL EDIT GIỮ NGUYÊN HOÀN TOÀN LOGIC CŨ CỦA BẠN */}
            {isEditModalOpen && editingPost && (
                <div className="landlord-modal-overlay" onClick={handleCloseModal}>
                    <div className="landlord-modal-container layout-large" onClick={(e) => e.stopPropagation()}>
                        <div className="landlord-modal-header">
                            <div>
                                <h3>Chỉnh sửa chi tiết tin đăng</h3>
                                <p className="modal-subtitle">Cập nhật đầy đủ thông tin và hình ảnh phòng trọ</p>
                            </div>
                            <button className="landlord-modal-close" onClick={handleCloseModal}>&times;</button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="landlord-modal-form scrollable-form">
                            <div className="modal-grid-layout">
                                <div className="modal-column-left">
                                    <div className="form-group">
                                        <label>Tiêu đề bài đăng</label>
                                        <input type="text" name="title" value={editingPost.title || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Địa chỉ chi tiết</label>
                                        <input type="text" name="address" value={editingPost.address || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Giá thuê (VND / tháng)</label>
                                            <input type="number" name="price" value={editingPost.price || ''} onChange={handleInputChange} required />
                                            <small className="price-preview">
                                                {editingPost.price ? `➔ ${(editingPost.price / 1000000).toFixed(1)} triệu/tháng` : '➔ Chưa nhập giá'}
                                            </small>
                                        </div>
                                        <div className="form-group">
                                            <label>Diện tích (m²)</label>
                                            <input type="number" name="area" value={editingPost.area || ''} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Mô tả chi tiết phòng trọ</label>
                                        <textarea name="description" rows="4" value={editingPost.description || ''} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="modal-column-right">
                                    <div className="form-group images-management-section">
                                        <label>Danh sách hình ảnh phòng</label>
                                        <div className="images-preview-grid">
                                            {currentImages.map((url, idx) => (
                                                <div className="img-thumb-container" key={`current-${idx}`}>
                                                    <img src={url} alt="Room current" />
                                                    <button type="button" className="btn-remove-thumb" onClick={() => handleRemoveCurrentImg(idx)}>&times;</button>
                                                </div>
                                            ))}
                                            {newImages.map((file, idx) => (
                                                <div className="img-thumb-container new-upload" key={`new-${idx}`}>
                                                    <img src={URL.createObjectURL(file)} alt="Room new" />
                                                    <button type="button" className="btn-remove-thumb" onClick={() => handleRemoveNewImg(idx)}>&times;</button>
                                                </div>
                                            ))}
                                            {currentImages.length === 0 && newImages.length === 0 && (
                                                <div className="no-img-placeholder">Chưa có hình ảnh nào.</div>
                                            )}
                                        </div>
                                        <label className="custom-file-upload-btn">
                                            <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                                            ➕ Thêm hình ảnh
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="landlord-modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Hủy bỏ</button>
                                <button type="submit" className="postr-btn-submit">Lưu toàn bộ thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PostManagementTab;