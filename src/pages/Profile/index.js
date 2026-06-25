import React, { useState, useEffect } from 'react';
import './Profile.css';
import { IconChevronRight } from '../../assets/Icons';
import PropertyCard from "../../components/PropertyCard";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useNotification, NOTI_CONFIG } from '../../context/notificationContext';
import UserService from '../../services/userService';
import PostService from '../../services/postService';
import FavoriteService from '../../services/favoriteService';
import BookingService from '../../services/bookingService';

const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

const getStatusInfo = (status) => {
    const map = {
        PENDING:   { label: 'Chờ xác nhận', cls: 'badge-pending' },
        APPROVED:  { label: 'Đã duyệt',     cls: 'badge-approved' },
        REJECTED:  { label: 'Từ chối',       cls: 'badge-rejected' },
        CANCELLED: { label: 'Đã hủy',        cls: 'badge-cancelled' },
    };
    return map[status] || { label: status, cls: '' };
};

function Profile() {
    const [activeTab, setActiveTab] = useState('personal');
    const { user, logout, refreshUserProfile } = useAuth();
    const { notifications, unreadCount, markRead, markAllRead } = useNotification();
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [viewHistory, setViewHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);

    const [formData, setFormData] = useState({
        username: '',
        phone: ''
    });

    useEffect(() => {
        const fetchFullProfile = async () => {
            try {
                const res = await UserService.getUserProfile();
                const userData = res.data || res;

                setFormData({
                    username: userData.username || userData.fullName || '',
                    phone: userData.phone || ''
                });
            } catch (error) {
                console.error(error);
            }
        };

        const fetchFavorites = async () => {
            try {
                setIsLoadingFavorites(true);
                const response = await FavoriteService.getMyFavorites();
                setFavorites(response.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingFavorites(false);
            }
        };

        fetchFullProfile();
        fetchFavorites();
    }, []);

    useEffect(() => {
        if (activeTab === 'history') {
            const fetchHistory = async () => {
                try {
                    setIsLoadingHistory(true);
                    const response = await PostService.getPostHistory();
                    setViewHistory(response.data || []);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoadingHistory(false);
                }
            };
            fetchHistory();
        }

        if (activeTab === 'calendar') {
            const fetchBookings = async () => {
                try {
                    setIsLoadingBookings(true);
                    const response = await BookingService.getMyBookings();
                    setBookings(response.data || []);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoadingBookings(false);
                }
            };
            fetchBookings();
        }
    }, [activeTab]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            setIsSaving(true);
            const data = new FormData();
            data.append('username', formData.username);
            data.append('phone', formData.phone);

            const response = await UserService.updateProfile(data);

            if (response.code === 200) {
                alert("Cập nhật thông tin thành công!");
                await refreshUserProfile();
            }
        } catch (error) {
            console.error(error);
            alert("Cập nhật thất bại. Vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn xem phòng này?")) return;
        try {
            setCancellingId(id);
            await BookingService.cancelBooking(id);
            setBookings(prev =>
                prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
            );
        } catch (error) {
            console.error(error);
            alert("Hủy lịch hẹn không thành công. Có thể lịch hẹn đã được phía chủ nhà xử lý.");
        } finally {
            setCancellingId(null);
        }
    };

    const handleTabChange = (e, tabName) => {
        e.preventDefault();
        setActiveTab(tabName);
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    return (
        <main className="account-container">
            <aside className="account-sidebar">
                <div className="sidebar-header">
                    <span className="account-type">Tài khoản sinh viên</span>
                    <p className="account-desc">Quản lý không gian của bạn</p>
                </div>

                <nav className="sidebar-nav">
                    <a
                        href="#personal"
                        className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'personal')}
                    >
                        <span className="material-symbols-outlined">person</span>
                        Thông tin cá nhân
                    </a>
                    <a
                        href="#favorite"
                        className={`nav-item ${activeTab === 'favorite' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'favorite')}
                    >
                        <span className="material-symbols-outlined">favorite</span>
                        Phòng yêu thích
                    </a>
                    <a
                        href="#history"
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'history')}
                    >
                        <span className="material-symbols-outlined">history</span>
                        Lịch sử xem phòng
                    </a>
                    <a
                        href="#calendar"
                        className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'calendar')}
                    >
                        <span className="material-symbols-outlined">calendar_month</span>
                        Lịch hẹn
                    </a>
                    <a
                        href="#Notification"
                        className={`nav-item ${activeTab === 'Notification' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'Notification')}
                    >
                        <span className="material-symbols-outlined">notifications</span>
                        Thông báo
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogoutClick} className="btn-secondary-full">Đăng xuất</button>
                </div>
            </aside>

            <section className="account-content">
                {activeTab === 'personal' && (
                    <div className="fade-in-animation">
                        <header className="content-header">
                            <h1>Thông tin tài khoản</h1>
                        </header>

                        <div className="account-card main-form">
                            <div className="avatar-section">
                                <div className="avatar-wrapper">
                                    <img
                                        src={user?.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=150"}
                                        alt="Avatar"
                                    />
                                    <button className="btn-edit-avatar">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                </div>
                                <div className="avatar-text">
                                    <h3>Ảnh đại diện</h3>
                                    <p>PNG, JPG tối đa 5MB.</p>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Email liên hệ</label>
                                    <input type="email" value={user?.email || ''} readOnly className="readonly-input"/>
                                </div>
                                <div className="input-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-ghost" onClick={() => window.location.reload()}>Hủy bỏ</button>
                                <button className="btn-primary-lg" onClick={handleSaveChanges} disabled={isSaving}>
                                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>

                        <div className="saved-section">
                            <div className="section-flex-header">
                                <h2>Phòng đã lưu gần đây</h2>
                                <button className="btn-text" onClick={(e) => handleTabChange(e, 'favorite')}>
                                    Xem tất cả <IconChevronRight width="16"/>
                                </button>
                            </div>

                            <div className="saved-grid">
                                {favorites && favorites.length > 0 ? (
                                    favorites.slice(0, 3).map((item) => (
                                        <PropertyCard key={item.id} data={item.post} />
                                    ))
                                ) : (
                                    <p className="txt-muted-sm">Chưa có phòng nào được lưu.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="fade-in-animation booking-tab-container">
                        <header className="booking-tab-header">
                            <div className="header-title-block">
                                <h1>📅 Lịch hẹn của tôi</h1>
                                <p className="header-subtitle">Theo dõi và quản lý tiến độ các buổi gặp mặt xem phòng trực tiếp.</p>
                            </div>
                            <span className="booking-count-indicator">
                                {bookings.length} lịch hẹn
                            </span>
                        </header>

                        <div className="booking-dashboard-layout">
                            <div className="booking-cards-list">
                                {isLoadingBookings ? (
                                    <div className="loading-spinner-box">
                                        <div className="spinner-element"></div>
                                        <span>Đang tải danh sách lịch hẹn...</span>
                                    </div>
                                ) : bookings && bookings.length > 0 ? (
                                    bookings.map((item) => {
                                        const statusInfo = getStatusInfo(item.status);
                                        return (
                                            <div className={`booking-item-card ${item.status?.toLowerCase()}`} key={item.id}>
                                                <div className="booking-thumb-wrapper">
                                                    <img
                                                        alt={item.post?.title || 'Hình ảnh phòng'}
                                                        src={item.post?.images?.[0] || item.post?.thumbnail || `https://picsum.photos/200/140?random=${item.id}`}
                                                    />
                                                </div>

                                                <div className="booking-details-content">
                                                    <div className="details-header-row">
                                                        <h3 onClick={() => item.post?.id && navigate(`/detail/${item.post.id}`)}>
                                                            {item.post?.title || 'Phòng chưa có tiêu đề'}
                                                        </h3>
                                                        <span className={`status-badge-pill ${statusInfo.cls}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                    </div>

                                                    <p className="booking-location-text">
                                                        <span className="material-symbols-outlined icon-red">location_on</span>
                                                        {item.post?.address || 'Chưa cập nhật địa chỉ'}
                                                    </p>

                                                    <div className="booking-info-tags-grid">
                                                        <div className="info-tag-line">
                                                            <span className="material-symbols-outlined">schedule</span>
                                                            <span>Thời gian hẹn: <strong>{formatDateTime(item.bookingTime)}</strong></span>
                                                        </div>
                                                        <div className="info-tag-line">
                                                            <span className="material-symbols-outlined">calendar_today</span>
                                                            <span>Ngày đăng ký: {formatDateTime(item.createdAt)}</span>
                                                        </div>
                                                        {item.post?.price && (
                                                            <div className="info-tag-line price-highlight">
                                                                <span className="material-symbols-outlined">payments</span>
                                                                <span>{item.post.price.toLocaleString('vi-VN')}đ / tháng</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="booking-action-footer">
                                                        {item.status === 'PENDING' && (
                                                            <button
                                                                className="btn-outline-danger"
                                                                onClick={() => handleCancelBooking(item.id)}
                                                                disabled={cancellingId === item.id}
                                                            >
                                                                {cancellingId === item.id ? 'Đang xử lý...' : 'Hủy lịch hẹn'}
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn-solid-primary"
                                                            onClick={() => item.post?.id && navigate(`/detail/${item.post.id}`)}
                                                        >
                                                            Xem chi tiết phòng
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="booking-empty-state">
                                        <span className="material-symbols-outlined empty-icon-large">calendar_today</span>
                                        <h3>Danh sách lịch hẹn trống</h3>
                                        <p>Bạn chưa thực hiện cuộc hẹn xem phòng nào. Khám phá các căn phòng phù hợp xung quanh bạn ngay!</p>
                                        <button
                                            className="btn-primary-action-lg"
                                            onClick={() => navigate('/postlist')}
                                        >
                                            Tìm phòng ngay
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="saved-section fade-in-animation">
                        <div className="section-flex-header">
                            <h2>Lịch sử xem phòng</h2>
                        </div>

                        {isLoadingHistory ? (
                            <div className="loading-spinner-box">Đang tải lịch sử...</div>
                        ) : viewHistory && viewHistory.length > 0 ? (
                            <div className="saved-grid">
                                {viewHistory.map((item) => (
                                    <PropertyCard
                                        key={item.id}
                                        data={item.post}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="booking-empty-state">
                                <span className="material-symbols-outlined empty-icon-large">history</span>
                                <p>Bạn chưa truy cập xem chi tiết phòng nào gần đây.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'favorite' && (
                    <div className="saved-section fade-in-animation">
                        <div className="section-flex-header">
                            <h2>Phòng đã lưu điều hướng</h2>
                        </div>

                        {isLoadingFavorites ? (
                            <div className="loading-spinner-box">Đang tải danh sách yêu thích...</div>
                        ) : favorites && favorites.length > 0 ? (
                            <div className="saved-grid">
                                {favorites.map((item) => (
                                    <PropertyCard
                                        key={item.id}
                                        data={item.post}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="booking-empty-state">
                                <span className="material-symbols-outlined empty-icon-large">favorite_border</span>
                                <p>Danh sách phòng yêu thích hiện tại đang trống.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'Notification' && (
                    <div className="fade-in-animation notification-tab-container">
                        <header className="booking-tab-header">
                            <div className="header-title-block">
                                <h1>🔔 Thông báo của bạn</h1>
                                <p className="header-subtitle">Cập nhật trạng thái lịch hẹn và tin nhắn thời gian thực.</p>
                            </div>
                            {unreadCount > 0 && (
                                <button className="btn-mark-all-read" onClick={markAllRead}>
                                    <span className="material-symbols-outlined">done_all</span>
                                    Đánh dấu đã đọc tất cả ({unreadCount})
                                </button>
                            )}
                        </header>

                        <div className="notification-list">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((noti) => {
                                    const config = NOTI_CONFIG[noti.type] || {
                                        icon: '📢',
                                        color: '#475569',
                                        bg: '#f8fafc',
                                        label: 'Hệ thống'
                                    };

                                    return (
                                        <div
                                            key={noti.id}
                                            className={`notification-item-card ${noti.isRead ? 'read' : 'unread'}`}
                                            onClick={() => !noti.isRead && markRead(noti.id)}
                                        >
                                            <div
                                                className="noti-icon-badge"
                                                style={{ backgroundColor: config.bg, color: config.color }}
                                            >
                                                <span className="noti-emoji">{config.icon}</span>
                                            </div>

                                            <div className="noti-main-content">
                                                <div className="noti-meta-row">
                                                    <span className="noti-type-tag" style={{ color: config.color }}>
                                                        {config.label}
                                                    </span>
                                                    <span className="noti-time-text">
                                                        {formatDateTime(noti.createdAt)}
                                                    </span>
                                                </div>
                                                <h3 className="noti-title">{noti.title}</h3>
                                                <p className="noti-message">{noti.message || noti.content}</p>
                                            </div>

                                            {!noti.isRead && <div className="unread-dot-indicator"></div>}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="booking-empty-state">
                                    <span className="material-symbols-outlined empty-icon-large">notifications_off</span>
                                    <h3>Hộp thư trống</h3>
                                    <p>Bạn không có thông báo nào vào lúc này. Mọi cập nhật quan trọng sẽ xuất hiện ở đây.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Profile;