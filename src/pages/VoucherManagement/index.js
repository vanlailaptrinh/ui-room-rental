import React from 'react';
import './VoucherManagement.css';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h1>The Editorial</h1>
            </div>
            <nav className="sidebar-nav">
                <a href="/admin/dashboard" className="nav-item">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span>Bảng điều khiển</span>
                </a>
                <a href="#" className="nav-item active">
                    <span className="material-symbols-outlined">confirmation_number</span>
                    <span>Quản lý Voucher</span>
                </a>
                <a href="/admin/blacklist" className="nav-item">
                    <span className="material-symbols-outlined">block</span>
                    <span>Quản lý Danh sách đen</span>
                </a>
                <a href="/admin/account-management" className="nav-item">
                    <span className="material-symbols-outlined">group</span>
                    <span>Quản lý Người dùng</span>
                </a>
                <a href="/admin/post-management" className="nav-item">
                    <span className="material-symbols-outlined">apartment</span>
                    <span>Quản lý Bài đăng</span>
                </a>
                <a href="/admin/finance" className="nav-item">
                    <span className="material-symbols-outlined">payments</span>
                    <span>Quản lý Tài chính</span>
                </a>
                <a href="#" className="nav-item">
                    <span className="material-symbols-outlined">report</span>
                    <span>Quản lý Báo cáo</span>
                </a>
                <a href="#" className="nav-item">
                    <span className="material-symbols-outlined">gavel</span>
                    <span>Xử lý tranh chấp</span>
                </a>
                <a href="/admin/statistics" className="nav-item">
                    <span className="material-symbols-outlined">analytics</span>
                    <span>Thống kê hệ thống</span>
                </a>
            </nav>
            <div className="sidebar-footer">
                <a href="#" className="nav-item">
                    <span className="material-symbols-outlined">settings</span>
                    <span>Settings</span>
                </a>
                <a href="#" className="nav-item">
                    <span className="material-symbols-outlined">help</span>
                    <span>Support</span>
                </a>
                <div className="user-profile">
                    <div className="user-avatar">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPROaOKGuNcOnX-5wbSpEHKO--6MsayU90eoUYtbJIIekCoS8nulac_8QCjC-RpAVGaB93-EjEQoBMvllvPUeEo5kKfDz7yxu-4FTLXqtQ65YJG_8TrwEG4oBQevNfEZDwB7FhiYcCsjh4lgV6e0L5vzY0lmsBt9aedKPhCmTgiPwQ3cKy7E9EVyP4K1cYb5_mDJNNB2yB82YB_WArUB87LzFQjQxoLSDhhqpvfV1Yl8nOiGIpwmoS79uYvp30vhrRfsRjByzjOpc" alt="Profile" />
                    </div>
                    <div className="user-info">
                        <p className="user-name">Editorial Admin</p>
                        <p className="user-role">Marketplace Manager</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const Header = () => {
    return (
        <header className="top-header">
            <div className="header-brand">
                <span>THE EDITORIAL MARKETPLACE</span>
            </div>
            <div className="header-actions">
                <div className="search-bar">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input type="text" placeholder="Tìm kiếm voucher..." />
                </div>
                <div className="action-buttons">
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">mail</span>
                    </button>
                    <button className="icon-btn">
                        <span className="material-symbols-outlined">account_circle</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

const VoucherManagement = () => {
    return (
        <div className="app-container">
            <Sidebar />
            
            <div className="main-wrapper">
                <Header />
                
                <main className="main-content">
                    <div className="content-inner">
                        
                        {/* Page Header */}
                        <div className="page-header">
                            <div>
                                <h2 className="page-title">Quản lý Voucher</h2>
                                <p className="page-subtitle">Kiểm soát và tối ưu chương trình khuyến mãi của bạn.</p>
                            </div>
                            <button className="btn-primary">
                                <span className="material-symbols-outlined">add_circle</span>
                                Tạo Voucher Mới
                            </button>
                        </div>

                        {/* Statistics Grid */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-content">
                                    <p className="stat-label">Voucher đang hoạt động</p>
                                    <h3 className="stat-value text-primary">124</h3>
                                    <div className="stat-trend text-secondary">
                                        <span className="material-symbols-outlined">trending_up</span>
                                        <span>+12% so với tháng trước</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined stat-bg-icon text-primary">confirmation_number</span>
                            </div>

                            <div className="stat-card">
                                <div className="stat-content">
                                    <p className="stat-label">Tỉ lệ sử dụng</p>
                                    <h3 className="stat-value">68.4%</h3>
                                    <div className="stat-trend text-primary">
                                        <span className="material-symbols-outlined">analytics</span>
                                        <span>Đã sử dụng 4.2k lần</span>
                                    </div>
                                </div>
                                <div className="stat-icon-wrapper bg-secondary-light">
                                    <span className="material-symbols-outlined text-secondary">query_stats</span>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-content">
                                    <p className="stat-label">Tổng giá trị giảm</p>
                                    <h3 className="stat-value text-tertiary">450M</h3>
                                    <div className="stat-trend text-tertiary">
                                        <span className="material-symbols-outlined">payments</span>
                                        <span>VNĐ Tiết kiệm cho khách</span>
                                    </div>
                                </div>
                                <div className="stat-shape bg-tertiary-light"></div>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="table-section">
                            <div className="table-controls">
                                <div className="filters">
                                    <div className="custom-select">
                                        <select>
                                            <option>Tất cả loại hình</option>
                                            <option>Phần trăm (%)</option>
                                            <option>Cố định (VNĐ)</option>
                                        </select>
                                        <span className="material-symbols-outlined select-icon">keyboard_arrow_down</span>
                                    </div>
                                    <div className="custom-select">
                                        <select>
                                            <option>Tất cả trạng thái</option>
                                            <option>Đang hoạt động</option>
                                            <option>Đã hết hạn</option>
                                        </select>
                                        <span className="material-symbols-outlined select-icon">keyboard_arrow_down</span>
                                    </div>
                                </div>
                                <div className="actions">
                                    <button className="icon-btn-filter">
                                        <span className="material-symbols-outlined">filter_list</span>
                                    </button>
                                    <button className="icon-btn-filter">
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="voucher-table">
                                    <thead>
                                        <tr>
                                            <th>Mã Voucher</th>
                                            <th>Loại</th>
                                            <th className="text-right">Giá trị</th>
                                            <th>Thời gian</th>
                                            <th>Lượt dùng</th>
                                            <th>Trạng thái</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Row 1 */}
                                        <tr>
                                            <td>
                                                <div className="col-code">
                                                    <span className="code-title">SUMMER2024</span>
                                                    <span className="code-desc">Chiến dịch Hè Rực Rỡ</span>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-percent">Phần trăm</span></td>
                                            <td className="text-right"><span className="val-text">15%</span></td>
                                            <td>
                                                <div className="col-time">
                                                    <div><span className="material-symbols-outlined">calendar_today</span> 01/06/2024</div>
                                                    <div><span className="material-symbols-outlined">event_busy</span> 31/08/2024</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="col-usage">
                                                    <div className="usage-stats">
                                                        <span>450/500</span>
                                                        <span>90%</span>
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill fill-primary" style={{ width: '90%' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="status-badge status-active">
                                                    <span className="dot pulse"></span>
                                                    Đang hoạt động
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <button className="icon-btn-small"><span className="material-symbols-outlined">more_vert</span></button>
                                            </td>
                                        </tr>

                                        {/* Row 2 */}
                                        <tr>
                                            <td>
                                                <div className="col-code">
                                                    <span className="code-title">WELCOMEBACK</span>
                                                    <span className="code-desc">Khách hàng cũ</span>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-fixed">Cố định</span></td>
                                            <td className="text-right"><span className="val-text">200k</span></td>
                                            <td>
                                                <div className="col-time">
                                                    <div><span className="material-symbols-outlined">calendar_today</span> 01/01/2024</div>
                                                    <div><span className="material-symbols-outlined">event_busy</span> 30/04/2024</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="col-usage">
                                                    <div className="usage-stats">
                                                        <span>300/300</span>
                                                        <span>100%</span>
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill fill-gray" style={{ width: '100%' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="status-badge status-expired">Đã hết hạn</span>
                                            </td>
                                            <td className="text-right">
                                                <button className="icon-btn-small"><span className="material-symbols-outlined">more_vert</span></button>
                                            </td>
                                        </tr>

                                        {/* Row 3 */}
                                        <tr>
                                            <td>
                                                <div className="col-code">
                                                    <span className="code-title">LUCKYLIVING</span>
                                                    <span className="code-desc">Bốc thăm trúng thưởng</span>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-percent">Phần trăm</span></td>
                                            <td className="text-right"><span className="val-text">50%</span></td>
                                            <td>
                                                <div className="col-time">
                                                    <div><span className="material-symbols-outlined">calendar_today</span> 15/07/2024</div>
                                                    <div><span className="material-symbols-outlined">event_busy</span> 15/08/2024</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="col-usage">
                                                    <div className="usage-stats">
                                                        <span>12/50</span>
                                                        <span>24%</span>
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill fill-primary" style={{ width: '24%' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="status-badge status-active">
                                                    <span className="dot pulse"></span>
                                                    Đang hoạt động
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <button className="icon-btn-small"><span className="material-symbols-outlined">more_vert</span></button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="pagination">
                                <p>Hiển thị 1 - 10 trên 124 vouchers</p>
                                <div className="page-controls">
                                    <button disabled><span className="material-symbols-outlined">chevron_left</span></button>
                                    <button className="active">1</button>
                                    <button>2</button>
                                    <button>3</button>
                                    <button><span className="material-symbols-outlined">chevron_right</span></button>
                                </div>
                            </div>
                        </div>

                        {/* Insight Card */}
                        <div className="insight-card">
                            <div className="insight-icon">
                                <span className="material-symbols-outlined">lightbulb</span>
                            </div>
                            <div className="insight-content">
                                <h4>Mẹo tối ưu: Hiệu suất voucher 'Phần trăm'</h4>
                                <p>Các voucher dạng phần trăm (15-20%) đang có tỷ lệ chuyển đổi cao hơn 2.4 lần so với giảm giá cố định VNĐ. Hãy cân nhắc tạo thêm các voucher này cho chiến dịch sắp tới.</p>
                                <button className="insight-link">
                                    Xem phân tích chi tiết <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Floating Shield */}
            <div className="trust-shield">
                <div className="shield-icon">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div className="shield-text">
                    <p className="shield-title">Verified Dashboard</p>
                    <p className="shield-subtitle">Admin Session Secure</p>
                </div>
            </div>
        </div>
    );
};

export default VoucherManagement;