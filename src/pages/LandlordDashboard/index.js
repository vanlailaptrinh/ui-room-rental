import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landlord.css';
import BookingService from '../../services/bookingService';
import NotificationBell from '../../components/NotificationBell';
import {IconVerified} from "../../assets/Icons";
import * as UserService from '../../services/userService';

/* ─── Helper: format thời gian ─── */
const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
    const map = {
        PENDING:   { label: 'Chờ duyệt',    cls: 'landlord-sb-pending' },
        APPROVED:  { label: 'Đã duyệt',     cls: 'landlord-sb-approved' },
        REJECTED:  { label: 'Từ chối',       cls: 'landlord-sb-rejected' },
        CANCELLED: { label: 'Đã hủy',        cls: 'landlord-sb-cancelled' },
    };
    const { label, cls } = map[status] || { label: status, cls: '' };
    return <span className={`landlord-ld-status-badge ${cls}`}>{label}</span>;
};

/* Component phụ để tránh lặp code */
const PricingCard = ({ pkg }) => (
    <div className={`landlord-pricing-card ${pkg.popular ? 'featured' : ''}`}>
        {pkg.popular && <div className="featured-badge">CHUYÊN NGHIỆP</div>}
        <h4>{pkg.title}</h4>
        <p className="pkg-desc">{pkg.desc}</p>
        <div className="pkg-price">
            <span className="amount">{pkg.price}</span>
            <span className="period">/{pkg.duration.split(' ')[0]} {pkg.duration.split(' ')[1]}</span>
        </div>
        <ul className="pkg-features">
            <li>✅ Giới hạn: <strong>{pkg.limit}</strong></li>
            <li>✅ Hiển thị: <strong>{pkg.duration}</strong></li>
        </ul>
        <button className="landlord-btn-buy">Chọn gói này</button>
    </div>
);

function LandlordDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');

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

    /* ─── Tab: Dashboard (Bảng điều khiển) ─── */
    const renderDashboard = () => (
        <div className="landlord-fade-in">
            <div className="landlord-stat-grid">
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#e6f7ff', color: '#1890ff'}}>📊</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Tổng lượt xem</span>
                        <h2 className="landlord-stat-value">2,540</h2>
                    </div>
                </div>
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#f6ffed', color: '#52c41a'}}>📅</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Lịch hẹn mới</span>
                        <h2 className="landlord-stat-value">{bookings.filter(b => b.status === 'PENDING').length}</h2>
                    </div>
                </div>
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#fff7e6', color: '#fa8c16'}}>🏠</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Tin đang đăng</span>
                        <h2 className="landlord-stat-value">3</h2>
                    </div>
                </div>
            </div>
            {/* Có thể render thêm biểu đồ hoặc danh sách lịch hẹn gần đây ở đây */}
            {renderAppointments()}
        </div>
    );
    /* ─── Tab: Messages (Tin nhắn) ─── */
    const renderMessages = () => (
        <section className="landlord-card landlord-full-width landlord-fade-in">
            <div className="landlord-section-header">
                <h3>Tin nhắn từ khách hàng</h3>
            </div>
            <div className="landlord-message-list">
                {[1, 2].map(m => (
                    <div key={m} className="landlord-message-item">
                        <img src={`https://i.pravatar.cc/40?img=${m+10}`} alt="user" className="landlord-avatar" />
                        <div className="landlord-message-content">
                            <div className="landlord-message-user">
                                <strong>Nguyễn Văn Khách {m}</strong>
                                <span className="landlord-message-time">10:30 AM</span>
                            </div>
                            <p>Cho em hỏi phòng này còn trống không ạ?</p>
                        </div>
                        <button className="landlord-btn-text">Trả lời</button>
                    </div>
                ))}
            </div>
        </section>
    );

    /* ─── Tab: Appointments (Bookings từ API) ─── */
    const renderAppointments = () => {
        if (bookingLoading) {
            return (
                <section className="landlord-card landlord-full-width">
                    <h3>Lịch hẹn từ khách thuê</h3>
                    <div className="landlord-ld-loading">
                        <div className="landlord-ld-spinner" />
                        <span>Đang tải...</span>
                    </div>
                </section>
            );
        }

        if (bookingError) {
            return (
                <section className="landlord-card landlord-full-width">
                    <h3>Lịch hẹn từ khách thuê</h3>
                    <div className="landlord-ld-error">
                        <span>⚠️ {bookingError}</span>
                        <button className="landlord-btn-text" onClick={fetchBookings}>Thử lại</button>
                    </div>
                </section>
            );
        }

        return (
            <section className="landlord-card landlord-full-width">
                <h3>
                    Lịch hẹn từ khách thuê
                    <span className="landlord-ld-count-badge">{bookings.length}</span>
                </h3>

                {bookings.length === 0 ? (
                    <div className="landlord-ld-empty">
                        <span>🗓️</span>
                        <p>Chưa có lịch hẹn nào được gửi đến.</p>
                    </div>
                ) : (
                    <div className="landlord-appointment-list">
                        {bookings.map((b) => {
                            const dt = b.bookingTime ? new Date(b.bookingTime) : null;
                            const day  = dt ? dt.getDate() : '?';
                            const mon  = dt ? dt.toLocaleString('vi-VN', { month: 'short' }) : '';
                            const time = dt ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

                            return (
                                <div key={b.id} className={`landlord-appointment-item landlord-ld-item-${b.status?.toLowerCase()}`}>
                                    {/* Date tag */}
                                    <div className="landlord-date-tag">
                                        {day}<br /><span>{mon}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="landlord-apt-details">
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
                                    <div className="landlord-apt-actions">
                                        {b.status === 'PENDING' && (
                                            <>
                                                <button
                                                    className="landlord-btn-approve"
                                                    onClick={() => handleApprove(b.id)}
                                                    disabled={processing === b.id}
                                                >
                                                    {processing === b.id ? '...' : '✓ Duyệt'}
                                                </button>
                                                <button
                                                    className="landlord-btn-danger"
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

    /* ─── Tab: Listings  ─── */
    const renderListings = () => (
        <section className="landlord-card landlord-full-width landlord-fade-in">
            <div className="landlord-section-header">
                <div className="header-left">
                    <h3>Danh sách tin đăng</h3>
                    <span className="landlord-ld-count-badge">{listings.length} tin</span>
                </div>
                <button className="landlord-btn-primary-small">+ Đăng tin mới</button>
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
                        <th>Trạng thái</th>
                        <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {listings.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <div className="landlord-table-img">
                                    <img src={`https://picsum.photos/80/60?random=${item.id}`} alt="room" />
                                </div>
                            </td>
                            <td>
                                <div className="landlord-table-info">
                                    <div className="title">{item.title}</div>
                                    <div className="address">📍 {item.id === 101 ? 'Bình Thạnh, TP.HCM' : 'Quận 7, TP.HCM'}</div>
                                </div>
                            </td>
                            <td>
                                <span className="landlord-table-price">{item.id === 101 ? '4.5tr' : '3.8tr'}/tháng</span>
                            </td>
                            <td>
                                <div className="landlord-table-views">
                                    <span>👁️ {item.views}</span>
                                </div>
                            </td>
                            <td>
                                <span className="landlord-table-date">12/04/2024</span>
                            </td>
                            <td>
                                <span className={`landlord-status-dot ${item.status === 'Đang hiển thị' ? 'active' : 'inactive'}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div className="landlord-table-actions">
                                    <button className="btn-action edit" title="Chỉnh sửa">✏️</button>
                                    <button className="btn-action push" title="Đẩy tin">🚀</button>
                                    <button className="btn-action delete" title="Xóa">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    const [subTab, setSubTab] = useState('buy');
    /* ─── Tab: Gói tin (Hiển thị tất cả gói) ─── */
    const renderPayments = () => {
        const pricingData = {
            post: [
                { title: 'Gói đăng tin Cơ bản', price: '15.000đ', duration: '15 ngày', limit: '3 tin', desc: 'Phù hợp với nhu cầu cơ bản.', type: 'BASIC' },
                { title: 'Gói đăng tin PRO', price: '25.000đ', duration: '30 ngày', limit: '3 tin', desc: 'Tối ưu hiệu quả hiển thị.', type: 'PRO', popular: true },
            ],
            push: [
                { title: 'Gói đẩy tin Cơ bản', price: '12.000đ', duration: '5 ngày', limit: '3 tin', desc: 'Phù hợp với nhu cầu cơ bản.', type: 'BASIC' },
                { title: 'Gói đẩy tin PRO', price: '20.000đ', duration: '10 ngày', limit: '3 tin', desc: 'Tối ưu hiệu quả hiển thị.', type: 'PRO', popular: true },
            ]
        };

        return (
            <div className="landlord-fade-in">
                {/* Sub-navigation */}
                <div className="landlord-subtabs">
                    <button className={subTab === 'current' ? 'active' : ''} onClick={() => setSubTab('current')}>Gói của tôi</button>
                    <button className={subTab === 'buy' ? 'active' : ''} onClick={() => setSubTab('buy')}>Mua gói mới</button>
                </div>

                {subTab === 'current' ? (
                    <div className="landlord-card">
                        <h3>Gói đang hoạt động</h3>
                        <div className="landlord-current-pkg-item">
                            <div className="pkg-info">
                                <h4>Gói đăng tin PRO</h4>
                                <p>Ngày hết hạn: 20/05/2024 (Còn 8 ngày)</p>
                            </div>
                            <div className="pkg-status">
                                <span className="landlord-sb-approved">Đang sử dụng</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="landlord-pricing-container">
                        <div className="landlord-pricing-header">
                            <h2>Bảng giá dịch vụ</h2>
                            <p>Lựa chọn gói dịch vụ phù hợp để tối ưu hiệu quả cho thuê</p>
                        </div>

                        <div className="landlord-pricing-section">
                            <div className="landlord-pricing-grid">
                                {pricingData.post.map((pkg, idx) => (
                                    <PricingCard key={`post-${idx}`} pkg={pkg} />
                                ))}
                                {pricingData.push.map((pkg, idx) => (
                                    <PricingCard key={`push-${idx}`} pkg={pkg} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* ─── Tab: Reports ─── */
    const renderReports = () => (
        <section className="landlord-card landlord-full-width">
            <h3>Phản hồi từ người thuê</h3>
            <div className="landlord-report-item">
                <div className="landlord-report-user">Lê Văn C (Phòng 302)</div>
                <p>"Vòi hoa sen bị hỏng, nhờ chủ nhà qua kiểm tra giúp ạ."</p>
                <button className="landlord-btn-text">Phản hồi ngay</button>
            </div>
        </section>
    );

    const tabTitle = {
        dashboard:    'Bảng điều khiển',
        appointments: 'Quản lý lịch hẹn',
        listings:     'Tin đăng của tôi',
        messages:     'Tin nhắn',
        payments:     'Gói tin',
        reports:      'Báo cáo & Khiếu nại',
    };
    const [landlord, setLandlord] = useState(null);
    const landlordInitials = useMemo(() => {
        if (!landlord) return '??';
        const name = landlord.fullName || landlord.username || 'User';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [landlord]);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await UserService.getUserProfile();
                setLandlord(data.data); // Lưu dữ liệu trả về từ API (thường có fullName, avatarUrl...)
            } catch (err) {
                console.error('Lỗi lấy profile:', err);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="landlord-container">
            <aside className="landlord-sidebar">
                <Link to="/" className="landlord-logo">TroSinhVien</Link>
                <nav className="landlord-nav-menu">
                    {[
                        { key: 'dashboard',    icon: '📊', label: 'Bảng điều khiển' },
                        { key: 'appointments', icon: '📅', label: 'Quản lý lịch hẹn' },
                        { key: 'listings',     icon: '🏠', label: 'Quản lý tin đăng' },
                        { key: 'messages',     icon: '💬', label: 'Tin nhắn' },
                        { key: 'payments',     icon: '💳', label: 'Gói tin' },
                        { key: 'reports',      icon: '📋', label: 'Báo cáo người thuê' },
                    ].map(({ key, icon, label }) => (
                        <div
                            key={key}
                            className={`landlord-nav-item ${activeTab === key ? 'landlord-active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {icon} {label}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="landlord-main">
                <header className="landlord-main-header">
                    <h1>{tabTitle[activeTab]}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <NotificationBell />
                        <div className="landlord-user-info">
                            <div className="detail-avatar-wrapper">
                                {landlord?.avatar ? (
                                    <img
                                        src={landlord.avatar}
                                        className="detail-avatar-img"
                                        alt="Host"
                                    />
                                ) : (
                                    <div className="detail-avatar-circle">
                                        {landlordInitials}
                                    </div>
                                )}
                            </div>
                            <div className="detail-landlord-info">
                                <h4 className="landlord-name-display">
                                    {landlord?.fullName || landlord?.username || 'Đang tải...'}
                                </h4>
                                <div className="detail-verified-badge">
                                    {/* Giả sử bạn dùng emoji hoặc SVG cho IconVerified */}
                                    <span className="badge-icon">✓</span>
                                    Chủ trọ
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="landlord-content-area">
                    {activeTab === 'dashboard'    && renderDashboard()}
                    {activeTab === 'appointments' && renderAppointments()}
                    {activeTab === 'listings'     && renderListings()}
                    {activeTab === 'messages'     && renderMessages()}
                    {activeTab === 'payments'     && renderPayments()}
                    {activeTab === 'reports'      && renderReports()}
                </div>
            </main>
        </div>
    );
}

export default LandlordDashboard;