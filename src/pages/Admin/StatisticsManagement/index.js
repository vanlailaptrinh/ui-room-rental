import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import './StatisticsManagement.css';

// Import đầy đủ các Services từ hệ thống của bạn
import FinanceService from '../../../services/financeService';
import PostService from '../../../services/postService';
import OrderService from '../../../services/orderService';
import BookingService from '../../../services/bookingService';
import VoucherService from '../../../services/voucherService';
import AmenityService from '../../../services/amenityService';
import UserService from '../../../services/userService';
import ReportService from '../../../services/reportService';

// Đăng ký các thành phần bắt buộc của Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const StatisticsManagement = () => {
    const [activeTab, setActiveTab] = useState('finance');
    const [loading, setLoading] = useState(false);

    // --- State lưu trữ dữ liệu API ---
    const [financePeriod, setFinancePeriod] = useState('month'); // month | quarter | year
    const [financeData, setFinanceData] = useState([]);
    const [posts, setPosts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);

    // --- Fetch dữ liệu tương ứng với từng Tab để tối ưu hiệu năng ---
    useEffect(() => {
        const fetchTabData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'finance') {
                    let res;
                    if (financePeriod === 'month') res = await FinanceService.getFinanceStatsByMonth();
                    else if (financePeriod === 'quarter') res = await FinanceService.getFinanceStatsByQuarter();
                    else res = await FinanceService.getFinanceStatsByYear();
                    setFinanceData(res?.data || []);
                } 
                else if (activeTab === 'posts') {
                    const [resPosts, resAmenities] = await Promise.all([
                        PostService.getPosts(),
                        AmenityService.getAmenities()
                    ]);
                    setPosts(resPosts?.data || []);
                    setAmenities(resAmenities?.data || []);
                } 
                else if (activeTab === 'orders') {
                    const resOrders = await OrderService.getOrders();
                    setOrders(resOrders?.data || []);
                } 
                else if (activeTab === 'bookings') {
                    const [resBookings, resVouchers] = await Promise.all([
                        BookingService.getLandlordBookings(), 
                        VoucherService.getVouchers()
                    ]);
                    setBookings(resBookings?.data || []);
                    setVouchers(resVouchers?.data || []);
                }
                else if (activeTab === 'users') {
                    const resUsers = await UserService.getUsers(); // Giả định API lấy danh sách user
                    setUsers(resUsers?.data || []);
                }
                else if (activeTab === 'reports') {
                    const resReports = await ReportService.getReports(); // Giả định API lấy danh sách báo cáo vi phạm
                    setReports(resReports?.data || []);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTabData();
    }, [activeTab, financePeriod]);

    // ==========================================
    // TAB 1: TÀI CHÍNH (LINE CHART)
    // ==========================================
    const renderFinanceChart = () => {
        const labels = financeData.map(item => item.label);
        const revenues = financeData.map(item => item.revenue);

        const data = {
            labels,
            datasets: [
                {
                    fill: true,
                    label: 'Doanh thu thực tế (VND)',
                    data: revenues,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.3,
                }
            ]
        };

        const totalRevenue = revenues.reduce((a, b) => a + b, 0);

        return (
            <div className="card shadow-sm p-4 custom-chart-card">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <div>
                        <h5 className="card-title fw-bold mb-1 text-dark-blue">Thống Kê Doanh Thu Biến Động</h5>
                        <p className="text-muted small mb-0">Tổng doanh thu kỳ này: <strong className="text-success">{totalRevenue.toLocaleString()} VND</strong></p>
                    </div>
                    <div className="btn-group" role="group">
                        <button onClick={() => setFinancePeriod('month')} className={`btn btn-sm ${financePeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}>Theo Tháng</button>
                        <button onClick={() => setFinancePeriod('quarter')} className={`btn btn-sm ${financePeriod === 'quarter' ? 'btn-primary' : 'btn-outline-primary'}`}>Theo Quý</button>
                        <button onClick={() => setFinancePeriod('year')} className={`btn btn-sm ${financePeriod === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}>Theo Năm</button>
                    </div>
                </div>
                <div className="chart-container" style={{ height: '350px' }}>
                    {labels.length > 0 ? <Line data={data} options={{ responsive: true, maintainAspectRatio: false }} /> : <p className="text-center py-5 text-muted">Không có dữ liệu hiển thị</p>}
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB 2: BÀI ĐĂNG (PIE CHART)
    // ==========================================
    const renderPostsChart = () => {
        const statusCounts = posts.reduce((acc, curr) => {
            const status = curr.status || 'PENDING';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const dataPie = {
            labels: Object.keys(statusCounts),
            datasets: [
                {
                    data: Object.values(statusCounts),
                    backgroundColor: ['#ffc107', '#28a745', '#dc3545', '#6c757d'],
                }
            ]
        };

        return (
            <div className="row">
                <div className="col-md-5 mb-4">
                    <div className="card shadow-sm p-4 h-100 custom-chart-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Tỷ Lệ Trạng Thái Bài Đăng</h5>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '280px' }}>
                            {posts.length > 0 ? <Pie data={dataPie} /> : <p className="text-muted">Chưa có dữ liệu bài đăng</p>}
                        </div>
                    </div>
                </div>
                <div className="col-md-7 mb-4">
                    <div className="card shadow-sm p-4 h-100 custom-table-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Tổng Quan Hệ Thống Phòng Trọ</h5>
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="p-3 bg-light rounded text-center">
                                    <h3 className="fw-bold text-primary mb-1">{posts.length}</h3>
                                    <span className="small text-muted">Tổng số tin đăng</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded text-center">
                                    <h3 className="fw-bold text-warning mb-1">{statusCounts['PENDING'] || 0}</h3>
                                    <span className="small text-muted">Tin chờ phê duyệt</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded text-center">
                                    <h3 className="fw-bold text-success mb-1">{statusCounts['APPROVED'] || statusCounts['ACTIVE'] || 0}</h3>
                                    <span className="small text-muted">Tin đang hoạt động</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded text-center">
                                    <h3 className="fw-bold text-secondary mb-1">{amenities.length}</h3>
                                    <span className="small text-muted">Danh mục tiện ích</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB 3: ĐƠN HÀNG DỊCH VỤ (DOUGHNUT CHART)
    // ==========================================
    const renderOrdersChart = () => {
        const orderStatuses = orders.reduce((acc, curr) => {
            const status = curr.status || 'PENDING';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const dataDoughnut = {
            labels: Object.keys(orderStatuses),
            datasets: [
                {
                    data: Object.values(orderStatuses),
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 1,
                }
            ]
        };

        return (
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm p-4 text-center custom-chart-card">
                        <h5 className="card-title fw-bold mb-3 text-start text-dark-blue">Tỷ Lệ Trạng Thái Đơn Hàng</h5>
                        <div className="d-flex justify-content-center" style={{ height: '280px' }}>
                            {orders.length > 0 ? <Doughnut data={dataDoughnut} /> : <p className="text-muted py-5">Không có dữ liệu đơn hàng</p>}
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4">
                    <div className="card shadow-sm p-4 h-100 custom-table-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Danh Sách Đơn Mới Nhất</h5>
                        <div className="table-responsive" style={{ maxHeight: '280px' }}>
                            <table className="table table-hover align-middle small custom-table">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th>Mã Đơn</th>
                                        <th>Tổng Giá</th>
                                        <th>Trạng Thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 6).map(order => (
                                        <tr key={order.id}>
                                            <td className="text-truncate" style={{ maxWidth: '100px' }}>{order.id}</td>
                                            <td className="fw-bold text-primary">{order.totalPrice?.toLocaleString()} đ</td>
                                            <td>
                                                <span className={`badge ${order.status === 'SUCCESS' ? 'bg-success' : order.status === 'PENDING' ? 'bg-warning' : 'bg-danger'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && <tr><td colSpan="3" className="text-center text-muted">Trống</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB 4: LỊCH HẸN & VOUCHER (BAR CHART)
    // ==========================================
    const renderBookingsChart = () => {
        const voucherLabels = vouchers.slice(0, 5).map((_, index) => `Voucher #${index + 1}`);
        const usedCounts = vouchers.slice(0, 5).map(v => v.usedCount || 0);
        const totalCounts = vouchers.slice(0, 5).map(v => v.quantity || 0);

        const dataBar = {
            labels: voucherLabels,
            datasets: [
                {
                    label: 'Đã sử dụng',
                    data: usedCounts,
                    backgroundColor: 'rgba(40, 167, 69, 0.7)',
                },
                {
                    label: 'Tổng số phát hành',
                    data: totalCounts,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                }
            ]
        };

        return (
            <div className="row">
                <div className="col-md-7 mb-4">
                    <div className="card shadow-sm p-4 custom-chart-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Hiệu Suất Sử Dụng Top Voucher</h5>
                        <div style={{ height: '280px' }}>
                            {vouchers.length > 0 ? <Bar data={dataBar} options={{ responsive: true, maintainAspectRatio: false }} /> : <p className="text-center py-5 text-muted">Không có dữ liệu Voucher</p>}
                        </div>
                    </div>
                </div>
                <div className="col-md-5 mb-4">
                    <div className="card shadow-sm p-4 h-100 custom-table-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Tình Trạng Xem Phòng (Bookings)</h5>
                        <div className="p-3 border rounded mb-3 bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-semibold text-secondary">Tổng số lượt đặt lịch:</span>
                                <span className="badge bg-primary fs-6">{bookings.length}</span>
                            </div>
                        </div>
                        <ul className="list-group list-group-flush small">
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Chờ chủ nhà duyệt (PENDING)
                                <span className="badge bg-warning rounded-pill">{bookings.filter(b => b.status === 'PENDING').length}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Đã chấp nhận lịch (APPROVED)
                                <span className="badge bg-success rounded-pill">{bookings.filter(b => b.status === 'APPROVED').length}</span>
                            </li>
                            <li className="list-group-item d-flex justify-content-between align-items-center">
                                Đã hủy/Từ chối (CANCELLED/REJECTED)
                                <span className="badge bg-danger rounded-pill">{bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB MỚI 5: THỐNG KÊ NGƯỜI DÙNG (USERS)
    // ==========================================
    const renderUsersChart = () => {
        // Gom nhóm theo Role (Ví dụ: ROLE_USER là sinh viên, ROLE_LANDLORD là chủ nhà)
        const roleCounts = users.reduce((acc, curr) => {
            const role = curr.role === 'ROLE_LANDLORD' ? 'Chủ nhà' : 'Sinh viên/Khách';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        const activeCounts = users.filter(u => u.active !== false).length;
        const blockedCounts = users.length - activeCounts;

        const dataUsersPie = {
            labels: Object.keys(roleCounts).length > 0 ? Object.keys(roleCounts) : ['Sinh viên', 'Chủ nhà'],
            datasets: [
                {
                    data: Object.keys(roleCounts).length > 0 ? Object.values(roleCounts) : [0, 0],
                    backgroundColor: ['#4e73df', '#36b9cc'],
                }
            ]
        };

        return (
            <div className="row">
                <div className="col-md-5 mb-4">
                    <div className="card shadow-sm p-4 h-100 custom-chart-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Phân Hệ Vai Trò Thành Viên</h5>
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '280px' }}>
                            {users.length > 0 ? <Pie data={dataUsersPie} /> : <p className="text-muted">Chưa có dữ liệu thành viên</p>}
                        </div>
                    </div>
                </div>
                <div className="col-md-7 mb-4">
                    <div className="card shadow-sm p-4 h-100 custom-table-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Trạng Thái & Quản Lý Tài Khoản</h5>
                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <div className="card mini-status-card bg-gradient-blue text-white p-3 text-center">
                                    <h4 className="fw-bold mb-0">{users.length}</h4>
                                    <span className="small text-white-50">Tổng tài khoản</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="card mini-status-card bg-gradient-purple text-white p-3 text-center">
                                    <h4 className="fw-bold mb-0">{activeCounts}</h4>
                                    <span className="small text-white-50">Đang hoạt động</span>
                                </div>
                            </div>
                        </div>
                        <h6 className="fw-bold text-secondary mb-2 small">Tài khoản vi phạm/bị khóa tạm thời:</h6>
                        <div className="p-3 bg-danger-light rounded d-flex justify-content-between align-items-center">
                            <span className="text-danger small fw-semibold">Tài khoản đang bị vô hiệu hóa (Banned):</span>
                            <span className="badge bg-danger fs-6 rounded-pill">{blockedCounts}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB MỚI 6: BÁO CÁO VI PHẠM (REPORTS)
    // ==========================================
    const renderReportsChart = () => {
        // Gom nhóm lý do báo cáo (Fake dữ liệu mẫu nếu API trả rỗng)
        const reasonCounts = reports.reduce((acc, curr) => {
            const reason = curr.reason || 'Khác';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {});

        const pendingReports = reports.filter(r => r.status === 'PENDING' || !r.status).length;

        const dataReportsBar = {
            labels: Object.keys(reasonCounts).length > 0 ? Object.keys(reasonCounts).slice(0, 5) : ['Tin giả', 'Sai giá', 'Phòng đã cho thuê', 'Chủ nhà lừa đảo'],
            datasets: [
                {
                    label: 'Số lượt báo cáo',
                    data: Object.keys(reasonCounts).length > 0 ? Object.values(reasonCounts).slice(0, 5) : [12, 5, 8, 2],
                    backgroundColor: '#e74a3b',
                }
            ]
        };

        return (
            <div className="row">
                <div className="col-md-7 mb-4">
                    <div className="card shadow-sm p-4 custom-chart-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Phân Tích Nội Dung Báo Cáo Phổ Biến</h5>
                        <div style={{ height: '280px' }}>
                            <Bar data={dataReportsBar} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
                <div className="col-md-5 mb-4">
                    <div className="card shadow-sm p-4 h-100 custom-table-card">
                        <h5 className="card-title fw-bold mb-3 text-dark-blue">Phiếu Báo Cáo Chờ Xử Lý</h5>
                        <div className="card mini-status-card bg-gradient-red text-white p-3 text-center mb-3">
                            <h4 className="fw-bold mb-0">{pendingReports || reports.length}</h4>
                            <span className="small text-white-50">Báo cáo vi phạm chưa xử lý</span>
                        </div>
                        <div className="table-responsive" style={{ maxHeight: '180px' }}>
                            <table className="table table-hover align-middle small custom-table">
                                <thead className="table-light sticky-top">
                                    <tr>
                                        <th>Lý do</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.slice(0, 4).map((report, idx) => (
                                        <tr key={report.id || idx}>
                                            <td className="text-truncate-custom italic-reason">{report.reason || "Nội dung không hợp lệ"}</td>
                                            <td>
                                                <span className="badge bg-light text-danger border border-danger">Pending</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && (
                                        <tr>
                                            <td colSpan="2" className="text-center text-muted py-3">Hệ thống sạch, chưa có báo cáo vi phạm nào!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container-fluid py-4 statistics-management-wrapper">
            {/* Header trang */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1">Trung Tâm Báo Cáo & Thống Kê</h3>
                    <p className="text-muted small mb-0">Dữ liệu phân tích thời gian thực tổng hợp từ các module dịch vụ.</p>
                </div>
            </div>

            {/* Thanh điều hướng Tab Control (Hỗ trợ 6 Tab toàn diện) */}
            <ul className="nav nav-tabs border-bottom-0 custom-admin-tabs mb-4">
                <li className="nav-item me-2">
                    <button onClick={() => setActiveTab('finance')} className={`nav-link border-0 px-4 py-2 rounded-pill fw-semibold ${activeTab === 'finance' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-light'}`}>
                        💰 Doanh Thu Tài Chính
                    </button>
                </li>
                <li className="nav-item me-2">
                    <button onClick={() => setActiveTab('posts')} className={`nav-link border-0 px-4 py-2 rounded-pill fw-semibold ${activeTab === 'posts' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-light'}`}>
                        🏢 Bài Đăng & Tiện Ích
                    </button>
                </li>
                <li className="nav-item me-2">
                    <button onClick={() => setActiveTab('orders')} className={`nav-link border-0 px-4 py-2 rounded-pill fw-semibold ${activeTab === 'orders' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-light'}`}>
                        📦 Đơn Hàng Dịch Vụ
                    </button>
                </li>
                <li className="nav-item me-2">
                    <button onClick={() => setActiveTab('bookings')} className={`nav-link border-0 px-4 py-2 rounded-pill fw-semibold ${activeTab === 'bookings' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-light'}`}>
                        📅 Lịch Hẹn & Voucher
                    </button>
                </li>
                <li className="nav-item me-2">
                    <button onClick={() => setActiveTab('users')} className={`nav-link border-0 px-4 py-2 rounded-pill fw-semibold ${activeTab === 'users' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-light'}`}>
                        👤 Phân Tích Thành Viên
                    </button>
                </li>
                <li className="nav-item">
                    <button onClick={() => setActiveTab('reports')} className={`nav-link border-0 px-4 py-2 rounded-pill fw-semibold ${activeTab === 'reports' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-light'}`}>
                        ⚠️ Báo Cáo Vi Phạm
                    </button>
                </li>
            </ul>

            {/* Hiệu ứng loading */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải dữ liệu...</span>
                    </div>
                    <p className="mt-2 text-muted small">Đang xử lý và tính toán biểu đồ tổng hợp...</p>
                </div>
            ) : (
                <div className="tab-content animate__animated animate__fadeIn">
                    {activeTab === 'finance' && renderFinanceChart()}
                    {activeTab === 'posts' && renderPostsChart()}
                    {activeTab === 'orders' && renderOrdersChart()}
                    {activeTab === 'bookings' && renderBookingsChart()}
                    {activeTab === 'users' && renderUsersChart()}
                    {activeTab === 'reports' && renderReportsChart()}
                </div>
            )}
        </div>
    );
};

export default StatisticsManagement;