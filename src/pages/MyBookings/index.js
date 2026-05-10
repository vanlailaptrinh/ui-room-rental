import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingService from '../../services/bookingService';
import { useAuth } from '../../context/authContext';
import './MyBookings.css';

// Helper: định dạng ngày giờ từ ISO string
const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

// Helper: trạng thái badge
const StatusBadge = ({ status }) => {
    const map = {
        PENDING:   { label: 'Chờ xác nhận', cls: 'badge-pending' },
        APPROVED:  { label: 'Đã duyệt',     cls: 'badge-approved' },
        REJECTED:  { label: 'Từ chối',       cls: 'badge-rejected' },
        CANCELLED: { label: 'Đã hủy',        cls: 'badge-cancelled' },
    };
    const info = map[status] || { label: status, cls: '' };
    return <span className={`status-badge ${info.cls}`}>{info.label}</span>;
};

function MyBookings() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bookings, setBookings]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [cancelling, setCancelling] = useState(null); // id đang hủy

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await BookingService.getMyBookings();
            setBookings(res.data || []);
        } catch (err) {
            console.error('Lỗi lấy danh sách lịch hẹn:', err);
            setError('Không thể tải danh sách lịch hẹn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate, fetchBookings]);

    const handleCancel = async (id) => {
        if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
        try {
            setCancelling(id);
            await BookingService.cancelBooking(id);
            // Cập nhật lại state local thay vì gọi lại API
            setBookings(prev =>
                prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b)
            );
        } catch (err) {
            console.error('Lỗi hủy lịch hẹn:', err);
            alert('Không thể hủy lịch hẹn. Có thể lịch hẹn đã được xử lý rồi.');
        } finally {
            setCancelling(null);
        }
    };

    // ---- RENDER ----
    if (loading) {
        return (
            <div className="my-bookings-page">
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Đang tải lịch hẹn...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-bookings-page">
                <div className="error-state">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={fetchBookings}>Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-bookings-page">
            <div className="page-header">
                <h1>📅 Lịch hẹn của tôi</h1>
                <span className="count-badge">{bookings.length} lịch hẹn</span>
            </div>

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🗓️</div>
                    <h3>Chưa có lịch hẹn nào</h3>
                    <p>Hãy tìm phòng và đặt lịch xem phòng ngay!</p>
                    <button className="btn-primary" onClick={() => navigate('/postlist')}>
                        Tìm phòng ngay
                    </button>
                </div>
            ) : (
                <div className="booking-list">
                    {bookings.map((booking) => (
                        <div key={booking.id} className={`booking-card ${booking.status?.toLowerCase()}`}>
                            {/* Ảnh phòng */}
                            <div className="booking-image">
                                <img
                                    src={booking.post?.images?.[0] || `https://picsum.photos/200/140?random=${booking.id}`}
                                    alt={booking.post?.title || 'Phòng'}
                                />
                            </div>

                            {/* Thông tin */}
                            <div className="booking-info">
                                <div className="booking-top">
                                    <h3
                                        className="booking-title"
                                        onClick={() => booking.post?.id && navigate(`/detail/${booking.post.id}`)}
                                    >
                                        {booking.post?.title || 'Phòng chưa có tiêu đề'}
                                    </h3>
                                    <StatusBadge status={booking.status} />
                                </div>

                                <div className="booking-meta">
                                    <div className="meta-item">
                                        <span className="meta-icon">📍</span>
                                        <span>{booking.post?.address || '—'}</span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-icon">🕐</span>
                                        <span>Lịch hẹn: <strong>{formatDateTime(booking.bookingTime)}</strong></span>
                                    </div>
                                    <div className="meta-item">
                                        <span className="meta-icon">📅</span>
                                        <span>Đặt ngày: {formatDateTime(booking.createdAt)}</span>
                                    </div>
                                    {booking.post?.price && (
                                        <div className="meta-item">
                                            <span className="meta-icon">💰</span>
                                            <span>{booking.post.price.toLocaleString('vi-VN')}đ / tháng</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Hành động */}
                            <div className="booking-actions">
                                <button
                                    className="btn-detail"
                                    onClick={() => booking.post?.id && navigate(`/detail/${booking.post.id}`)}
                                >
                                    Xem phòng
                                </button>
                                {booking.status === 'PENDING' && (
                                    <button
                                        className="btn-cancel"
                                        onClick={() => handleCancel(booking.id)}
                                        disabled={cancelling === booking.id}
                                    >
                                        {cancelling === booking.id ? 'Đang hủy...' : 'Hủy lịch'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookings;
