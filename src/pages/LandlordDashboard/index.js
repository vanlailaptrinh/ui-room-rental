import React, { useState, useEffect, useCallback } from 'react';
import './Landlord.css';
import BookingService from '../../services/bookingService';
import NotificationBell from '../../components/NotificationBell';

/* ─── Helper: format thời gian ─── */
const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
    const map = {
        PENDING:   { label: 'Chờ duyệt',    cls: 'sb-pending' },
        APPROVED:  { label: 'Đã duyệt',     cls: 'sb-approved' },
        REJECTED:  { label: 'Từ chối',       cls: 'sb-rejected' },
        CANCELLED: { label: 'Đã hủy',        cls: 'sb-cancelled' },
    };
    const { label, cls } = map[status] || { label: status, cls: '' };
    return <span className={`ld-status-badge ${cls}`}>{label}</span>;
};

function LandlordDashboard() {
    const [activeTab, setActiveTab] = useState('appointments');

    /* ─── Booking states ─── */
    const [bookings, setBookings]       = useState([]);
    const [bookingLoading, setBLoading] = useState(false);
    const [bookingError, setBError]     = useState(null);
    const [processing, setProcessing]   = useState(null); // id đang approve/reject

    /* ─── Listings (giữ nguyên mock) ─── */
    const [listings] = useState([
        { id: 101, title: 'Phòng trọ cao cấp Bình Thạnh', views: 1250, status: 'Đang hiển thị' },
        { id: 102, title: 'Căn hộ Studio Quận 7', views: 840, status: 'Đã cho thuê' },
    ]);

    const [adPackage, setAdPackage] = useState({ name: 'Gói Ưu Tiên 1', daysLeft: 2, progress: 70 });

    /* ─── Fetch landlord bookings ─── */
    const fetchBookings = useCallback(async () => {
        try {
            setBLoading(true);
            setBError(null);
            const res = await BookingService.getLandlordBookings();
            setBookings(res.data || []);
        } catch (err) {
            console.error('Lỗi lấy booking:', err);
            setBError('Không thể tải danh sách. Vui lòng thử lại.');
        } finally {
            setBLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'appointments') fetchBookings();
    }, [activeTab, fetchBookings]);

    /* ─── Approve ─── */
    const handleApprove = async (id) => {
        try {
            setProcessing(id);
            await BookingService.approveBooking(id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'APPROVED' } : b));
        } catch (err) {
            alert('Không thể duyệt lịch hẹn. Thử lại!');
        } finally {
            setProcessing(null);
        }
    };

    /* ─── Reject ─── */
    const handleReject = async (id) => {
        if (!window.confirm('Bạn có chắc muốn từ chối lịch hẹn này?')) return;
        try {
            setProcessing(id);
            await BookingService.rejectBooking(id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED' } : b));
        } catch (err) {
            alert('Không thể từ chối lịch hẹn. Thử lại!');
        } finally {
            setProcessing(null);
        }
    };

    /* ─── Tab: Appointments (Bookings từ API) ─── */
    const renderAppointments = () => {
        if (bookingLoading) {
            return (
                <section className="card full-width">
                    <h3>Lịch hẹn từ khách thuê</h3>
                    <div className="ld-loading">
                        <div className="ld-spinner" />
                        <span>Đang tải...</span>
                    </div>
                </section>
            );
        }

        if (bookingError) {
            return (
                <section className="card full-width">
                    <h3>Lịch hẹn từ khách thuê</h3>
                    <div className="ld-error">
                        <span>⚠️ {bookingError}</span>
                        <button className="btn-text" onClick={fetchBookings}>Thử lại</button>
                    </div>
                </section>
            );
        }

        return (
            <section className="card full-width">
                <h3>
                    Lịch hẹn từ khách thuê
                    <span className="ld-count-badge">{bookings.length}</span>
                </h3>

                {bookings.length === 0 ? (
                    <div className="ld-empty">
                        <span>🗓️</span>
                        <p>Chưa có lịch hẹn nào được gửi đến.</p>
                    </div>
                ) : (
                    <div className="appointment-list">
                        {bookings.map((b) => {
                            const dt = b.bookingTime ? new Date(b.bookingTime) : null;
                            const day  = dt ? dt.getDate() : '?';
                            const mon  = dt ? dt.toLocaleString('vi-VN', { month: 'short' }) : '';
                            const time = dt ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

                            return (
                                <div key={b.id} className={`appointment-item ld-item-${b.status?.toLowerCase()}`}>
                                    {/* Date tag */}
                                    <div className="date-tag">
                                        {day}<br /><span>{mon}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="apt-details">
                                        <h4>{b.post?.title || 'Phòng chưa có tiêu đề'}</h4>
                                        <p>
                                            ⏰ {time} &nbsp;•&nbsp;
                                            <StatusBadge status={b.status} />
                                        </p>
                                        <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>
                                            📍 {b.post?.address || '—'} &nbsp;|&nbsp;
                                            Đặt lúc: {fmtDate(b.createdAt)}
                                        </p>
                                    </div>

                                    {/* Actions — chỉ show khi PENDING */}
                                    <div className="apt-actions">
                                        {b.status === 'PENDING' && (
                                            <>
                                                <button
                                                    className="btn-approve"
                                                    onClick={() => handleApprove(b.id)}
                                                    disabled={processing === b.id}
                                                >
                                                    {processing === b.id ? '...' : '✓ Duyệt'}
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => handleReject(b.id)}
                                                    disabled={processing === b.id}
                                                >
                                                    {processing === b.id ? '...' : 'Từ chối'}
                                                </button>
                                            </>
                                        )}
                                        {b.status !== 'PENDING' && (
                                            <span style={{ fontSize: 13, color: '#9ca3af' }}>Đã xử lý</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        );
    };

    /* ─── Tab: Listings ─── */
    const renderListings = () => (
        <section className="card full-width">
            <div className="section-header">
                <h3>Danh sách tin đăng</h3>
                <button className="btn-primary-small">+ Đăng tin mới</button>
            </div>
            <div className="listing-table">
                {listings.map(item => (
                    <div key={item.id} className="listing-item">
                        <img src={`https://picsum.photos/100/70?random=${item.id}`} alt="room" />
                        <div className="listing-info">
                            <h4>{item.title}</h4>
                            <p>Lượt xem: <strong>{item.views}</strong> • {item.status}</p>
                        </div>
                        <button className="btn-outline-small">Chỉnh sửa</button>
                    </div>
                ))}
            </div>
        </section>
    );

    /* ─── Tab: Payments ─── */
    const renderPayments = () => (
        <div className="dashboard-grid">
            <section className="card">
                <h3>Gói dịch vụ hiện tại</h3>
                <div className="ad-package-box">
                    <div className="package-info">
                        <strong>{adPackage.name}</strong>
                        <span className={adPackage.daysLeft < 3 ? 'warning' : ''}>Còn {adPackage.daysLeft} ngày</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-fill" style={{ width: `${adPackage.progress}%` }} />
                    </div>
                    <button className="btn-primary-outline" onClick={() => {
                        alert('Đang xử lý gia hạn...');
                        setTimeout(() => setAdPackage({ ...adPackage, daysLeft: 30, progress: 100 }), 1000);
                    }}>Gia hạn ngay</button>
                </div>
            </section>
            <section className="card">
                <h3>Lịch sử giao dịch</h3>
                <div className="history-list">
                    <div className="history-item"><span>15/04/2024</span> <strong>- 200.000đ</strong></div>
                    <div className="history-item"><span>01/04/2024</span> <strong>- 500.000đ</strong></div>
                </div>
            </section>
        </div>
    );

    /* ─── Tab: Reports ─── */
    const renderReports = () => (
        <section className="card full-width">
            <h3>Phản hồi từ người thuê</h3>
            <div className="report-item">
                <div className="report-user">Lê Văn C (Phòng 302)</div>
                <p>"Vòi hoa sen bị hỏng, nhờ chủ nhà qua kiểm tra giúp ạ."</p>
                <button className="btn-text">Phản hồi ngay</button>
            </div>
        </section>
    );

    const tabTitle = {
        appointments: 'Quản lý lịch hẹn',
        listings:     'Tin đăng của tôi',
        payments:     'Tài chính & Gói tin',
        reports:      'Báo cáo & Khiếu nại',
    };

    return (
        <div className="landlord-container">
            <aside className="landlord-sidebar">
                <div className="logo">TroSinhVien</div>
                <nav className="nav-menu">
                    {[
                        { key: 'appointments', icon: '📅', label: 'Quản lý lịch hẹn' },
                        { key: 'listings',     icon: '🏠', label: 'Quản lý tin đăng' },
                        { key: 'payments',     icon: '💳', label: 'Thanh toán & Gói tin' },
                        { key: 'reports',      icon: '📋', label: 'Báo cáo người thuê' },
                    ].map(({ key, icon, label }) => (
                        <div
                            key={key}
                            className={`nav-item ${activeTab === key ? 'active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {icon} {label}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="landlord-main">
                <header className="main-header">
                    <h1>{tabTitle[activeTab]}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Chuông thông báo real-time */}
                        <NotificationBell />
                        <div className="user-info">
                            <span className="badge-verified">Chủ trọ xác thực</span>
                            <img src="https://i.pravatar.cc/40" alt="avatar" className="avatar" />
                        </div>
                    </div>
                </header>
                <div className="content-area">
                    {activeTab === 'appointments' && renderAppointments()}
                    {activeTab === 'listings'     && renderListings()}
                    {activeTab === 'payments'     && renderPayments()}
                    {activeTab === 'reports'      && renderReports()}
                </div>
            </main>
        </div>
    );
}

export default LandlordDashboard;