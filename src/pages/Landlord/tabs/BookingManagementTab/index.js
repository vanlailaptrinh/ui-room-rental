import React, { useState, useEffect, useCallback } from 'react';
import BookingService from '../../../../services/bookingService';
import './BookingManagementTab.css'

const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

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

const BookingManagementTab = ({ activeTab }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(null);

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
        // Load data khi ở tab appointment HOẶC dashboard (do dashboard có nhúng tab này)
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

    if (loading) return <section className="landlord-card landlord-full-width"><h3>Lịch hẹn từ khách thuê</h3><div className="landlord-ld-loading"><div className="landlord-ld-spinner" /><span>Đang tải...</span></div></section>;
    if (error) return <section className="landlord-card landlord-full-width"><h3>Lịch hẹn từ khách thuê</h3><div className="landlord-ld-error"><span>⚠️ {error}</span><button className="landlord-btn-text" onClick={fetchBookings}>Thử lại</button></div></section>;

    return (
        <section className="landlord-card landlord-full-width">
            <h3>Lịch hẹn từ khách thuê <span className="landlord-ld-count-badge">{bookings.length}</span></h3>
            {bookings.length === 0 ? (
                <div className="landlord-ld-empty"><span>🗓️</span><p>Chưa có lịch hẹn nào được gửi đến.</p></div>
            ) : (
                <div className="landlord-appointment-list">
                    {bookings.map((b) => {
                        const dt = b.bookingTime ? new Date(b.bookingTime) : null;
                        return (
                            <div key={b.id} className={`landlord-appointment-item landlord-ld-item-${b.status?.toLowerCase()}`}>
                                <div className="landlord-date-tag">
                                    {dt ? dt.getDate() : '?'}<br /><span>{dt ? dt.toLocaleString('vi-VN', { month: 'short' }) : ''}</span>
                                </div>
                                <div className="landlord-apt-details">
                                    <h4>{b.post?.title || 'Phòng chưa có tiêu đề'}</h4>
                                    <p>⏰ {dt ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''} &nbsp;•&nbsp; <StatusBadge status={b.status} /></p>
                                    <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>📍 {b.post?.address || '—'} &nbsp;|&nbsp; Đặt lúc: {fmtDate(b.createdAt)}</p>
                                </div>
                                <div className="landlord-apt-actions">
                                    {b.status === 'PENDING' ? (
                                        <>
                                            <button className="landlord-btn-approve" onClick={() => handleApprove(b.id)} disabled={processing === b.id}>{processing === b.id ? '...' : '✓ Duyệt'}</button>
                                            <button className="landlord-btn-danger" onClick={() => handleReject(b.id)} disabled={processing === b.id}>{processing === b.id ? '...' : 'Từ chối'}</button>
                                        </>
                                    ) : (
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

export default BookingManagementTab;