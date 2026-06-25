import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

import UserService from '../../../services/userService';
import PostService from '../../../services/postService';
import OrderService from '../../../services/orderService';
import FinanceService from '../../../services/financeService';
import VoucherService from '../../../services/voucherService';
import ReportService from '../../../services/reportService';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // State thống kê 8 chỉ số hệ thống
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingPosts: 0,
        pendingOrders: 0,
        monthlyRevenue: 0,
        totalPosts: 0,
        totalVouchers: 0,
        totalReports: 0,
        successOrders: 0
    });

    // Danh sách dữ liệu quản lý
    const [usersList, setUsersList] = useState([]);
    const [postsList, setPostsList] = useState([]);
    const [ordersList, setOrdersList] = useState([]);
    const [vouchersList, setVouchersList] = useState([]);
    const [reportsList, setReportsList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOverviewStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsersData();
        if (activeTab === 'posts') fetchPostsData();
        if (activeTab === 'orders') fetchOrdersData();
        if (activeTab === 'vouchers') fetchVouchersData();
        if (activeTab === 'reports') fetchReportsData();
    }, [activeTab]);

    const fetchOverviewStats = async () => {
        setLoading(true);
        try {
            const [
                usersRes, pendingPostsRes, pendingOrdersRes, financeRes,
                allPostsRes, allVouchersRes, allReportsRes, successOrdersRes
            ] = await Promise.all([
                UserService.getAllUsers(),
                PostService.getPendingPosts(),
                OrderService.getPendingOrders(),
                FinanceService.getFinanceStatsByMonth(),
                PostService.getPosts(),
                VoucherService.getVouchers(),
                ReportService.getAllReports(),
                OrderService.getSuccessOrders()
            ]);

            let currentMonthRevenue = 0;
            if (financeRes?.data && Array.isArray(financeRes.data)) {
                currentMonthRevenue = financeRes.data.reduce((sum, item) => sum + (item.amount || 0), 0);
            }

            setStats({
                totalUsers: usersRes?.data?.length || 0,
                pendingPosts: pendingPostsRes?.data?.length || 0,
                pendingOrders: pendingOrdersRes?.data?.length || 0,
                monthlyRevenue: currentMonthRevenue,
                totalPosts: allPostsRes?.data?.length || 0,
                totalVouchers: allVouchersRes?.data?.length || 0,
                totalReports: allReportsRes?.data?.length || 0,
                successOrders: successOrdersRes?.data?.length || 0
            });
        } catch (err) {
            console.error("Lỗi tải dữ liệu tổng quan:", err);
            setError("Không thể đồng bộ dữ liệu hệ thống.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsersData = async () => {
        try { const res = await UserService.getAllUsers(); setUsersList(res?.data || []); } catch (err) { console.error(err); }
    };

    const fetchPostsData = async () => {
        try { const res = await PostService.getPosts(); setPostsList(res?.data || []); } catch (err) { console.error(err); }
    };

    const fetchOrdersData = async () => {
        try { const res = await OrderService.getOrders(); setOrdersList(res?.data || []); } catch (err) { console.error(err); }
    };

    const fetchVouchersData = async () => {
        try { const res = await VoucherService.getVouchers(); setVouchersList(res?.data || []); } catch (err) { console.error(err); }
    };

    const fetchReportsData = async () => {
        try { const res = await ReportService.getAllReports(); setReportsList(res?.data || []); } catch (err) { console.error(err); }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        if (window.confirm(`Xác nhận thay đổi trạng thái hoạt động của tài khoản này?`)) {
            try {
                await UserService.toggleUserStatus(userId, !currentStatus);
                alert("Cập nhật trạng thái người dùng thành công!");
                fetchUsersData();
                fetchOverviewStats();
            } catch (err) { alert("Xử lý thất bại."); }
        }
    };

    const handleApprovePost = async (id) => {
        try {
            await PostService.approvePost(id);
            alert("Đã duyệt bài đăng lên hệ thống!");
            fetchPostsData();
            fetchOverviewStats();
        } catch (err) { alert("Duyệt tin thất bại."); }
    };

    const handleRejectPost = async (id) => {
        try {
            await PostService.rejectPost(id);
            alert("Đã từ chối tin đăng phòng trọ.");
            fetchPostsData();
            fetchOverviewStats();
        } catch (err) { alert("Thao tác thất bại."); }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };

    return (
        <div className="container-fluid admin-dashboard-wrapper py-4">
            {/* HEADER */}
            <div className="dashboard-header-block mb-4 p-4 rounded shadow-sm bg-white">
                <h2 className="fw-bold text-dark">Chào buổi sáng, Quản trị viên</h2>
                <p className="text-muted mb-0">Hôm nay là ngày {new Date().toLocaleDateString('vi-VN')}. Hệ thống ghi nhận các chỉ số hoạt động thời gian thực:</p>
            </div>

            {/* STAT CARDS */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4">
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-primary shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Tổng người dùng</span>
                            <h3 className="stat-value fw-bold m-0 mt-1">{stats.totalUsers}</h3>
                        </div>
                        <div className="stat-icon-box bg-light-primary text-primary">👤</div>
                    </div>
                </div>
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-warning shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Tin chờ duyệt</span>
                            <h3 className="stat-value fw-bold m-0 mt-1 text-warning">{stats.pendingPosts}</h3>
                        </div>
                        <div className="stat-icon-box bg-light-warning text-warning">📝</div>
                    </div>
                </div>
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-danger shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Đơn hàng chờ</span>
                            <h3 className="stat-value fw-bold m-0 mt-1 text-danger">{stats.pendingOrders}</h3>
                        </div>
                        <div className="stat-icon-box bg-light-danger text-danger">📦</div>
                    </div>
                </div>
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-success shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Doanh thu tháng</span>
                            <h4 className="stat-value fw-bold m-0 mt-1 text-success fs-5">{formatCurrency(stats.monthlyRevenue)}</h4>
                        </div>
                        <div className="stat-icon-box bg-light-success text-success">💰</div>
                    </div>
                </div>
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-info shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Tổng bài đăng phòng</span>
                            <h3 className="stat-value fw-bold m-0 mt-1 text-info">{stats.totalPosts}</h3>
                        </div>
                        <div className="stat-icon-box bg-light-info text-info">🏠</div>
                    </div>
                </div>
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-purple shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Hệ thống Voucher</span>
                            <h3 className="stat-value fw-bold m-0 mt-1 text-purple">{stats.totalVouchers}</h3>
                        </div>
                        <div className="stat-icon-box bg-light-purple text-purple">🎟️</div>
                    </div>
                </div>
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-dark shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Báo cáo vi phạm</span>
                            <h3 className="stat-value fw-bold m-0 mt-1 text-dark">{stats.totalReports}</h3>
                        </div>
                        <div className="stat-icon-box bg-light-dark text-dark">⚠️</div>
                    </div>
                </div>
                <div className="col">
                    <div className="stat-card-custom h-100 border-start-teal shadow-sm bg-white p-3 d-flex align-items-center justify-content-between">
                        <div>
                            <span className="stat-title text-muted fw-bold small text-uppercase">Đơn mua gói thành công</span>
                            <h3 className="stat-value fw-bold m-0 mt-1 text-teal">{stats.successOrders}</h3>
                        </div>
                        <div className="stat-icon-box bg-light-teal text-teal">✅</div>
                    </div>
                </div>
            </div>

            {/* TAB MENU */}
            <div className="dashboard-tabs-wrapper mb-3 p-2 bg-white rounded shadow-sm d-flex gap-2 overflow-auto">
                <button className={`custom-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Tổng Quan</button>
                <button className={`custom-tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Người Dùng ({stats.totalUsers})</button>
                <button className={`custom-tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Bài Đăng Phòng Trọ ({stats.totalPosts})</button>
                <button className={`custom-tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Đơn Hàng Gói Dịch Vụ</button>
                <button className={`custom-tab-btn ${activeTab === 'vouchers' ? 'active' : ''}`} onClick={() => setActiveTab('vouchers')}>Quản Lý Voucher</button>
                <button className={`custom-tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Báo Cáo Vi Phạm ({stats.totalReports})</button>
            </div>

            {/* TAB PANELS */}
            <div className="tab-content-panel p-4 bg-white rounded shadow-sm">
                {loading && (
                    <div className="d-flex flex-column align-items-center py-5 text-primary">
                        <div className="spinner-border mb-2" role="status"></div>
                        <span>Đang tải dữ liệu hệ thống...</span>
                    </div>
                )}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                {!loading && !error && (
                    <>
                        {/* TAB 1: TỔNG QUAN */}
                        {activeTab === 'overview' && (
                            <div className="overview-tab-content animate-fade-in">
                                <h4 className="fw-bold text-dark mb-3">Bảng điều khiển Trung tâm RoomHub</h4>
                                <p className="text-secondary">Sử dụng thanh điều hướng phía trên để đi sâu vào chi tiết vận hành. Hệ thống đã lược bỏ các chuỗi kí tự ID kĩ thuật phức tạp nhằm tối ưu hóa trải nghiệm kiểm duyệt thông tin trực quan.</p>
                                <div className="quick-actions-box p-3 bg-light rounded mt-4 border border-dashed">
                                    <h5 className="fw-bold mb-2 text-primary">Lối tắt xử lý khẩn cấp:</h5>
                                    <div className="d-flex gap-2">
                                        <button onClick={() => setActiveTab('posts')} className="btn btn-warning btn-sm fw-medium">Phê duyệt tin đăng ({stats.pendingPosts}) →</button>
                                        <button onClick={() => setActiveTab('reports')} className="btn btn-dark btn-sm fw-medium">Xem báo cáo vi phạm ({stats.totalReports}) →</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: NGƯỜI DÙNG */}
                        {activeTab === 'users' && (
                            <div className="table-responsive animate-fade-in">
                                <h4 className="fw-bold mb-3 text-dark">Danh sách tài khoản người dùng</h4>
                                <table className="table table-hover align-middle custom-admin-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Avatar</th>
                                            <th>Tên tài khoản / Email</th>
                                            <th>Số điện thoại</th>
                                            <th>Vai trò</th>
                                            <th>Xác minh OTP</th>
                                            <th>Trạng thái</th>
                                            <th className="text-center">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.length === 0 ? <tr><td colSpan="7" className="text-center text-muted py-4">Không có người dùng.</td></tr> : (
                                            usersList.map((u) => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <img src={u.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="rounded-circle shadow-sm" width="40" height="40" style={{objectFit: 'cover'}}/>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-dark">{u.username}</div>
                                                        <small className="text-muted">{u.email}</small>
                                                    </td>
                                                    <td>{u.phone || 'Chưa cập nhật'}</td>
                                                    <td><span className={`badge-role-custom ${u.role}`}>{u.role}</span></td>
                                                    <td>
                                                        <span className={`badge ${u.verified ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                                                            {u.verified ? '✓ Đã xác thực' : '✗ Chưa xác thực'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${u.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                                                            {u.active ? 'Hoạt động' : 'Đang khóa'}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button className={`btn btn-sm px-3 fw-medium ${u.active ? 'btn-outline-danger' : 'btn-success text-white'}`} onClick={() => handleToggleUserStatus(u.id, u.active)}>
                                                            {u.active ? 'Khóa' : 'Mở Khóa'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 3: BÀI ĐĂNG */}
                        {activeTab === 'posts' && (
                            <div className="table-responsive animate-fade-in">
                                <h4 className="fw-bold mb-3 text-dark">Quản lý tin đăng phòng trọ</h4>
                                <table className="table table-hover align-middle custom-admin-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Ảnh bìa</th>
                                            <th>Tiêu đề / Loại phòng</th>
                                            <th>Địa chỉ</th>
                                            <th>Giá & Diện tích</th>
                                            <th>Cấp độ Gói dịch vụ</th>
                                            <th>Tương tác</th>
                                            <th>Trạng thái</th>
                                            <th className="text-center">Duyệt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {postsList.length === 0 ? <tr><td colSpan="8" className="text-center text-muted py-4">Không có bài viết nào.</td></tr> : (
                                            postsList.map((p) => (
                                                <tr key={p.id}>
                                                    <td>
                                                        <img src={p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/60x40'} alt="room" className="rounded border" width="60" height="40" style={{objectFit: 'cover'}}/>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-dark text-truncate" style={{maxWidth: '250px'}} title={p.title}>{p.title}</div>
                                                        <span className="badge bg-light text-dark border mt-1">{p.roomType}</span>
                                                    </td>
                                                    <td className="text-muted text-truncate" style={{maxWidth: '200px'}} title={p.address}>{p.address}</td>
                                                    <td>
                                                        <div className="text-primary fw-bold">{formatCurrency(p.price)}/tháng</div>
                                                        <small className="text-secondary">{p.area} m²</small>
                                                    </td>
                                                    <td>
                                                        <div className="small">Gói Đăng: <span className="text-uppercase fw-bold text-info">{p.postingTier}</span></div>
                                                        <div className="small">Gói Đẩy: <span className="text-uppercase fw-bold text-purple">{p.boostingTier}</span></div>
                                                    </td>
                                                    <td className="small text-muted">
                                                        👁️ {p.views || 0} | ❤️ {p.favorites || 0}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${p.status === 'PENDING' ? 'bg-warning text-dark' : p.status === 'APPROVED' ? 'bg-success' : 'bg-danger'}`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        {p.status === 'PENDING' ? (
                                                            <div className="d-flex gap-1 justify-content-center">
                                                                <button className="btn btn-sm btn-success py-1" onClick={() => handleApprovePost(p.id)}>Duyệt</button>
                                                                <button className="btn btn-sm btn-danger py-1" onClick={() => handleRejectPost(p.id)}>Từ chối</button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted small">Đã xử lý</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 4: ĐƠN HÀNG */}
                        {activeTab === 'orders' && (
                            <div className="table-responsive animate-fade-in">
                                <h4 className="fw-bold mb-3 text-dark">Lịch sử hóa đơn thanh toán cổng VNPay</h4>
                                <table className="table table-hover align-middle custom-admin-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Mã Giao Dịch (VnPay)</th>
                                            <th>Tổng Tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Ngày giao dịch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordersList.length === 0 ? <tr><td colSpan="4" className="text-center text-muted py-4">Chưa có lịch sử giao dịch.</td></tr> : (
                                            ordersList.map((o) => (
                                                <tr key={o.id}>
                                                    <td><code className="text-dark font-monospace fw-bold fs-6">{o.vnpTxnRef || 'N/A'}</code></td>
                                                    <td className="text-success fw-bold fs-5">{formatCurrency(o.totalPrice || 0)}</td>
                                                    <td>
                                                        <span className={`badge ${o.status === 'SUCCESS' ? 'bg-success' : o.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted small">{formatDate(o.createdAt)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 5: MÃ GIẢM GIÁ */}
                        {activeTab === 'vouchers' && (
                            <div className="table-responsive animate-fade-in">
                                <h4 className="fw-bold mb-3 text-dark">Hệ thống Chương trình Mã khuyến mãi</h4>
                                <table className="table table-hover align-middle custom-admin-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Mã Ưu Đãi (Voucher)</th>
                                            <th>Mức Giảm (%)</th>
                                            <th>Giảm tối đa</th>
                                            <th>Tổng phát hành</th>
                                            <th>Đã dùng</th>
                                            <th>Thời hạn hiệu lực</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vouchersList.length === 0 ? <tr><td colSpan="7" className="text-center text-muted py-4">Không tìm thấy dữ liệu Voucher.</td></tr> : (
                                            vouchersList.map((v) => (
                                                <tr key={v.id}>
                                                    <td><code className="fs-6 bg-light px-2 py-1 border rounded text-purple fw-bold">{v.id}</code></td>
                                                    <td className="fw-bold text-danger fs-5">{v.discountPercentage}%</td>
                                                    <td className="text-dark fw-medium">{v.maxDiscountAmount ? formatCurrency(v.maxDiscountAmount) : 'Không giới hạn'}</td>
                                                    <td><span className="badge bg-dark px-2">{v.quantity} lượt</span></td>
                                                    <td><span className="badge bg-secondary px-2">{v.usedCount || 0} lượt</span></td>
                                                    <td className="small">
                                                        <div className="text-success">Từ: {formatDate(v.startedAt)}</div>
                                                        <div className="text-danger">Đến: {formatDate(v.expiredAt)}</div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${v.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                            {v.isActive ? 'Đang chạy' : 'Tạm dừng'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* TAB 6: BÁO CÁO VI PHẠM */}
                        {activeTab === 'reports' && (
                            <div className="table-responsive animate-fade-in">
                                <h4 className="fw-bold mb-3 text-dark">Xử lý báo cáo nội dung xấu & vi phạm từ cộng đồng</h4>
                                <table className="table table-hover align-middle custom-admin-table">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Người báo cáo</th>
                                            <th>Đối tượng bị tố cáo (Phòng trọ/User)</th>
                                            <th>Phân loại</th>
                                            <th>Lý do vi phạm</th>
                                            <th>Ngày gửi</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportsList.length === 0 ? <tr><td colSpan="6" className="text-center text-muted py-4">Hệ thống sạch, chưa có khiếu nại nào.</td></tr> : (
                                            reportsList.map((r) => (
                                                <tr key={r.id}>
                                                    <td>
                                                        <div className="fw-bold text-dark">{r.reporterUsername}</div>
                                                        <span className="badge bg-light text-secondary border small">{r.reporterRole}</span>
                                                    </td>
                                                    <td>
                                                        <div className="fw-bold text-danger text-truncate" style={{maxWidth: '220px'}} title={r.targetTitle || r.targetUsername}>
                                                            {r.targetTitle || r.targetUsername}
                                                        </div>
                                                        <span className="text-muted small">Cấp bậc: {r.targetRole || 'BÀI ĐĂNG'}</span>
                                                    </td>
                                                    <td><span className="badge bg-danger-subtle text-danger border border-danger-subtle">{r.type}</span></td>
                                                    <td className="text-wrap text-start text-secondary small" style={{maxWidth: '300px'}}>{r.reason}</td>
                                                    <td className="text-muted small">{formatDate(r.createdAt)}</td>
                                                    <td>
                                                        <span className={`badge px-2 py-1.5 ${r.status === 'RESOLVED' ? 'bg-success' : r.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;