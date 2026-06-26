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
    const [usersCache, setUsersCache] = useState({});

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
                        BookingService.getBookings(), 
                        VoucherService.getVouchers()
                    ]);
                    setBookings(resBookings?.data || []);
                    setVouchers(resVouchers?.data || []);
                }
                else if (activeTab === 'users') {
                    const resUsers = await UserService.getAllUsers();
                    setUsers(resUsers?.data || []);
                }
                else if (activeTab === 'reports') {
                    const resReports = await ReportService.getAllReports();
                    setReports(resReports?.data || []);
                }
                // --- BỔ SUNG FETCH CHO TAB 7 ---
                else if (activeTab === 'rentals') {
                    // Tải song song cả danh sách lịch đặt và danh sách users để map tên chủ trọ
                    const [resBookings, resUsers] = await Promise.all([
                        BookingService.getBookings(),
                        UserService.getAllUsers() // 🌟 Thêm dòng này để lấy toàn bộ thông tin User/Landlord
                    ]);
                    setBookings(resBookings?.data || []);
                    setUsers(resUsers?.data || []); // Đổ vào state users có sẵn của bạn
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu thống kê:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTabData();
    }, [activeTab, financePeriod]);

    useEffect(() => {
        if (!Array.isArray(bookings) || bookings.length === 0) return;

        const userIdsToFetch = new Set();
        bookings.forEach(b => {
            if (b?.userId && !usersCache[b.userId]) userIdsToFetch.add(b.userId);
            if (b?.landlordId && !usersCache[b.landlordId]) userIdsToFetch.add(b.landlordId);
        });

        if (userIdsToFetch.size === 0) return;

        const fetchUserData = async () => {
            const fetchPromises = Array.from(userIdsToFetch).map(async (id) => {
                try {
                    const userData = await UserService.getUserById(id); 
                    return { id, data: userData };
                } catch (error) {
                    console.error(`Không thể lấy thông tin user ${id}:`, error);
                    return { id, data: null };
                }
            });

            const results = await Promise.all(fetchPromises);
            
            setUsersCache(prev => {
                const newCache = { ...prev };
                results.forEach(res => {
                    if (res.data) newCache[res.id] = res.data;
                });
                return newCache;
            });
        };

        fetchUserData();
    }, [bookings]);

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

    // Thêm cấu hình Options ở đây để kiểm soát kích thước biểu đồ
    const optionsDoughnut = {
        maintainAspectRatio: false, // Cho phép chart tuân thủ height của div cha
        plugins: {
            legend: {
                position: 'bottom', // Đẩy chú thích xuống dưới để dồn không gian cho hình tròn
                labels: {
                    boxWidth: 12,
                    font: { size: 12 }
                }
            }
        },
        layout: {
            padding: 20 // Tạo khoảng cách đệm bao quanh để thu nhỏ vòng tròn lại
        }
    };

    return (
        <div className="row">
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm p-4 text-center custom-chart-card">
                    <h5 className="card-title fw-bold mb-3 text-start text-dark-blue">Tỷ Lệ Trạng Thái Đơn Hàng</h5>
                    {/* Bọc thêm một lớp wrapper div có chiều cao cố định và nhỏ gọn hơn */}
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px', position: 'relative' }}>
                        {orders.length > 0 ? (
                            <Doughnut data={dataDoughnut} options={optionsDoughnut} />
                        ) : (
                            <p className="text-muted py-5">Không có dữ liệu đơn hàng</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="col-md-6 mb-4">
                <div className="card shadow-sm p-4 h-100 custom-table-card">
                    <h5 className="card-title fw-bold mb-3 text-dark-blue">Danh Sách Đơn Mới Nhất</h5>
                    <div className="table-responsive" style={{ maxHeight: '240px' }}>
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

    // =========================================================================
    // TAB 5: THỐNG KÊ NGƯỜI DÙNG (USERS)
    // =========================================================================
    const renderUsersChart = () => {
        // 1. Phân nhóm theo Role dựa trên RoleEnum (ADMIN, LANDLORD, USER)
        const roleCounts = users.reduce((acc, curr) => {
            let roleLabel = 'Sinh viên / Khách';
            if (curr.role === 'LANDLORD') {
                roleLabel = 'Chủ nhà (Landlord)';
            } else if (curr.role === 'ADMIN') {
                roleLabel = 'Quản trị viên (Admin)';
            }
            
            acc[roleLabel] = (acc[roleLabel] || 0) + 1;
            return acc;
        }, {});

        // 2. Tính toán trạng thái hoạt động dựa trên thuộc tính @JsonProperty("isActive")
        const activeCounts = users.filter(u => u.isActive === true).length;
        const blockedCounts = users.length - activeCounts;

        // 3. Tính toán số lượng người dùng đã định danh / xác thực dựa trên @JsonProperty("isVerified")
        const verifiedCounts = users.filter(u => u.isVerified === true).length;

        // 4. Cấu hình dữ liệu biểu đồ Pie Chart
        const dataUsersPie = {
            labels: Object.keys(roleCounts).length > 0 ? Object.keys(roleCounts) : ['Sinh viên / Khách', 'Chủ nhà (Landlord)', 'Quản trị viên'],
            datasets: [
                {
                    data: Object.keys(roleCounts).length > 0 ? Object.values(roleCounts) : [0, 0, 0],
                    backgroundColor: ['#4e73df', '#1cc88a', '#f6c23e'],
                    hoverBackgroundColor: ['#2e59d9', '#17a673', '#dda20a'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }
            ]
        };

        const pieOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 15,
                        font: { size: 12, weight: '500' }
                    }
                }
            }
        };

        return (
            <div className="fade-in-element">
                {/* --- SECTION 1: MINI CARDS & BIỂU ĐỒ TRÒN --- */}
                <div className="row mb-4">
                    {/* Biểu đồ phân hệ vai trò */}
                    <div className="col-xl-5 col-lg-6 mb-4">
                        <div className="card shadow-sm p-4 h-100 custom-chart-card">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h5 className="card-title fw-bold mb-0 text-dark-blue">Phân Hệ Vai Trò Thành Viên</h5>
                            </div>
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '260px', position: 'relative' }}>
                                {users.length > 0 ? (
                                    <Pie data={dataUsersPie} options={pieOptions} />
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary mb-2" role="status"></div>
                                        <p className="text-muted small mb-0">Đang đồng bộ dữ liệu tài khoản...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Khu vực thẻ thống kê trạng thái nhanh */}
                    <div className="col-xl-7 col-lg-6 mb-4">
                        <div className="card shadow-sm p-4 h-100 custom-table-card">
                            <h5 className="card-title fw-bold mb-3 text-dark-blue">Trạng Thái Hệ Thống Tài Khoản</h5>
                            
                            <div className="row g-3 mb-4">
                                <div className="col-sm-4 col-6">
                                    <div className="card mini-status-card bg-gradient-blue text-white p-3 text-center border-0 shadow-xs">
                                        <h3 className="fw-bold mb-0">{users.length}</h3>
                                        <span className="small text-white-50">Tổng tài khoản</span>
                                    </div>
                                </div>
                                <div className="col-sm-4 col-6">
                                    <div className="card mini-status-card bg-gradient-success text-white p-3 text-center border-0 shadow-xs">
                                        <h3 className="fw-bold mb-0">{activeCounts}</h3>
                                        <span className="small text-white-50">Đang hoạt động</span>
                                    </div>
                                </div>
                                <div className="col-sm-4 col-12">
                                    <div className="card mini-status-card bg-gradient-warning text-white p-3 text-center border-0 shadow-xs">
                                        <h3 className="fw-bold mb-0">{verifiedCounts}</h3>
                                        <span className="small text-white-50">Đã xác minh</span>
                                    </div>
                                </div>
                            </div>

                            <h6 className="fw-bold text-secondary mb-2 small uppercase-tracking">Kiểm soát rủi ro vi phạm:</h6>
                            <div className="p-3 bg-danger-light rounded-3 d-flex justify-content-between align-items-center border border-danger-subtle">
                                <div className="d-flex align-items-center">
                                    <span className="material-icons text-danger me-2">block</span>
                                    <span className="text-danger small fw-semibold">Tài khoản đang bị vô hiệu hóa / Khóa tạm thời (Banned):</span>
                                </div>
                                <span className="badge bg-danger fs-6 px-3 rounded-pill shadow-sm">{blockedCounts}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2: BẢNG CHI TIẾT NGHIỆP VỤ RỘNG 100% --- */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm p-4 custom-table-card">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title fw-bold mb-0 text-dark-blue">Danh Sách Quản Lý Cơ Sở Dữ Liệu Thành Viên</h5>
                                <span className="badge bg-light text-dark border small px-2 py-1">Thời gian thực</span>
                            </div>
                            
                            <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle custom-data-table mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th scope="col" style={{ width: '60px' }}>Thành viên</th>
                                            <th scope="col">Thông tin tài khoản</th>
                                            <th scope="col">Liên hệ (Phone)</th>
                                            <th scope="col" className="text-center">Vai trò</th>
                                            <th scope="col" className="text-center">Xác minh</th>
                                            <th scope="col" className="text-center">Trạng thái</th>
                                            <th scope="col" className="text-center" style={{ width: '100px' }}>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? (
                                            users.map((userItem) => (
                                                <tr key={userItem.id}>
                                                    <td>
                                                        <img 
                                                            src={userItem.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"} 
                                                            alt={userItem.username} 
                                                            className="rounded-circle border border-2 object-cover"
                                                            style={{ width: '45px', height: '45px' }}
                                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-dark">{userItem.username}</div>
                                                        <div className="text-muted small">{userItem.email}</div>
                                                        {userItem.rating > 0 && (
                                                            <div className="d-flex align-items-center text-warning small mt-1">
                                                                <span className="material-icons fs-6 me-1">star</span>
                                                                <span className="fw-semibold">{userItem.rating?.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className="text-secondary font-monospace small">
                                                            {userItem.phone || "--- Chưa cập nhật ---"}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {userItem.role === 'ADMIN' ? (
                                                            <span className="badge bg-warning-light text-warning px-3 py-2 rounded-pill fw-bold">ADMIN</span>
                                                        ) : userItem.role === 'LANDLORD' ? (
                                                            <span className="badge bg-success-light text-success px-3 py-2 rounded-pill fw-bold">CHỦ NHÀ</span>
                                                        ) : (
                                                            <span className="badge bg-info-light text-primary px-3 py-2 rounded-pill fw-bold">SINH VIÊN</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        {userItem.isVerified ? (
                                                            <span className="material-icons text-success" title="Đã đối soát căn cước/KYC">verified</span>
                                                        ) : (
                                                            <span className="material-icons text-muted" title="Tài khoản thường">gpp_maybe</span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        {userItem.isActive ? (
                                                            <span className="badge bg-success px-2.5 py-1.5 rounded-pill text-white small d-inline-flex align-items-center">
                                                                <span className="spinner-grow spinner-grow-sm me-1" style={{ animationDuration: '3s' }} role="status"></span>
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-danger px-2.5 py-1.5 rounded-pill text-white small">
                                                                Banned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="text-center">
                                                        <button 
                                                            className={`btn btn-sm btn-action d-inline-flex align-items-center justify-content-center rounded-circle ${userItem.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                            style={{ width: '32px', height: '32px', p: 0 }}
                                                            title={userItem.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                                                            onClick={() => {
                                                                alert(`Tính năng thay đổi trạng thái cho tài khoản: ${userItem.username}\nID: ${userItem.id}\n(Sẽ kết nối API cập nhật trạng thái hoạt động)`);
                                                            }}
                                                        >
                                                            <span className="material-icons fs-5">{userItem.isActive ? 'block' : 'check_circle'}</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4 text-muted small">
                                                    Không có dữ liệu thành viên nào được trả về từ máy chủ.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB MỚI 6: QUẢN LÝ BÁO CÁO VI PHẠM (REPORTS)
    // ==========================================
    const handleResolveReport = async (reportId) => {
        if (window.confirm("Bạn có chắc chắn muốn đánh dấu báo cáo này là ĐÃ XỬ LÝ?")) {
            try {
                // Gọi API resolve từ ReportService hệ thống
                await ReportService.resolveReport(reportId);
                alert("Đã xử lý và cập nhật trạng thái báo cáo thành công!");
                
                // Cập nhật State cục bộ ngay lập tức để đồng bộ UI không cần reload lại trang
                setReports(prevReports => 
                    prevReports.map(report => 
                        report.id === reportId ? { ...report, status: 'RESOLVED' } : report
                    )
                );
            } catch (error) {
                console.error("Lỗi khi xử lý báo cáo vi phạm:", error);
                alert("Xử lý báo cáo thất bại, vui lòng kiểm tra lại hệ thống!");
            }
        }
    };

    const renderReportsChart = () => {
        // --- Xử lý dữ liệu thống kê dựa trên cấu trúc Enums chính xác ---
        const totalReports = reports.length;
        const pendingCount = reports.filter(r => r.status === 'PENDING').length;
        const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;

        // Đếm số lượng loại báo cáo (ROOM vs USER) để đưa vào biểu đồ tỷ lệ trực quan
        const roomTypeCount = reports.filter(r => r.type === 'ROOM').length;
        const userTypeCount = reports.filter(r => r.type === 'USER').length;

        // Cấu hình dữ liệu cho biểu đồ hình khuyên (Doughnut Chart)
        const typeDoughnutData = {
            labels: ['Báo cáo Phòng trọ', 'Báo cáo Tài khoản'],
            datasets: [
                {
                    data: totalReports > 0 ? [roomTypeCount, userTypeCount] : [1, 1], // Tránh biểu đồ trống nếu data rỗng
                    backgroundColor: ['#f6c23e', '#4e73df'], // Vàng cho ROOM, Xanh cho USER
                    hoverBackgroundColor: ['#f4b619', '#2e59d9'],
                    borderWidth: 1,
                }
            ]
        };

        return (
            <div className="reports-tab-container">
                {/* HÀNG 1: THẺ THỐNG KÊ NHANH & BIỂU ĐỒ TỶ LỆ ĐỐI TƯỢNG */}
                <div className="row mb-4">
                    {/* 3 Thẻ trạng thái báo cáo */}
                    <div className="col-xl-7 col-lg-7">
                        <div className="row h-100 align-content-between">
                            {/* Thẻ 1: Tổng số phiếu */}
                            <div className="col-md-4 mb-3">
                                <div className="card shadow-sm border-left-primary p-3 bg-white h-100">
                                    <span className="text-xs font-weight-bold text-primary text-uppercase d-block mb-1">
                                        Tổng lượng báo cáo
                                    </span>
                                    <h3 className="h3 mb-0 font-weight-bold text-gray-800">{totalReports}</h3>
                                </div>
                            </div>
                            {/* Thẻ 2: Đang chờ duyệt (PENDING) */}
                            <div className="col-md-4 mb-3">
                                <div className="card shadow-sm border-left-danger p-3 bg-white h-100">
                                    <span className="text-xs font-weight-bold text-danger text-uppercase d-block mb-1">
                                        Chờ xử lý (Pending)
                                    </span>
                                    <h3 className="h3 mb-0 font-weight-bold text-gray-800">{pendingCount}</h3>
                                </div>
                            </div>
                            {/* Thẻ 3: Đã giải quyết (RESOLVED) */}
                            <div className="col-md-4 mb-3">
                                <div className="card shadow-sm border-left-success p-3 bg-white h-100">
                                    <span className="text-xs font-weight-bold text-success text-uppercase d-block mb-1">
                                        Đã giải quyết (Resolved)
                                    </span>
                                    <h3 className="h3 mb-0 font-weight-bold text-gray-800">{resolvedCount}</h3>
                                </div>
                            </div>

                            {/* Thẻ mô tả ngắn gọn vai trò của Admin */}
                            <div className="col-12 mt-2">
                                <div className="card bg-light border-0 p-3 text-muted small">
                                    💡 <strong>Ghi chú dành cho quản trị viên:</strong> Hệ thống tiếp nhận thông tin tố cáo từ 
                                    người dùng đối với các bài đăng tin phòng trọ không chính xác hoặc hành vi gian lận tài khoản. 
                                    Vui lòng ấn nút <strong>"Xử lý"</strong> sau khi đã kiểm tra thực tế để chuyển trạng thái phiếu sang 
                                    <span className="text-success fw-bold"> RESOLVED</span>.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Biểu đồ tròn phân tích loại đối tượng bị tố cáo */}
                    <div className="col-xl-5 col-lg-5">
                        <div className="card shadow-sm p-4 bg-white h-100 custom-chart-card">
                            <h6 className="card-title fw-bold mb-2 text-dark-blue">Phân Hệ Đối Tượng Bị Báo Cáo</h6>
                            <div style={{ height: '160px', position: 'relative' }} className="d-flex justify-content-center">
                                {totalReports > 0 ? (
                                    <Doughnut 
                                        data={typeDoughnutData} 
                                        options={{ 
                                            responsive: true, 
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }
                                        }} 
                                    />
                                ) : (
                                    <div className="text-muted d-flex align-items-center small">Chưa có dữ liệu phân tích</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* HÀNG 2: BẢNG CHI TIẾT TẤT CẢ CÁC BÁO CÁO HỆ THỐNG */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm p-4 bg-white custom-table-card">
                            <h5 className="card-title fw-bold mb-3 text-dark-blue">Danh Sách Chi Tiết Phiếu Tố Cáo & Vi Phạm</h5>
                            
                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle small custom-table mb-0">
                                    <thead className="table-light sticky-top" style={{ top: 0, zIndex: 5 }}>
                                        <tr>
                                            <th style={{ width: '22%' }}>Người gửi báo cáo</th>
                                            <th style={{ width: '28%' }}>Đối tượng bị báo cáo</th>
                                            <th style={{ width: '25%' }}>Lý do vi phạm</th>
                                            <th style={{ width: '13%' }}>Ngày tạo</th>
                                            <th style={{ width: '12%', textAlign: 'center' }}>Trạng thái / Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reports.length > 0 ? (
                                            reports.map((report, idx) => (
                                                <tr key={report.id || idx}>
                                                    
                                                    {/* 1. NGƯỜI BÁO CÁO */}
                                                    <td>
                                                        <div className="fw-bold text-dark">{report.reporterUsername || "Ẩn danh"}</div>
                                                        <span className={`badge mt-1 ${
                                                            report.reporterRole === 'LANDLORD' ? 'bg-info' : 
                                                            report.reporterRole === 'ADMIN' ? 'bg-danger' : 'bg-secondary'
                                                        } xsmall-badge`}>
                                                            {report.reporterRole || 'USER'}
                                                        </span>
                                                    </td>

                                                    {/* 2. ĐỐI TƯỢNG BỊ BÁO CÁO (ROOM HOẶC USER) */}
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            {/* Phân loại Type thẻ Tag */}
                                                            <span className={`badge mb-1 w-fit-content ${
                                                                report.type === 'ROOM' ? 'bg-warning text-dark' : 'bg-dark text-white'
                                                            }`}>
                                                                {report.type === 'ROOM' ? '📍 PHÒNG TRỌ' : '👤 TÀI KHOẢN'}
                                                            </span>
                                                            
                                                            {/* Hiển thị Target Name tương ứng */}
                                                            {report.type === 'ROOM' ? (
                                                                <>
                                                                    <span className="fw-medium text-primary text-truncate-custom" title={report.targetTitle}>
                                                                        {report.targetTitle || "Tin đăng phòng trọ"}
                                                                    </span>
                                                                    <span className="text-muted xsmall-text">Mã phòng: {report.targetId}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="fw-medium text-dark">
                                                                        @{report.targetUsername || "username_hidden"}
                                                                    </span>
                                                                    <span className="text-muted xsmall-text">Role: {report.targetRole || "USER"}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* 3. LÝ DO VI PHẠM (HIỂN THỊ TEXT TỰ DO) */}
                                                    <td>
                                                        <div className="p-2 bg-light rounded text-secondary border-start border-3 border-secondary italic-reason-box text-wrap-custom">
                                                            {report.reason || "Không để lại lý do chi tiết."}
                                                        </div>
                                                    </td>

                                                    {/* 4. NGÀY TẠO */}
                                                    <td className="text-muted">
                                                        {report.createdAt ? new Date(report.createdAt).toLocaleString('vi-VN', {
                                                            year: 'numeric', month: '2-digit', day: '2-digit',
                                                            hour: '2-digit', minute: '2-digit'
                                                        }) : 'N/A'}
                                                    </td>

                                                    {/* 5. THAO TÁC ADMIN */}
                                                    <td className="text-center">
                                                        {report.status === 'RESOLVED' ? (
                                                            <span className="badge bg-success-soft text-success border border-success px-3 py-2 rounded-pill fw-bold">
                                                                ✓ Đã xử lý
                                                            </span>
                                                        ) : (
                                                            <button 
                                                                className="btn btn-sm btn-danger px-3 py-1.5 shadow-sm font-weight-bold"
                                                                onClick={() => handleResolveReport(report.id)}
                                                            >
                                                                Xử lý
                                                            </button>
                                                        )}
                                                    </td>

                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-5 fs-6 fw-medium">
                                                    🎉 Không có báo cáo vi phạm nào trên hệ thống!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==========================================
    // TAB 7: THỐNG KÊ TỶ LỆ THUÊ PHÒNG (RENTALS) - ĐÃ CẬP NHẬT THÊM THÔNG TIN CHỦ NHÀ & THỜI GIAN
    // ==========================================
    const renderRentalsChart = () => {
        // 1. Khởi tạo bộ đếm mặc định khớp với BookingStatus Enum từ Backend
        const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };

        // Helper định dạng hiển thị LocalDateTime từ Backend
        const formatDateTime = (dateTimeString) => {
            if (!dateTimeString) return "---";
            try {
                const date = new Date(dateTimeString);
                if (isNaN(date.getTime())) return dateTimeString;
                
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            } catch (error) {
                return "---";
            }
        };

        // 2. Gom nhóm an toàn dữ liệu từ mảng bookings thực tế
        if (Array.isArray(bookings)) {
            bookings.forEach(b => {
                const currentStatus = b?.status;
                if (currentStatus && statusCounts[currentStatus] !== undefined) {
                    statusCounts[currentStatus]++;
                }
            });
        }

        const totalBookings = Array.isArray(bookings) ? bookings.length : 0;
        
        const getRate = (count) => {
            return totalBookings > 0 ? ((count / totalBookings) * 100).toFixed(1) : "0.0";
        };

        const pendingRate = getRate(statusCounts.PENDING);
        const approvedRate = getRate(statusCounts.APPROVED);
        const rejectedRate = getRate(statusCounts.REJECTED);
        const cancelledRate = getRate(statusCounts.CANCELLED);

        // 3. Cấu hình Data cho Biểu đồ Doughnut
        const dataRentalsPie = {
            labels: ['Chờ duyệt (Pending)', 'Thành công (Approved)', 'Từ chối (Rejected)', 'Đã hủy (Cancelled)'],
            datasets: [{
                data: [statusCounts.PENDING, statusCounts.APPROVED, statusCounts.REJECTED, statusCounts.CANCELLED],
                backgroundColor: [
                    'rgba(255, 193, 7, 0.85)',   // PENDING
                    'rgba(40, 167, 69, 0.85)',    // APPROVED
                    'rgba(220, 53, 69, 0.85)',    // REJECTED
                    'rgba(108, 117, 125, 0.85)'   // CANCELLED
                ],
                borderColor: ['#fff', '#fff', '#fff', '#fff'],
                borderWidth: 2,
            }],
        };

        const optionsRentalsPie = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 12, font: { size: 11, weight: '600' }, padding: 12 }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw || 0;
                            const percentage = totalBookings > 0 ? ((value / totalBookings) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ${value} lượt (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '72%'
        };

        return (
            <div className="d-flex flex-column gap-4">
                {/* DÒNG 1: CHỈ SỐ KPI VÀ BIỂU ĐỒ TRÒN KHUYÊN */}
                <div className="row g-4">
                    <div className="col-xl-6 col-lg-6">
                        <div className="card shadow-sm border-0 rounded-4 h-100 p-3">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Hiệu Suất Tương Tác Lịch</h5>
                                    <p className="text-muted small mb-3">Phân tích sâu tỷ lệ chuyển đổi dòng hành vi kết nối Sinh viên - Chủ nhà.</p>
                                </div>

                                <div className="row g-3 my-2 text-center">
                                    <div className="col-6">
                                        <div className="p-3 rounded-3 bg-warning-subtle" style={{ minHeight: '85px' }}>
                                            <span className="fs-3 fw-bold text-warning d-block">{pendingRate}%</span>
                                            <span className="text-dark small fw-medium" style={{ fontSize: '12px' }}>Tỷ lệ Chờ duyệt</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded-3 bg-success-subtle" style={{ minHeight: '85px' }}>
                                            <span className="fs-3 fw-bold text-success d-block">{approvedRate}%</span>
                                            <span className="text-dark small fw-medium" style={{ fontSize: '12px' }}>Tỷ lệ Thuê thành công</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded-3 bg-danger-subtle" style={{ minHeight: '85px' }}>
                                            <span className="fs-3 fw-bold text-danger d-block">{rejectedRate}%</span>
                                            <span className="text-dark small fw-medium" style={{ fontSize: '12px' }}>Tỷ lệ Từ chối</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded-3 bg-secondary-subtle" style={{ minHeight: '85px' }}>
                                            <span className="fs-3 fw-bold text-secondary d-block">{cancelledRate}%</span>
                                            <span className="text-dark small fw-medium" style={{ fontSize: '12px' }}>Tỷ lệ Hủy lịch</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                                        <span className="text-secondary small"><i className="bi bi-circle-fill text-warning me-2" style={{fontSize: '8px'}}></i>Chờ xử lý (Pending):</span>
                                        <span className="fw-bold text-dark">{statusCounts.PENDING} <small className="text-muted fw-normal">({pendingRate}%)</small></span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                                        <span className="text-secondary small"><i className="bi bi-circle-fill text-success me-2" style={{fontSize: '8px'}}></i>Đã thuê phòng (Approved):</span>
                                        <span className="fw-bold text-success">{statusCounts.APPROVED} <small className="text-success fw-normal">({approvedRate}%)</small></span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                                        <span className="text-secondary small"><i className="bi bi-circle-fill text-danger me-2" style={{fontSize: '8px'}}></i>Từ chối lịch (Rejected):</span>
                                        <span className="fw-bold text-dark">{statusCounts.REJECTED} <small className="text-muted fw-normal">({rejectedRate}%)</small></span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center py-2">
                                        <span className="text-secondary small"><i className="bi bi-circle-fill text-secondary me-2" style={{fontSize: '8px'}}></i>Người dùng hủy (Cancelled):</span>
                                        <span className="fw-bold text-dark">{statusCounts.CANCELLED} <small className="text-muted fw-normal">({cancelledRate}%)</small></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-6 col-lg-6">
                        <div className="card shadow-sm border-0 rounded-4 h-100 p-3">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <h5 className="fw-bold text-dark mb-1">Cấu Trúc Trạng Thái Lịch Hẹn</h5>
                                    <p className="text-muted small mb-4">Biểu đồ phân bổ tổng quan tỷ lệ trực quan hóa cấu trúc tương tác hệ thống.</p>
                                </div>
                                <div style={{ height: '280px', width: '100%' }} className="position-relative my-auto">
                                    <Doughnut data={dataRentalsPie} options={optionsRentalsPie} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DÒNG 2: DANH SÁCH LỊCH HẸN VỪA PHÁT SINH */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm border-0 rounded-4 p-3">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">Dòng Nghiệp Vụ Vừa Phát Sinh</h5>
                                        <p className="text-muted small mb-0">Danh sách các lịch hẹn xem phòng thời gian thực vừa được ghi nhận trên hệ thống.</p>
                                    </div>
                                    <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">
                                        Mới cập nhật
                                    </span>
                                </div>
                                
                                <div className="table-responsive mt-3" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                                    {!bookings || bookings.length === 0 ? (
                                        <div className="text-center text-muted py-5 small">
                                            <i className="bi bi-calendar-x d-block fs-3 mb-2 text-black-50"></i>
                                            Chưa có dữ liệu lịch hẹn trên hệ thống.
                                        </div>
                                    ) : (
                                        <table className="table table-hover align-middle table-borderless mb-0">
                                            <thead className="table-light sticky-top" style={{ top: 0, zIndex: 10 }}>
                                                <tr className="small text-muted text-uppercase fw-bold">
                                                    <th style={{ minWidth: '180px' }}>Khách hàng</th>
                                                    <th style={{ minWidth: '180px' }}>Chủ nhà</th>
                                                    <th style={{ minWidth: '260px' }}>Bài đăng yêu cầu xem phòng</th>
                                                    <th style={{ minWidth: '150px' }}>Hẹn xem lúc</th>
                                                    <th style={{ minWidth: '150px' }}>Ngày đặt lịch</th>
                                                    <th style={{ minWidth: '130px' }} className="text-center">Trạng thái</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.slice(0, 10).map((b) => {
                                                    // 🌟 ĐOẠN FIX: Khớp trực tiếp thông tin từ mảng `users` tổng
                                                    const tenantInfo = Array.isArray(users) ? users.find(u => u.id === b.userId) : null;
                                                    const landlordInfo = Array.isArray(users) ? users.find(u => u.id === b.landlordId) : null;

                                                    const finalTenantName = tenantInfo?.username || b.tenantName || 'Ẩn danh';
                                                    const finalTenantAvatar = tenantInfo?.avatar || b.tenantAvatar;
                                                    
                                                    // Nếu tìm thấy chủ trọ trong danh sách users thì hiển thị, ngược lại hiển thị "Chủ trọ ẩn danh" thay vì "Đang tải" liên tục
                                                    const finalLandlordName = landlordInfo?.username || `Chủ trọ (ID: ${b.landlordId || '---'})`;
                                                    const finalLandlordAvatar = landlordInfo?.avatar;

                                                    return (
                                                        <tr key={b.id || Math.random().toString()} className="small border-bottom border-light">
                                                            {/* Khách hàng */}
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2 py-1">
                                                                    {finalTenantAvatar ? (
                                                                        <img src={finalTenantAvatar} alt="avatar" className="rounded-circle shadow-sm" style={{ width: '26px', height: '26px', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <div className="bg-secondary-subtle rounded-circle d-flex align-items-center justify-content-center text-secondary fw-bold shadow-sm" style={{ width: '26px', height: '26px', fontSize: '10px' }}>{finalTenantName.charAt(0).toUpperCase()}</div>
                                                                    )}
                                                                    <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '140px' }} title={finalTenantName}>{finalTenantName}</div>
                                                                </div>
                                                            </td>

                                                            {/* Chủ nhà */}
                                                            <td>
                                                                <div className="d-flex align-items-center gap-2 py-1">
                                                                    {finalLandlordAvatar ? (
                                                                        <img src={finalLandlordAvatar} alt="landlord avatar" className="rounded-circle shadow-sm" style={{ width: '26px', height: '26px', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <div className="bg-info-subtle rounded-circle d-flex align-items-center justify-content-center text-info fw-bold shadow-sm" style={{ width: '26px', height: '26px', fontSize: '10px' }}>{finalLandlordName.charAt(0).toUpperCase()}</div>
                                                                    )}
                                                                    <div className="text-dark text-truncate" style={{ maxWidth: '140px' }} title={finalLandlordName}>
                                                                        <span className="fw-medium">{finalLandlordName}</span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Bài đăng yêu cầu */}
                                                            <td>
                                                                <div className="text-dark fw-medium text-truncate" style={{ maxWidth: '250px' }} title={b.post?.title || `ID: ${b.postId}`}>{b.post?.title || <span className="text-muted italic">Mã phòng: {b.postId}</span>}</div>
                                                            </td>

                                                            {/* Thời gian hẹn xem */}
                                                            <td className="text-dark font-medium"><i className="bi bi-calendar-event text-primary me-1"></i>{formatDateTime(b.bookingTime)}</td>
                                                            
                                                            {/* Ngày khởi tạo */}
                                                            <td className="text-muted"><i className="bi bi-clock-history me-1"></i>{formatDateTime(b.createdAt)}</td>
                                                            
                                                            {/* Trạng thái */}
                                                            <td className="text-center">
                                                                <span className={`badge rounded-pill px-2.5 py-1.5 fw-bold ${
                                                                    b.status === 'APPROVED' ? 'bg-success-subtle text-success' :
                                                                    b.status === 'PENDING' ? 'bg-warning-subtle text-warning' :
                                                                    b.status === 'REJECTED' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary'
                                                                }`}>{b.status || 'UNKNOWN'}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
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
                <li className="nav-item mb-2">
                    <button onClick={() => setActiveTab('rentals')} className={`nav-link border-0 px-4 py-2 rounded-pill fw-semibold ${activeTab === 'rentals' ? 'bg-primary text-white shadow-sm' : 'text-secondary bg-light'}`}>
                        📈 Tỉ Lệ Thuê Phòng
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
                    {activeTab === 'rentals' && renderRentalsChart()}
                </div>
            )}
        </div>
    );
};

export default StatisticsManagement;