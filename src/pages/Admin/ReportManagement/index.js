import React, { useEffect, useMemo, useState } from 'react';
import ReportService from '../../../services/reportService';
import './ReportManagement.css';

function ReportManagement() {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState(null);
    const [error, setError] = useState('');

    const loadReports = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await ReportService.getAllReports();
            setReports(response.data || []);
        } catch (requestError) {
            setError('Không thể tải danh sách báo cáo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const visibleReports = useMemo(() => filter === 'ALL'
        ? reports
        : reports.filter(report => report.status === filter), [reports, filter]);

    const pendingCount = reports.filter(report => report.status === 'PENDING').length;

    const handleResolve = async (report) => {
        if (!window.confirm('Xác nhận báo cáo này đã được xem xét và xử lý?')) return;
        try {
            setResolvingId(report.id);
            const response = await ReportService.resolveReport(report.id);
            setReports(current => current.map(item => item.id === report.id ? response.data : item));
        } catch (requestError) {
            alert(requestError?.response?.data?.message || 'Không thể cập nhật báo cáo.');
        } finally {
            setResolvingId(null);
        }
    };

    const formatDate = value => new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short', timeStyle: 'short'
    }).format(new Date(value));

    return (
        <main className="admin-report-page">
            <header className="admin-report-header">
                <div>
                    <h1>Quản lý Báo cáo</h1>
                    <p>ADMIN xem xét báo cáo phòng từ USER và báo cáo người thuê từ LANDLORD.</p>
                </div>
                <div className="admin-report-pending"><strong>{pendingCount}</strong><span>Đang chờ xử lý</span></div>
            </header>

            <div className="admin-report-toolbar">
                {['PENDING', 'RESOLVED', 'ALL'].map(value => (
                    <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>
                        {value === 'PENDING' ? 'Đang chờ' : value === 'RESOLVED' ? 'Đã xử lý' : 'Tất cả'}
                    </button>
                ))}
                <button className="admin-report-refresh" onClick={loadReports}>Làm mới</button>
            </div>

            {loading ? <div className="admin-report-state">Đang tải báo cáo...</div>
                : error ? <div className="admin-report-state admin-report-error">{error}</div>
                : visibleReports.length === 0 ? <div className="admin-report-state">Không có báo cáo trong nhóm này.</div>
                : (
                    <div className="admin-report-table-wrap">
                        <table className="admin-report-table">
                            <thead><tr><th>Người gửi</th><th>Đối tượng báo cáo</th><th>Lý do</th><th>Thời gian</th><th>Trạng thái</th><th></th></tr></thead>
                            <tbody>{visibleReports.map(report => (
                                <tr key={report.id}>
                                    <td><strong>{report.reporterUsername || 'Không xác định'}</strong><span>{report.reporterRole}</span></td>
                                    <td>
                                        <span className={`admin-report-type type-${report.type?.toLowerCase()}`}>{report.type === 'ROOM' ? 'Phòng' : 'USER'}</span>
                                        <strong>{report.type === 'ROOM' ? report.targetTitle : report.targetUsername}</strong>
                                        {report.type === 'ROOM' && report.targetUsername && <span>Chủ trọ: {report.targetUsername}</span>}
                                    </td>
                                    <td className="admin-report-reason">{report.reason}</td>
                                    <td>{formatDate(report.createdAt)}</td>
                                    <td><span className={`admin-report-status status-${report.status?.toLowerCase()}`}>{report.status === 'PENDING' ? 'Đang chờ' : 'Đã xử lý'}</span></td>
                                    <td>{report.status === 'PENDING' && (
                                        <button className="admin-report-resolve" disabled={resolvingId === report.id} onClick={() => handleResolve(report)}>
                                            {resolvingId === report.id ? 'Đang lưu...' : 'Đánh dấu đã xử lý'}
                                        </button>
                                    )}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
        </main>
    );
}

export default ReportManagement;
