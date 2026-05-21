import React, { useState, useEffect } from 'react';
import './VoucherManagement.css';
import VoucherService from '../../../services/voucherService';

function VoucherManagement() {
    // 1. Quản lý States dữ liệu hệ thống
    const [vouchers, setVouchers] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Tất cả trạng thái');

    // States phục vụ cho việc Thêm mới & Sửa đổi (CRUD Form)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState(null); // null = Thêm mới, có ID = Đang sửa
    const [formData, setFormData] = useState({
        quantity: 100,
        discountPercentage: 10,
        maxDiscountAmount: 50000,
        startedAt: '', // Định dạng chuỗi nhập từ ô input: yyyy-MM-dd
        expiredAt: '',
        isActive: true
    });

    // ==========================================
    // 2. Các hàm chức năng Gọi API (CRUD)
    // ==========================================

    // [READ] - Lấy danh sách toàn bộ Voucher từ BE
    function fetchAllVouchers() {
        setLoading(true);
        VoucherService.getVouchers()
            .then(function(response) {
                if (response && response.code === 200) {
                    setVouchers(response.data);
                }
                setLoading(false);
            })
            .catch(function(error) {
                console.error("Lỗi khi tải danh sách:", error);
                setLoading(false);
            });
    }

    // Tự động tải khi component Mount
    useEffect(function() {
        fetchAllVouchers();
    }, []);

    // [CREATE & UPDATE] - Xử lý gửi Form (Lưu dữ liệu)
    function handleSaveVoucher(e) {
        e.preventDefault();

        // Chuyển đổi định dạng ngày yyyy-MM-dd từ ô input sang dd-MM-yyyy để khớp với @JsonFormat ở BE
        function convertToBackendDate(dateString) {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}-${month}-${year}`;
        }

        const payload = {
            quantity: Number(formData.quantity),
            discountPercentage: Number(formData.discountPercentage),
            maxDiscountAmount: Number(formData.maxDiscountAmount),
            startedAt: convertToBackendDate(formData.startedAt),
            expiredAt: convertToBackendDate(formData.expiredAt),
            isActive: formData.isActive
        };

        if (editingVoucherId) {
            // Thực hiện Cập nhật (PUT)
            VoucherService.updateVoucher(editingVoucherId, payload)
                .then(function() {
                    alert("Cập nhật voucher thành công!");
                    closeForm();
                    fetchAllVouchers();
                })
                .catch(function() { alert("Lỗi khi cập nhật voucher."); });
        } else {
            // Thực hiện Tạo mới (POST)
            VoucherService.createVoucher(payload)
                .then(function() {
                    alert("Tạo mới voucher thành công!");
                    closeForm();
                    fetchAllVouchers();
                })
                .catch(function() { alert("Lỗi khi tạo voucher mới."); });
        }
    }

    // [UPDATE ACTIVE] - Bật/Tắt nhanh trạng thái isActive bằng switch/button
    function handleToggleActive(id, currentStatus) {
        VoucherService.updateVoucherActive(id, !currentStatus)
            .then(function() {
                fetchAllVouchers();
            })
            .catch(function() {
                alert("Không thể đổi trạng thái. Hãy kiểm tra quyền ADMIN.");
            });
    }

    // [DELETE HARD] - Xóa vĩnh viễn (Xóa cứng)
    function handleHardDelete(id) {
        if (window.confirm("CẢNH BÁO: Hành động này sẽ xóa VĨNH VIỄN voucher khỏi Cơ sở dữ liệu. Bạn chắc chắn chứ?")) {
            VoucherService.hardDeleteVoucher(id)
                .then(function() {
                    alert("Đã xóa vĩnh viễn voucher.");
                    fetchAllVouchers();
                })
                .catch(function() { alert("Lỗi khi xóa vĩnh viễn."); });
        }
    }

    // ==========================================
    // 3. Hàm bổ trợ giao diện (UI Helpers)
    // ==========================================
    function openAddForm() {
        setEditingVoucherId(null);
        setFormData({
            quantity: 100,
            discountPercentage: 10,
            maxDiscountAmount: 50000,
            startedAt: '',
            expiredAt: '',
            isActive: true
        });
        setIsFormOpen(true);
    }

    function openEditForm(voucher) {
        // Chuyển đổi định dạng từ chuỗi ISO ở BE về định dạng yyyy-MM-dd để đẩy lên ô `input type="date"`
        function formatToInputDate(isoString) {
            if (!isoString) return '';
            const d = new Date(isoString);
            return d.toISOString().split('T')[0];
        }

        setEditingVoucherId(voucher.id);
        setFormData({
            quantity: voucher.quantity,
            discountPercentage: voucher.discountPercentage,
            maxDiscountAmount: voucher.maxDiscountAmount,
            startedAt: formatToInputDate(voucher.startedAt),
            expiredAt: formatToInputDate(voucher.expiredAt),
            isActive: voucher.isActive
        });
        setIsFormOpen(true);
    }

    function closeForm() {
        setIsFormOpen(false);
        setEditingVoucherId(null);
    }

    function formatDateTime(isoString) {
        if (!isoString) return '--/--/----';
        const date = new Date(isoString);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }

    // Bộ lọc danh sách `vouchers` dựa trên trạng thái hoạt động hiển thị
    const filteredVouchers = vouchers.filter(function(voucher) {
        if (filterStatus === 'Đang hoạt động') return voucher.isActive === true;
        if (filterStatus === 'Đã ẩn / Hết hạn') return voucher.isActive === false;
        return true;
    });

    // Thống kê động từ state `vouchers`
    const activeCount = vouchers.filter(v => v.isActive).length;
    const totalUsed = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);
    const totalQty = vouchers.reduce((acc, v) => acc + (v.quantity || 0), 0);
    const useRate = totalQty > 0 ? ((totalUsed / totalQty) * 100).toFixed(1) : 0;

    return (
        <div className="voucher-admin-wrapper">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Quản lý Voucher</h2>
                    <p className="page-subtitle">Kiểm soát dữ liệu và tối ưu chương trình khuyến mãi phòng thuê.</p>
                </div>
                <button className="btn-primary" onClick={openAddForm}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Tạo Voucher Mới
                </button>
            </div>

            {/* Form Thêm/Sửa (CRUD Form) */}
            {isFormOpen && (
                <div className="form-container-card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '16px' }}>{editingVoucherId ? `Cập nhật Voucher (ID: ${editingVoucherId.substring(0,8)}...)` : 'Tạo Voucher Mới'}</h3>
                    <form onSubmit={handleSaveVoucher} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Phần trăm giảm (%)</label>
                            <input type="number" required min="1" max="100" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={formData.discountPercentage} onChange={function(e){ setFormData({...formData, discountPercentage: e.target.value}) }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Số tiền giảm tối đa (VNĐ)</label>
                            <input type="number" required min="0" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={formData.maxDiscountAmount} onChange={function(e){ setFormData({...formData, maxDiscountAmount: e.target.value}) }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Số lượng phát hành</label>
                            <input type="number" required min="1" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={formData.quantity} onChange={function(e){ setFormData({...formData, quantity: e.target.value}) }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Trạng thái kích hoạt</label>
                            <select style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={formData.isActive} onChange={function(e){ setFormData({...formData, isActive: e.target.value === 'true'}) }}>
                                <option value="true">Bật hoạt động</option>
                                <option value="false">Tắt / Ẩn đi</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Ngày bắt đầu</label>
                            <input type="date" required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={formData.startedAt} onChange={function(e){ setFormData({...formData, startedAt: e.target.value}) }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px' }}>Ngày hết hạn</label>
                            <input type="date" required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                value={formData.expiredAt} onChange={function(e){ setFormData({...formData, expiredAt: e.target.value}) }} />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="button" onClick={closeForm} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy bỏ</button>
                            <button type="submit" style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Lưu Voucher</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Statistics Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Voucher đang hoạt động</p>
                        <h3 className="stat-value text-primary">{activeCount}</h3>
                        <div className="stat-trend text-secondary">
                            <span className="material-symbols-outlined">trending_up</span>
                            <span>Kết nối trực tiếp DB</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined stat-bg-icon text-primary">confirmation_number</span>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Tỉ lệ sử dụng hệ thống</p>
                        <h3 className="stat-value">{useRate}%</h3>
                        <div className="stat-trend text-primary">
                            <span className="material-symbols-outlined">analytics</span>
                            <span>Đã dùng {totalUsed} lượt</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Tổng lượng phát hành</p>
                        <h3 className="stat-value text-tertiary">{totalQty}</h3>
                        <div className="stat-trend text-tertiary">
                            <span className="material-symbols-outlined">payments</span>
                            <span>Giới hạn số lượng kho</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-section">
                <div className="table-controls">
                    <div className="filters">
                        <div className="custom-select">
                            <select value={filterStatus} onChange={function(e) { setFilterStatus(e.target.value); }}>
                                <option>Tất cả trạng thái</option>
                                <option>Đang hoạt động</option>
                                <option>Đã ẩn / Hết hạn</option>
                            </select>
                            <span className="material-symbols-outlined select-icon">keyboard_arrow_down</span>
                        </div>
                    </div>
                    <div className="actions">
                        <button className="icon-btn-filter" title="Làm mới danh sách" onClick={fetchAllVouchers}>
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        Đang đồng bộ dữ liệu từ API Server...
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="voucher-table">
                            <thead>
                                <tr>
                                    <th>ID Voucher</th>
                                    <th>Cấu hình giảm</th>
                                    <th className="text-right">Giảm tối đa</th>
                                    <th>Thời gian áp dụng</th>
                                    <th>Lượt dùng</th>
                                    <th>Trạng thái</th>
                                    <th className="text-right">Hành động thực tế (CRUD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVouchers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                            Không có dữ liệu voucher nào phù hợp.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVouchers.map(function(voucher) {
                                        const total = voucher.quantity || 0;
                                        const used = voucher.usedCount || 0;
                                        const progressPercent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

                                        return (
                                            <tr key={voucher.id}>
                                                <td style={{ fontWeight: '500', color: '#334155' }}>
                                                    #{voucher.id.substring(0, 8).toUpperCase()}...
                                                </td>
                                                <td>
                                                    <span className="badge badge-percent">
                                                        Giảm {voucher.discountPercentage}%
                                                    </span>
                                                </td>
                                                <td className="text-right val-text">
                                                    {voucher.maxDiscountAmount ? voucher.maxDiscountAmount.toLocaleString() : 0}đ
                                                </td>
                                                <td>
                                                    <div className="col-time">
                                                        <div><span className="material-symbols-outlined">calendar_today</span> {formatDateTime(voucher.startedAt)}</div>
                                                        <div><span className="material-symbols-outlined">event_busy</span> {formatDateTime(voucher.expiredAt)}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="col-usage">
                                                        <div className="usage-stats">
                                                            <span>{used}/{total}</span>
                                                            <span>{progressPercent}%</span>
                                                        </div>
                                                        <div className="progress-bar">
                                                            <div 
                                                                className={`progress-fill ${voucher.isActive ? 'fill-primary' : 'fill-gray'}`} 
                                                                style={{ width: `${progressPercent}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${voucher.isActive ? 'status-active' : 'status-expired'}`}>
                                                        {voucher.isActive && <span className="dot pulse"></span>}
                                                        {voucher.isActive ? 'Đang hoạt động' : 'Đã ẩn'}
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                        {/* Bật/tắt nhanh hoạt động */}
                                                        <button 
                                                            onClick={function(){ handleToggleActive(voucher.id, voucher.isActive); }}
                                                            style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
                                                            title="Đổi trạng thái kích hoạt nhanh"
                                                        >
                                                            {voucher.isActive ? 'Ẩn nhanh' : 'Bật lại'}
                                                        </button>
                                                        
                                                        {/* Sửa thông tin */}
                                                        <button 
                                                            onClick={function(){ openEditForm(voucher); }}
                                                            style={{ padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                        >
                                                            Sửa
                                                        </button>

                                                        {/* Xóa vĩnh viễn */}
                                                        <button 
                                                            onClick={function(){ handleHardDelete(voucher.id); }}
                                                            style={{ padding: '4px 8px', background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                            title="Xóa hẳn bản ghi khỏi database"
                                                        >
                                                            Xóa cứng
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

                {/* Pagination */}
                <div className="pagination">
                    <p>Hiển thị toàn bộ {filteredVouchers.length} dòng kết quả thực tế</p>
                </div>
            </div>
        </div>
    );
}

export default VoucherManagement;