import React, { useState, useEffect } from 'react';
import './PackageManagement.css';
import PackageService from '../../../services/packageService';

function PackageManagement() {
    // 1. Quản lý States dữ liệu hệ thống
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States lưu danh sách Enum đổ từ Backend về cho các thẻ <select>
    const [packageTypes, setPackageTypes] = useState([]);
    const [packageTiers, setPackageTiers] = useState([]);
    
    // 2 Bộ lọc danh sách song song hiển thị ở giao diện
    const [filterType, setFilterType] = useState('Tất cả loại');
    const [filterTier, setFilterTier] = useState('Tất cả cấp độ');

    // States phục vụ cho việc Thêm mới & Sửa đổi (CRUD Form)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPackageId, setEditingPackageId] = useState(null); // null = Thêm mới, có ID = Đang sửa
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        tier: '',
        limitQuota: 10,
        activeDays: 30,
        price: 0
    });

    // Tải toàn bộ dữ liệu khi component mount
    useEffect(function() {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        try {
            // Gọi song song danh sách packages và các cấu hình Enums từ backend
            const [resPackages, resTypes, resTiers] = await Promise.all([
                PackageService.getPackages(),
                PackageService.getPackageTypes(),
                PackageService.getPackageTiers()
            ]);

            if (resPackages && resPackages.code === 200) setPackages(resPackages.data);
            if (resTypes && resTypes.code === 200) setPackageTypes(resTypes.data);
            if (resTiers && resTiers.code === 200) setPackageTiers(resTiers.data);

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu hệ thống:", error);
        } finally {
            setLoading(false);
        }
    }

    // Làm mới riêng danh sách bảng dữ liệu
    function refreshPackages() {
        setLoading(true);
        PackageService.getPackages()
            .then(function(res) {
                if (res && res.code === 200) setPackages(res.data);
                setLoading(false);
            })
            .catch(function(err) {
                console.error(err);
                setLoading(false);
            });
    }

    // [CREATE & UPDATE] - Xử lý gửi Form (Lưu cấu hình dữ liệu)
    function handleSavePackage(e) {
        e.preventDefault();

        const payload = {
            name: formData.name,
            type: formData.type,
            tier: formData.tier,
            limitQuota: Number(formData.limitQuota),
            activeDays: Number(formData.activeDays),
            price: Number(formData.price)
        };

        if (editingPackageId) {
            PackageService.updatePackage(editingPackageId, payload)
                .then(function() {
                    alert("Cập nhật gói dịch vụ thành công!");
                    closeForm();
                    refreshPackages();
                })
                .catch(function() { alert("Lỗi khi cập nhật gói dịch vụ."); });
        } else {
            PackageService.createPackage(payload)
                .then(function() {
                    alert("Tạo mới gói dịch vụ thành công!");
                    closeForm();
                    refreshPackages();
                })
                .catch(function() { alert("Lỗi khi tạo gói dịch vụ."); });
        }
    }

    // [DELETE] - Xóa vĩnh viễn gói dịch vụ
    function handleDeletePackage(id) {
        if (window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn xóa VĨNH VIỄN gói dịch vụ này không? Hành động này không thể hoàn tác.")) {
            PackageService.deletePackage(id)
                .then(function() {
                    alert("Đã xóa gói dịch vụ thành công.");
                    refreshPackages();
                })
                .catch(function() { alert("Lỗi khi thực hiện xóa."); });
        }
    }

    // ==========================================
    // 3. Hàm bổ trợ giao diện (UI Helpers)
    // ==========================================
    function openAddForm() {
        setEditingPackageId(null);
        setFormData({
            name: '',
            type: packageTypes[0]?.value || 'POSTING',
            tier: packageTiers[0]?.value || 'NORMAL',
            limitQuota: 10,
            activeDays: 30,
            price: 50000
        });
        setIsFormOpen(true);
    }

    function openEditForm(pkg) {
        setEditingPackageId(pkg.id);
        setFormData({
            name: pkg.name,
            type: pkg.type?.value || '', 
            tier: pkg.tier?.value || '',
            limitQuota: pkg.limitQuota,
            activeDays: pkg.activeDays,
            price: pkg.price
        });
        setIsFormOpen(true);
    }

    function closeForm() {
        setIsFormOpen(false);
        setEditingPackageId(null);
    }

    // Hàm chuyển đổi nhãn hiển thị trực quan Tiếng Việt cho Enums
    function getTypeLabel(typeValue) {
        if (typeValue === 'POSTING') return 'Đăng tin';
        if (typeValue === 'BOOSTING') return 'Đẩy tin';
        return typeValue;
    }

    function getTierLabel(tierValue) {
        if (tierValue === 'NORMAL') return 'Phổ thông (Normal)';
        if (tierValue === 'PRO') return 'Nâng cao (Pro VIP)';
        return tierValue;
    }

    // Thực hiện lọc đồng thời cả 2 bộ lọc Loại (Type) và Cấp độ (Tier)
    const filteredPackages = packages.filter(function(pkg) {
        const matchType = filterType === 'Tất cả loại' || pkg.type?.value === filterType;
        const matchTier = filterTier === 'Tất cả cấp độ' || pkg.tier?.value === filterTier;
        return matchType && matchTier;
    });

    // Thống kê số lượng động theo tiêu chí nghiệp vụ mới
    const totalPackages = packages.length;
    const postingCount = packages.filter(p => p.type?.value === 'POSTING').length;
    const boostingCount = packages.filter(p => p.type?.value === 'BOOSTING').length;

    return (
        <div className="package-admin-wrapper">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Quản lý Gói Dịch Vụ</h2>
                    <p className="page-subtitle">Cấu hình hệ thống gói Đăng tin (POSTING) và Đẩy tin (BOOSTING) phân tầng cấp độ NORMAL / PRO.</p>
                </div>
                <button className="btn-primary" onClick={openAddForm}>
                    <span className="material-symbols-outlined">add_box</span>
                    Tạo Gói Mới
                </button>
            </div>

            {/* Form Thêm/Sửa (CRUD Form) */}
            {isFormOpen && (
                <div className="form-container-card">
                    <h3>{editingPackageId ? `Cập nhật cấu hình gói (ID: ${editingPackageId.substring(0,8)}...)` : 'Cấu hình gói dịch vụ mới'}</h3>
                    <form onSubmit={handleSavePackage} className="package-crud-form">
                        <div className="form-group-full">
                            <label>Tên gói dịch vụ</label>
                            <input type="text" required placeholder="Ví dụ: Gói POSTING PRO Đăng 30 tin"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label>Loại dịch vụ (Type)</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                                <option value="" disabled>-- Chọn loại --</option>
                                {packageTypes.map(t => (
                                    <option key={t.value} value={t.value}>{getTypeLabel(t.value)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Cấp độ phân tầng (Tier)</label>
                            <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} required>
                                <option value="" disabled>-- Chọn cấp độ --</option>
                                {packageTiers.map(t => (
                                    <option key={t.value} value={t.value}>{getTierLabel(t.value)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Hạn mức lượt thực hiện (Quota)</label>
                            <input type="number" required min="1"
                                value={formData.limitQuota} onChange={e => setFormData({...formData, limitQuota: e.target.value})} />
                        </div>
                        <div>
                            <label>Số ngày hoạt động (Hạn dùng)</label>
                            <input type="number" required min="1"
                                value={formData.activeDays} onChange={e => setFormData({...formData, activeDays: e.target.value})} />
                        </div>
                        <div className="form-group-full">
                            <label>Giá tiền cấu hình (VNĐ)</label>
                            <input type="number" required min="0" placeholder="Nhập số tiền đơn vị VNĐ"
                                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={closeForm}>Hủy bỏ</button>
                            <button type="submit" className="btn-submit">Lưu cấu hình</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Statistics Grid */}
            <div className="stats-grid">
                <div className="stat-card card-total">
                    <div className="stat-content">
                        <p className="stat-label">Tổng số gói dịch vụ</p>
                        <h3 className="stat-value text-primary">{totalPackages}</h3>
                        <div className="stat-trend text-secondary">
                            <span className="material-symbols-outlined">layers</span>
                            <span>Đồng bộ từ Database</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined stat-bg-icon text-primary">inventory_2</span>
                </div>

                <div className="stat-card card-posting">
                    <div className="stat-content">
                        <p className="stat-label">Cấu hình Gói Đăng Tin (POSTING)</p>
                        <h3 className="stat-value text-posting">{postingCount}</h3>
                        <div className="stat-trend text-posting">
                            <span className="material-symbols-outlined">post_add</span>
                            <span>Hạn mức đăng bài mới</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card card-boosting">
                    <div className="stat-content">
                        <p className="stat-label">Cấu hình Gói Đẩy Tin (BOOSTING)</p>
                        <h3 className="stat-value text-boosting">{boostingCount}</h3>
                        <div className="stat-trend text-boosting">
                            <span className="material-symbols-outlined">rocket_launch</span>
                            <span>Hạn mức làm mới tin lên đầu trang</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
                <div className="table-controls">
                    <div className="filters-group">
                        {/* Bộ lọc 1: Loại gói */}
                        <div className="custom-select">
                            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                                <option>Tất cả loại</option>
                                {packageTypes.map(t => (
                                    <option key={t.value} value={t.value}>{getTypeLabel(t.value)}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined select-icon">keyboard_arrow_down</span>
                        </div>

                        {/* Bộ lọc 2: Cấp độ gói */}
                        <div className="custom-select">
                            <select value={filterTier} onChange={e => setFilterTier(e.target.value)}>
                                <option>Tất cả cấp độ</option>
                                {packageTiers.map(t => (
                                    <option key={t.value} value={t.value}>{getTierLabel(t.value)}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined select-icon">keyboard_arrow_down</span>
                        </div>
                    </div>
                    
                    <div className="actions">
                        <button className="icon-btn-filter" title="Làm mới dữ liệu" onClick={refreshPackages}>
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-text">
                        Đang đồng bộ cấu hình dịch vụ từ API Server...
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="package-table">
                            <thead>
                                <tr>
                                    <th>Mã định danh</th>
                                    <th>Tên gói cấu hình</th>
                                    <th>Loại gói (Type)</th>
                                    <th>Cấp độ (Tier)</th>
                                    <th className="text-right">Hạn mức (Quota)</th>
                                    <th className="text-right">Thời hạn dùng</th>
                                    <th className="text-right">Đơn giá</th>
                                    <th className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPackages.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="empty-row">
                                            Không tìm thấy gói dịch vụ nào khớp với bộ lọc hiện tại.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPackages.map(function(pkg) {
                                        return (
                                            <tr key={pkg.id}>
                                                <td className="id-cell">
                                                    #{pkg.id.substring(0, 8).toUpperCase()}
                                                </td>
                                                <td style={{ fontWeight: '600', color: '#0f172a' }}>
                                                    {pkg.name}
                                                </td>
                                                <td>
                                                    <span className={`badge-type-tag type-${(pkg.type?.value || '').toLowerCase()}`}>
                                                        <span className="material-symbols-outlined type-icon">
                                                            {pkg.type?.value === 'POSTING' ? 'post_add' : 'rocket_launch'}
                                                        </span>
                                                        {getTypeLabel(pkg.type?.value)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`tier-tag tier-${(pkg.tier?.value || '').toLowerCase()}`}>
                                                        {pkg.tier?.value || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="text-right val-text">
                                                    {pkg.limitQuota} {pkg.type?.value === 'POSTING' ? 'bài đăng' : 'lượt đẩy'}
                                                </td>
                                                <td className="text-right val-text">
                                                    {pkg.activeDays} ngày
                                                </td>
                                                <td className="text-right price-cell">
                                                    {pkg.price === 0 ? (
                                                        <span className="text-free">Miễn phí</span>
                                                    ) : (
                                                        `${pkg.price.toLocaleString()}đ`
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div className="action-btn-group">
                                                        <button 
                                                            onClick={() => openEditForm(pkg)}
                                                            className="btn-edit-action"
                                                        >
                                                            Sửa
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeletePackage(pkg.id)}
                                                            className="btn-delete-action"
                                                        >
                                                            Xóa
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
                )}
                <div className="pagination">
                    <p>Bộ lọc tìm thấy <strong>{filteredPackages.length}</strong> / {totalPackages} cấu hình gói dịch vụ</p>
                </div>
            </div>
        </div>
    );
}

export default PackageManagement;