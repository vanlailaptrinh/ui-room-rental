import React, { useState, useEffect, useCallback, useMemo } from 'react';
import BookingService from '../../../../services/bookingService';
import './BookingManagementTab.css';
import LandlordFilterBar from '../../components/LandlordFilterBar';

const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const StatusBadge = ({ status }) => {
    const map = {
        RENTED:    { label: 'Đã thuê',          cls: 'landlord-sb-rented' },
        PENDING:   { label: 'Chờ duyệt',    cls: 'landlord-sb-pending' },
        APPROVED:  { label: 'Đã duyệt',     cls: 'landlord-sb-approved' },
        REJECTED:  { label: 'Từ chối',       cls: 'landlord-sb-rejected' },
        CANCELLED: { label: 'Đã hủy',        cls: 'landlord-sb-cancelled' },
    };
    const { label, cls } = map[status] || { label: status, cls: '' };
    return <span className={`landlord-ld-status-badge ${cls}`}>{label}</span>;
};

const BookingManagementTab = ({ activeTab }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null);

    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const statusOptions = [
        { value: 'ALL', label: 'Tất cả lịch hẹn' },
        { value: 'PENDING', label: '⏳ Chờ duyệt' },
        { value: 'APPROVED', label: '✅ Đã duyệt' },
        { value: 'RENTED', label: 'Đã thuê' },
        { value: 'REJECTED', label: '❌ Từ chối' },
        { value: 'CANCELLED', label: '🚫 Đã hủy' },
    ];

    const sortOptions = [
        { value: 'newest', label: '🗓️ Ngày hẹn gần nhất' },
        { value: 'oldest', label: '🗓️ Ngày hẹn xa nhất' },
    ];

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const res = await BookingService.getLandlordBookings();
            setBookings(res.data || []);
        } catch (err) {
            setError('Không thể tải danh sách. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'appointments' || activeTab === 'dashboard') fetchBookings();
    }, [activeTab, fetchBookings]);

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

    const filteredAndSortedBookings = useMemo(() => {
        return bookings
            .filter((b) => {
                const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
                const title = b.post?.title?.toLowerCase() || '';
                const address = b.post?.address?.toLowerCase() || '';
                const keyword = searchTerm.toLowerCase().trim();
                return matchStatus && (title.includes(keyword) || address.includes(keyword));
            })
            .sort((a, b) => {
                const timeA = new Date(a.bookingTime || 0).getTime();
                const timeB = new Date(b.bookingTime || 0).getTime();
                return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
            });
    }, [bookings, filterStatus, searchTerm, sortBy]);

    if (loading) return <section className="landlord-card landlord-full-width"><h3>Lịch hẹn từ khách thuê</h3><div className="landlord-ld-loading"><div className="landlord-ld-spinner" /><span>Đang tải...</span></div></section>;
    if (error) return <section className="landlord-card landlord-full-width"><h3>Lịch hẹn từ khách thuê</h3><div className="landlord-ld-error"><span>⚠️ {error}</span><button className="landlord-btn-text" onClick={fetchBookings}>Thử lại</button></div></section>;

    return (
        <section className="landlord-card landlord-full-width appointment-unified-form">
            {/* Phần tiêu đề chính */}
            <div className="unified-form-header">
                <h3>Lịch hẹn từ khách thuê <span className="landlord-ld-count-badge">{filteredAndSortedBookings.length}</span></h3>
            </div>

            {/* Thanh bộ lọc nhúng trực tiếp liền mạch */}
            <div className="unified-filter-wrapper">
                <LandlordFilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchPlaceholder="🔍 Tìm theo tiêu đề lịch hẹn, địa chỉ..."
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    statusOptions={statusOptions}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortOptions={sortOptions}
                />
            </div>

            {/* Danh sách các cuộc hẹn được gói gọn gàng */}
            <div className="unified-list-container">
                {filteredAndSortedBookings.length === 0 ? (
                    <div className="landlord-ld-empty">
                        <span>🗓️</span>
                        <p>{bookings.length === 0 ? "Chưa có lịch hẹn nào được gửi đến." : "Không có lịch hẹn nào khớp với bộ lọc hiện tại."}</p>
                    </div>
                ) : (
                    <div className="landlord-appointment-list">
                        {filteredAndSortedBookings.map((b) => {
                            const dt = b.bookingTime ? new Date(b.bookingTime) : null;
                            return (
                                <div key={b.id} className={`landlord-appointment-item landlord-ld-item-${b.status?.toLowerCase()}`}>

                                    {/* Cột 1: Thẻ ngày tháng */}
                                    <div className="landlord-date-tag">
                                        {dt ? dt.getDate() : '?'}<br />
                                        <span>{dt ? dt.toLocaleString('vi-VN', { month: 'short' }) : ''}</span>
                                    </div>

                                    {/* Cột 2: Nội dung chi tiết bài đăng & Thời gian */}
                                    <div className="landlord-apt-details">
                                        <h4>{b.post?.title || 'Phòng chưa có tiêu đề'}</h4>
                                        <div className="apt-time-row">
                                            <span className="time-highlight">⏰ {dt ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            <StatusBadge status={b.status} />
                                        </div>
                                        <p className="apt-address-row">📍 {b.post?.address || '—'}</p>
                                        <p className="apt-created-row">Đặt lúc: {fmtDate(b.createdAt)}</p>
                                    </div>

                                    {/* Cột 3: Nút điều hướng duyệt hoặc thông báo trạng thái */}
                                    <div className="landlord-apt-actions">
                                        {b.status === 'PENDING' ? (
                                            <div className="action-button-group">
                                                <button className="landlord-btn-approve" onClick={() => handleApprove(b.id)} disabled={processing === b.id}>
                                                    {processing === b.id ? '...' : '✓ Duyệt'}
                                                </button>
                                                <button className="landlord-btn-danger" onClick={() => handleReject(b.id)} disabled={processing === b.id}>
                                                    {processing === b.id ? '...' : 'Từ chối'}
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`status-text-final status-${b.status?.toLowerCase()}`}>
                                                {b.status === 'APPROVED' ? '✓ Đã đồng ý' : b.status === 'RENTED' ? 'Đã thuê' : b.status === 'REJECTED' ? '✕ Đã từ chối' : '🚫 Đã hủy'}
                                            </span>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default BookingManagementTab;
