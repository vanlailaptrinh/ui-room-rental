import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostService from '../../../../services/postService';
import { FiEdit2, FiTrash2, FiMapPin, FiEye } from 'react-icons/fi';
import './PostManagementTab.css'

const PostManagementTab = ({ activeTab }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    // States cho Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [currentImages, setCurrentImages] = useState([]);

    useEffect(() => {
        if (activeTab === 'listings') {
            const fetchPosts = async () => {
                setLoading(true);
                try {
                    const res = await PostService.getMyPosts();
                    console.log("DỮ LIỆU BÀI ĐĂNG TỪ API:", res.data);
                    if (res?.code === 200) setListings(res.data);
                } catch (err) {
                    console.error("Lỗi:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPosts();
        }
    }, [activeTab]);

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

    // Theo dõi thay đổi text input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingPost(prev => ({ ...prev, [name]: value }));
    };

    // Thêm ảnh mới
    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...filesArray]);
        }
    };

    // Xóa ảnh cũ (server)
    const handleRemoveCurrentImg = (indexToRemove) => {
        setCurrentImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Xóa ảnh mới (chưa upload)
    const handleRemoveNewImg = (indexToRemove) => {
        setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Submit form
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', editingPost.title || '');
            formData.append('address', editingPost.address || '');
            formData.append('price', editingPost.price || 0);
            formData.append('area', editingPost.area || '');
            formData.append('description', editingPost.description || '');
            // Gửi mảng ảnh cũ còn giữ lại
            formData.append('remainImages', JSON.stringify(currentImages));
            // Đính kèm các file ảnh mới
            newImages.forEach(file => formData.append('images', file));

            const res = await PostService.updatePost(editingPost.id, formData);

            // Cập nhật lại UI sau khi sửa thành công
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

    const getPackageDetails = (type, tier) => {
        // Chuẩn hóa chuỗi về chữ in hoa để tránh sai sót viết hoa/thường từ DB
        const packageType = type?.toUpperCase() || '';
        const packageTier = tier?.toUpperCase() || '';

        // 1. Trường hợp gói ĐĂNG TIN (POST)
        if (packageType === 'POST' || packageType.includes('ĐĂNG TIN')) {
            if (packageTier === 'PRO') {
                return { text: 'Đăng tin PRO', className: 'badge-post-pro' };
            }
            return { text: 'Đăng tin Thường', className: 'badge-post-normal' };
        }

        // 2. Trường hợp gói ĐẨY TIN (BOOST)
        if (packageType === 'BOOST' || packageType.includes('ĐẨY TIN')) {
            if (packageTier === 'PRO') {
                return { text: 'Đẩy tin PRO', className: 'badge-boost-pro' };
            }
            return { text: 'Đẩy tin Thường', className: 'badge-boost-normal' };
        }

        // Dự phòng: Nếu backend trả về cấu trúc khác hoặc chưa có gói
        return {
            text: packageTier ? `${packageType} ${packageTier}` : 'Gói thường',
            className: 'badge-package-normal'
        };
    };

    return (
        <section className="landlord-card landlord-full-width landlord-fade-in">
            <div className="landlord-section-header">
                <div className="header-left">
                    <h3>Danh sách tin đăng</h3>
                    <span className="landlord-ld-count-badge">{listings.length} tin</span>
                </div>
                <Link to='/post' className="landlord-btn-primary-small">+ Đăng tin mới</Link>
            </div>

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
                    {/* Tăng colSpan lên 8 để không bị lệch giao diện khi load/trống */}
                    {loading ? <tr><td colSpan="8" style={{textAlign: 'center'}}>Đang tải...</td></tr> : listings.length === 0 ? (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Bạn chưa có bài đăng nào.</td></tr>
                    ) : listings.map((item) => (
                        <tr key={item.id}>
                            <td><img src={item.imageUrl || item.image || (Array.isArray(item.images) && item.images[0]) || "https://placehold.co/80x60?text=No+Image"} alt="room" style={{width: 80, height: 60, objectFit: 'cover', borderRadius: 4}} /></td>
                            <td>
                                <div style={{ fontWeight: 'bold' }}>{item.title || "Chưa có tiêu đề"}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '13px', marginTop: '4px' }}>
                                    <FiMapPin size={14} /> {item.address ? (item.address.split(',')[0] + ', ' + item.address.split(',').slice(-2)[0]?.trim()) : 'Chưa cập nhật'}
                                </div>
                            </td>
                            <td>{item.price ? `${(item.price / 1000000).toFixed(1)}tr` : 'Liên hệ'}/tháng</td>
                            <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiEye /> {item.views || 0}</div></td>
                            <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>

                            {/* HIỂN THỊ GÓI TIN TẠI ĐÂY */}
                            <td>
                                {(() => {
                                    // 1. Lấy dữ liệu từ API của bạn
                                    const boostingTier = item.boostingTier;

                                    // Đoán trường đăng tin còn lại (bạn kiểm tra trong dấu ... xem là 'tier' hay 'postingTier' nhé)
                                    const postingTier = item.tier || item.postingTier || 'NORMAL';

                                    // 2. Logic phân loại để hiển thị
                                    let packageText = 'Gói NORMAL';
                                    let packageClass = 'badge-package-normal';

                                    // TRƯỜNG HỢP 1: Nếu có gói ĐẨY TIN (boostingTier không phải null)
                                    if (boostingTier) {
                                        if (boostingTier.toUpperCase() === 'PRO') {
                                            packageText = 'Đẩy tin PRO';
                                            packageClass = 'badge-boost-pro';
                                        } else {
                                            packageText = 'Đẩy tin NORMAL';
                                            packageClass = 'badge-boost-normal';
                                        }
                                    }
                                    // TRƯỜNG HỢP 2: Nếu không đẩy tin (boostingTier = null), hiển thị theo gói ĐĂNG TIN
                                    else {
                                        if (postingTier.toUpperCase() === 'PRO') {
                                            packageText = 'Đăng tin PRO';
                                            packageClass = 'badge-post-pro';
                                        } else {
                                            packageText = 'Đăng tin NORMAL';
                                            packageClass = 'badge-post-normal';
                                        }
                                    }

                                    return (
                                        <span className={`landlord-package-badge ${packageClass}`}>
                                            {packageText}
                                        </span>
                                    );
                                })()}
                            </td>

                            <td><span className={`landlord-status-dot ${item.status === 'ACTIVE' || item.status === 'Đang hiển thị' ? 'active' : 'inactive'}`}>{item.status || 'Chờ duyệt'}</span></td>
                            <td style={{ textAlign: 'right' }}>
                                <button className="landlord-list-btn-action edit" onClick={() => handleEditClick(item)}><FiEdit2 size={20}/></button>
                                <button className="landlord-list-btn-action delete" onClick={() => handleDelete(item.id)}><FiTrash2 size={20}/></button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL EDIT */}
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

                                {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                                <div className="modal-column-left">
                                    <div className="form-group">
                                        <label>Tiêu đề bài đăng</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={editingPost.title || ''}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Địa chỉ chi tiết</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={editingPost.address || ''}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-row-2col">
                                        <div className="form-group">
                                            <label>Giá thuê (VND / tháng)</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={editingPost.price || ''}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <small className="price-preview">
                                                {editingPost.price ? `➔ ${(editingPost.price / 1000000).toFixed(1)} triệu/tháng` : '➔ Chưa nhập giá'}
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label>Diện tích (m²)</label>
                                            <input
                                                type="number"
                                                name="area"
                                                value={editingPost.area || ''}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Mô tả chi tiết phòng trọ</label>
                                        <textarea
                                            name="description"
                                            rows="4"
                                            value={editingPost.description || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* CỘT PHẢI: QUẢN LÝ NHIỀU HÌNH ẢNH */}
                                <div className="modal-column-right">
                                    <div className="form-group images-management-section">
                                        <label>Danh sách hình ảnh phòng</label>

                                        {/* Khu vực hiển thị lưới các ảnh */}
                                        <div className="images-preview-grid">

                                            {/* 1. Render các ảnh cũ từ server */}
                                            {currentImages.map((url, idx) => (
                                                <div className="img-thumb-container" key={`current-${idx}`}>
                                                    <img src={url} alt="Room current" />
                                                    <button
                                                        type="button"
                                                        className="btn-remove-thumb"
                                                        onClick={() => handleRemoveCurrentImg(idx)}
                                                        title="Xóa ảnh này"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}

                                            {/* 2. Render các ảnh mới chọn dưới máy local */}
                                            {newImages.map((file, idx) => (
                                                <div className="img-thumb-container new-upload" key={`new-${idx}`}>
                                                    <img src={URL.createObjectURL(file)} alt="Room new" />
                                                    <button
                                                        type="button"
                                                        className="btn-remove-thumb"
                                                        onClick={() => handleRemoveNewImg(idx)}
                                                        title="Xóa ảnh này"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Hiện thông báo nếu bài đăng trống ảnh */}
                                            {currentImages.length === 0 && newImages.length === 0 && (
                                                <div className="no-img-placeholder">
                                                    Chưa có hình ảnh nào.
                                                </div>
                                            )}
                                        </div>

                                        {/* Nút bấm thêm ảnh thiết kế mỏng gọn */}
                                        <label className="custom-file-upload-btn">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple // Cho phép chọn một lúc nhiều tấm ảnh
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            ➕ Thêm hình ảnh
                                        </label>
                                    </div>
                                </div>

                            </div>

                            {/* THANH THAO TÁC Ở ĐÁY */}
                            <div className="landlord-modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Hủy bỏ
                                </button>
                                <button type="submit" className="postr-btn-submit">
                                    Lưu toàn bộ thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PostManagementTab;