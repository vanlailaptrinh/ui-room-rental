import React, { useState, useEffect, useCallback, useMemo } from 'react';
import OrderService from '../../../../services/orderService';
import './OrderManagementTab.css';
import LandlordFilterBar from '../../components/LandlordFilterBar';

/* ─── Helper: format thời gian ─── */
const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── Helper: Badge trạng thái đơn hàng ─── */
const OrderStatusBadge = ({ status }) => {
    const map = {
        PENDING:   { label: 'Chờ thanh toán', cls: 'landlord-sb-pending' },
        PAID:      { label: 'Đã thanh toán',  cls: 'landlord-sb-approved' },
        SUCCESS:   { label: 'Thành công',     cls: 'landlord-sb-approved' },
        FAILED:    { label: 'Thất bại',       cls: 'landlord-sb-rejected' },
        CANCELLED: { label: 'Đã hủy',         cls: 'landlord-sb-cancelled' },
    };

    const upperStatus = status ? status.toUpperCase() : '';
    const { label, cls } = map[upperStatus] || { label: status || 'Không rõ', cls: '' };

    return <span className={`landlord-ld-status-badge ${cls}`}>{label}</span>;
};

const OrderManagementTab = ({ activeTab }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Các state phục vụ bộ lọc tìm kiếm
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Cấu hình danh sách option riêng cho tab Đơn hàng
    const statusOptions = [
        { value: 'ALL', label: 'Tất cả trạng thái' },
        { value: 'PENDING', label: '⏳ Chờ thanh toán' },
        { value: 'PAID', label: '✅ Đã thanh toán' },
        { value: 'SUCCESS', label: '🎉 Thành công' },
        { value: 'FAILED', label: '❌ Thất bại' },
        { value: 'CANCELLED', label: '🚫 Đã hủy' },
    ];

    const sortOptions = [
        { value: 'newest', label: '🗓️ Mới nhất trước' },
        { value: 'oldest', label: '🗓️ Cũ nhất trước' },
        { value: 'priceDesc', label: '💰 Số tiền giảm dần' },
        { value: 'priceAsc', label: '💰 Số tiền tăng dần' },
    ];

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await OrderService.getMyOrders();
            setOrders(res?.data || res || []);
        } catch (err) {
            console.error("Lỗi tải đơn hàng:", err);
            setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab, fetchOrders]);

    // Xử lý tính toán lọc và sắp xếp dữ liệu (useMemo tối ưu hiệu năng)
    const filteredAndSortedOrders = useMemo(() => {
        return orders
            .filter((order) => {
                const orderStatus = order.status ? order.status.toUpperCase() : '';
                const matchStatus = filterStatus === 'ALL' || orderStatus === filterStatus;

                const idString = String(order.id).toLowerCase();
                const packageName = (order.packageName || order.description || '').toLowerCase();
                const keyword = searchTerm.toLowerCase().trim();

                const matchKeyword = idString.includes(keyword) || packageName.includes(keyword);
                return matchStatus && matchKeyword;
            })
            .sort((a, b) => {
                if (sortBy === 'newest' || sortBy === 'oldest') {
                    const timeA = new Date(a.createdAt || 0).getTime();
                    const timeB = new Date(b.createdAt || 0).getTime();
                    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
                }
                if (sortBy === 'priceDesc' || sortBy === 'priceAsc') {
                    const priceA = a.totalPrice || a.amount || a.price || 0;
                    const priceB = b.totalPrice || b.amount || b.price || 0;
                    return sortBy === 'priceDesc' ? priceB - priceA : priceA - priceB;
                }
                return 0;
            });
    }, [orders, filterStatus, searchTerm, sortBy]);

    if (loading) return (
        <section className="landlord-card landlord-full-width">
            <h3>Lịch sử giao dịch / Đơn hàng</h3>
            <div className="landlord-ld-loading" style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="landlord-ld-spinner" />
                <span>Đang tải danh sách đơn hàng...</span>
            </div>
        </section>
    );

    if (error) return (
        <section className="landlord-card landlord-full-width">
            <h3>Lịch sử giao dịch / Đơn hàng</h3>
            <div className="landlord-ld-error" style={{ padding: '30px', textAlign: 'center' }}>
                <span>⚠️ {error}</span>
                <button className="landlord-btn-text" onClick={fetchOrders} style={{ marginTop: '12px', display: 'block', margin: '12px auto 0' }}>Thử lại</button>
            </div>
        </section>
    );

    return (
        <section className="landlord-card landlord-full-width landlord-fade-in order-unified-form">
            {/* Tiêu đề gom chung form */}
            <div className="unified-form-header">
                <h3>
                    Lịch sử giao dịch / Đơn hàng
                    <span className="landlord-ld-count-badge">{filteredAndSortedOrders.length} đơn</span>
                </h3>
            </div>

            {/* Khối thanh bộ lọc nhúng trực tiếp phẳng mịn */}
            <div className="unified-filter-wrapper">
                <LandlordFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="🔍 Tìm theo mã đơn, tên gói dịch vụ..."
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    statusOptions={statusOptions}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOptions={sortOptions}
                />
            </div>

            {/* Bảng dữ liệu gom gọn lọt lòng */}
            <div className="unified-list-container">
                <div className="landlord-table-responsive">
                    <table className="landlord-table">
                        <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Nội dung / Gói dịch vụ</th>
                            <th>Số tiền (VND)</th>
                            <th>Ngày giao dịch</th>
                            <th>Trạng thái</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredAndSortedOrders.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="order-empty-td">
                                    <div className="order-empty-icon">🧾</div>
                                    <div className="order-empty-text">
                                        {orders.length === 0 ? "Bạn chưa có giao dịch nào trên hệ thống." : "Không tìm thấy đơn hàng phù hợp bộ lọc."}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAndSortedOrders.map((order) => {
                                const finalPrice = order.totalPrice || order.amount || order.price || 0;
                                return (
                                    <tr key={order.id} className={`order-row-status-${order.status ? order.status.toLowerCase() : 'unknown'}`}>
                                        {/* Mã đơn */}
                                        <td className="order-id-cell">
                                            #{String(order.id).substring(0, 8).toUpperCase()}
                                        </td>

                                        {/* Tên gói dịch vụ */}
                                        <td className="order-name-cell">
                                            {order.packageName || order.description || 'Thanh toán dịch vụ hệ thống'}
                                        </td>

                                        {/* Số tiền */}
                                        <td className="order-price-cell">
                                            {finalPrice.toLocaleString('vi-VN')} đ
                                        </td>

                                        {/* Ngày giao dịch */}
                                        <td className="order-date-cell">{fmtDate(order.createdAt)}</td>

                                        {/* Badge Trạng thái */}
                                        <td className="order-badge-cell">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default OrderManagementTab;