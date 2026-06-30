import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import BookingService from '../../services/bookingService';
import ReportService from '../../services/reportService';
import './Reports.css';

const MIN_REASON_LENGTH = 10;

const getRenter = (booking) => booking.user || booking.tenant || booking.customer || {};

const getTargetId = (booking, isLandlord) => {
    if (isLandlord) {
        const renter = getRenter(booking);
        return renter.id || booking.userId || booking.tenantId || booking.customerId;
    }
    return booking.post?.id || booking.postId;
};

const buildReportTargets = (bookings, isLandlord) => {
    const targetMap = new Map();

    (bookings || [])
        .filter((booking) => booking.status === 'RENTED')
        .forEach((booking) => {
            const id = getTargetId(booking, isLandlord);
            if (!id || targetMap.has(String(id))) return;

            const renter = getRenter(booking);
            const target = isLandlord
                ? {
                    id,
                    label: renter.username || renter.fullName || renter.email || 'Người thuê',
                    subtitle: renter.email || '',
                    username: renter.username || renter.fullName || renter.email || 'Người thuê',
                    avatar: renter.avatar
                }
                : {
                    id,
                    label: booking.post?.title || 'Phòng trọ',
                    subtitle: booking.post?.address || 'Chưa có địa chỉ',
                    title: booking.post?.title || 'Phòng trọ',
                    address: booking.post?.address || ''
                };

            targetMap.set(String(id), target);
        });

    return Array.from(targetMap.values());
};

function Reports() {
    const { user } = useAuth();
    const location = useLocation();
    const isLandlord = user?.role === 'LANDLORD';
    const targetLabel = isLandlord ? 'người thuê' : 'phòng trọ';

    const [targets, setTargets] = useState([]);
    const [reports, setReports] = useState([]);
    const [targetId, setTargetId] = useState(location.state?.targetId || '');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const loadPage = async () => {
            try {
                setLoading(true);
                setMessage(null);
                const [bookingsResponse, reportsResponse] = await Promise.all([
                    isLandlord ? BookingService.getLandlordBookings() : BookingService.getMyBookings(),
                    ReportService.getMyReports()
                ]);

                setTargets(buildReportTargets(bookingsResponse.data || [], isLandlord));
                setReports(reportsResponse.data || []);
            } catch (error) {
                setMessage({ type: 'error', text: 'Không thể tải dữ liệu báo cáo. Vui lòng thử lại.' });
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [isLandlord]);

    const selectedTarget = useMemo(
        () => targets.find((target) => String(target.id) === String(targetId)),
        [targets, targetId]
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        const normalizedReason = reason.trim();

        if (!targetId || normalizedReason.length < MIN_REASON_LENGTH) {
            setMessage({ type: 'error', text: `Hãy chọn ${targetLabel} và nhập lý do ít nhất 10 ký tự.` });
            return;
        }

        try {
            setSubmitting(true);
            setMessage(null);
            const response = await ReportService.createReport({ targetId, reason: normalizedReason });
            setReports((previous) => [response.data, ...previous]);
            setReason('');
            setTargetId('');
            setMessage({ type: 'success', text: 'Báo cáo đã được gửi và đang chờ quản trị viên xử lý.' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error?.response?.data?.message || `Không thể gửi báo cáo ${targetLabel} này.`
            });
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (value) => value
        ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
        : '';

    return (
        <main className="report-page">
            <header className="report-hero">
                <span className="report-kicker">Trung tâm an toàn</span>
                <h1>{isLandlord ? 'Báo cáo người thuê' : 'Báo cáo phòng trọ'}</h1>
                <p>
                    Chỉ những {targetLabel} đã có booking RENTED mới được hiển thị để báo cáo.
                    Mỗi báo cáo sẽ được ADMIN xem xét.
                </p>
            </header>

            {message && <div className={`report-alert report-alert-${message.type}`}>{message.text}</div>}

            <div className="report-grid">
                <section className="report-card">
                    <div className="report-card-heading">
                        <span className="material-symbols-outlined">flag</span>
                        <div>
                            <h2>Tạo báo cáo mới</h2>
                            <p>Chọn đúng {targetLabel} đã thuê và mô tả sự việc rõ ràng.</p>
                        </div>
                    </div>

                    <form className="report-form" onSubmit={handleSubmit}>
                        <label htmlFor="report-target">{isLandlord ? 'Tài khoản người thuê' : 'Phòng / bài đăng'}</label>
                        <select
                            id="report-target"
                            value={targetId}
                            onChange={(event) => setTargetId(event.target.value)}
                            disabled={loading || submitting}
                            required
                        >
                            <option value="">-- Chọn {targetLabel} --</option>
                            {targets.map((target) => (
                                <option key={target.id} value={target.id}>
                                    {target.subtitle ? `${target.label} - ${target.subtitle}` : target.label}
                                </option>
                            ))}
                        </select>

                        {selectedTarget && (
                            <div className="report-target-preview">
                                <div className="report-avatar">
                                    {isLandlord && selectedTarget.avatar
                                        ? <img src={selectedTarget.avatar} alt={selectedTarget.label} />
                                        : <span className="material-symbols-outlined">{isLandlord ? 'person' : 'home'}</span>}
                                </div>
                                <div>
                                    <strong>{selectedTarget.label}</strong>
                                    <span>{selectedTarget.subtitle}</span>
                                </div>
                            </div>
                        )}

                        {!loading && targets.length === 0 && (
                            <div className="report-target-preview">
                                Bạn chưa có {targetLabel} nào ở trạng thái RENTED để báo cáo.
                            </div>
                        )}

                        <label htmlFor="report-reason">Lý do báo cáo</label>
                        <textarea
                            id="report-reason"
                            value={reason}
                            onChange={(event) => setReason(event.target.value.slice(0, 1000))}
                            placeholder="Mô tả hành vi, thời điểm và thông tin liên quan..."
                            minLength={MIN_REASON_LENGTH}
                            maxLength={1000}
                            rows={7}
                            disabled={submitting}
                            required
                        />
                        <div className="report-form-meta">
                            <span>Tối thiểu {MIN_REASON_LENGTH} ký tự</span>
                            <span>{reason.length}/1000</span>
                        </div>
                        <button className="report-submit" type="submit" disabled={submitting || loading || targets.length === 0}>
                            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                        </button>
                    </form>
                </section>

                <section className="report-card report-history">
                    <div className="report-card-heading">
                        <span className="material-symbols-outlined">history</span>
                        <div>
                            <h2>Lịch sử của tôi</h2>
                            <p>Theo dõi trạng thái các báo cáo đã gửi.</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="report-empty">Đang tải dữ liệu...</div>
                    ) : reports.length === 0 ? (
                        <div className="report-empty">
                            <span className="material-symbols-outlined">inbox</span>
                            <p>Bạn chưa gửi báo cáo nào.</p>
                        </div>
                    ) : (
                        <div className="report-list">
                            {reports.map((report) => (
                                <article className="report-item" key={report.id}>
                                    <div className="report-item-top">
                                        <strong>
                                            {report.type === 'ROOM'
                                                ? (report.targetTitle || 'Phòng không còn tồn tại')
                                                : (report.targetUsername || 'Tài khoản không còn tồn tại')}
                                        </strong>
                                        <span className={`report-status report-status-${report.status?.toLowerCase()}`}>
                                            {report.status === 'RESOLVED' ? 'Đã xử lý' : 'Đang chờ'}
                                        </span>
                                    </div>
                                    <p>{report.reason}</p>
                                    <time>{formatDate(report.createdAt)}</time>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export default Reports;
