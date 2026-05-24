import React, { useState, useEffect } from 'react';
import OrderService from '../../../../services/orderService';
import './OrderManagementTab.css'

/* ─── Helper: format thời gian ─── */
const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── Helper: Badge trạng thái đơn hàng ─── */
const OrderStatusBadge = ({ status }) => {
    // Mapping các trạng thái thường gặp khi thanh toán/mua gói
    const map = {
        PENDING:   { label: 'Chờ thanh toán', cls: 'landlord-sb-pending' },
        PAID:      { label: 'Đã thanh toán',  cls: 'landlord-sb-approved' },
        SUCCESS:   { label: 'Thành công',     cls: 'landlord-sb-approved' },
        FAILED:    { label: 'Thất bại',       cls: 'landlord-sb-rejected' },
        CANCELLED: { label: 'Đã hủy',         cls: 'landlord-sb-cancelled' },
    };

    // Đảm bảo chữ hoa để map chuẩn xác
    const upperStatus = status ? status.toUpperCase() : '';
    const { label, cls } = map[upperStatus] || { label: status || 'Không rõ', cls: '' };

    return <span className={`landlord-ld-status-badge ${cls}`}>{label}</span>;
};

const OrderManagementTab = ({ activeTab }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Chỉ gọi API khi user click vào tab đơn hàng
        if (activeTab === 'orders') {
            const fetchOrders = async () => {
                setLoading(true);
                setError(null);
                try {
                    // Lưu ý: Đổi tên hàm getMyOrders() dưới đây cho khớp với tên hàm thực tế trong OrderService của bạn
                    const res = await OrderService.getMyOrders();
                    // Tuỳ vào response trả về (res.data hay res) mà ta set state
                    setOrders(res?.data || res || []);
                } catch (err) {
                    console.error("Lỗi tải đơn hàng:", err);
                    setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab]);

    return (
        <section className="landlord-card landlord-full-width landlord-fade-in">
            <div className="landlord-section-header">
                <div className="header-left">
                    <h3>Lịch sử giao dịch / Đơn hàng</h3>
                    <span className="landlord-ld-count-badge">{orders.length} đơn</span>
                </div>
            </div>

            {loading ? (
                <div className="landlord-ld-loading" style={{ padding: '40px 0', textAlign: 'center' }}>
                    <div className="landlord-ld-spinner" />
                    <span>Đang tải danh sách đơn hàng...</span>
                </div>
            ) : error ? (
                <div className="landlord-ld-error" style={{ padding: '20px', textAlign: 'center', color: '#e53e3e' }}>
                    <span>⚠️ {error}</span>
                </div>
            ) : (
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
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🧾</div>
                                    <div style={{ color: '#888' }}>Bạn chưa có giao dịch nào.</div>
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    {/* Rút gọn mã ID nếu nó là dạng UUID quá dài */}
                                    <td style={{ fontWeight: 'bold', color: '#1890ff' }}>
                                        #{String(order.id).substring(0, 8).toUpperCase()}
                                    </td>

                                    <td>
                                        <div style={{ fontWeight: '500' }}>
                                            {order.packageName || order.description || 'Thanh toán dịch vụ hệ thống'}
                                        </div>
                                    </td>

                                    <td style={{ fontWeight: 'bold' }}>
                                        {(order.totalPrice || order.amount || order.price)
                                            ? (order.totalPrice || order.amount || order.price).toLocaleString('vi-VN') + ' đ'
                                            : '0 đ'
                                        }
                                    </td>

                                    <td>{fmtDate(order.createdAt)}</td>

                                    <td><OrderStatusBadge status={order.status} /></td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default OrderManagementTab;