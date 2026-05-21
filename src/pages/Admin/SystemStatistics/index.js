import React from 'react';
import { Link } from 'react-router-dom';
import './SystemStatistics.css';

const SystemStatistics = () => {
  return (
    <div className="app-layout">
      {/* SideNavBar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <span className="material-symbols-outlined icon-filled">analytics</span>
          </div>
          <div className="brand-text">
            <h1>Editorial Marketplace</h1>
            <p>Quản trị hệ thống</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Bảng điều khiển</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">confirmation_number</span>
            <span>Quản lý Voucher</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">block</span>
            <span>Quản lý Danh sách đen</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">group</span>
            <span>Quản lý Người dùng</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">apartment</span>
            <span>Quản lý Bài đăng</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">payments</span>
            <span>Quản lý Tài chính</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">report</span>
            <span>Quản lý Báo cáo</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">gavel</span>
            <span>Xử lý tranh chấp</span>
          </Link>
          <Link to="/system-statistics" className="nav-item active">
            <span className="material-symbols-outlined icon-filled">analytics</span>
            <span>Thống kê hệ thống</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">
            <img alt="Admin Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtaoWRqKX2dNzOiA-R2v821HPFrMNppHyQkUFsSYO041Z5apCnZyuSzaSIijR5g0VPL8sTko4HwgT5ohS8JmxXxCr_UIAEmf65SZoZ3NsHl_9ZifPAe3g3ixteXDSKYIPJ76WR2-1CiKTC3e2pvGlHVGKaWONpO9oLsuJs-OsuWrHGG_SxBYZ0cUHDe1m1_6GMAHlz6WDPpTF9D08-YrFQKu5c3omvb8VTcgpKsxJEvApIcM_aDR8nDE_zG-fgDk6y-9AHMm_3Rg4" />
          </div>
          <div className="user-info">
            <p className="name">Admin Manager</p>
            <p className="role">Hệ thống tổng hợp</p>
          </div>
        </div>
      </aside>

      {/* Main Content Shell */}
      <main className="main-wrapper">
        {/* TopAppBar */}
        <header className="topbar">
          <div className="search-bar">
            <span className="material-symbols-outlined">search</span>
            <input placeholder="Tìm kiếm dữ liệu..." type="text" />
          </div>

          <div className="header-actions">
            <button className="action-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="action-btn">
              <span className="material-symbols-outlined">mail</span>
            </button>
            <button className="action-btn">
              <span className="material-symbols-outlined">settings</span>
            </button>

            <div className="divider"></div>

            <div className="admin-profile">
              <div className="admin-text">
                <p className="name">Quản trị viên</p>
                <p className="role">Administrator</p>
              </div>
              <img alt="Administrator" className="admin-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMb9Qx7fiBPo8UtGpH7UGL6G8Jqa8DkigoTfdmLv27nRx-r270EOG2SnT0SZj5RrUkbpFTDBofxOAUawJx4ZxyxgQHrWTNKX8yqxijsklsI3AP9f6hY6AA7HlG2By0qztIUCyAdB5yr1kXT6iv-NPQB8VSvPg0klsTVVEl90KxYffo5raoQRtl0OuTV3ik3bf49vCpwFakJ_B0TeXNuHWtITe4vZKSKViUXbA1uTGMu5NbkThfqJQAO-hzL_d540uoyKbhaIdEd0c" />
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="content-canvas">
          {/* Page Header & Filters */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Thống kê hệ thống</h2>
              <p className="page-desc">Theo dõi các chỉ số tăng trưởng và hiệu suất vận hành toàn diện.</p>
            </div>
            <div className="filters">
              <button className="filter-btn active">30 ngày qua</button>
              <button className="filter-btn">Quý này</button>
              <button className="filter-btn">Năm nay</button>
              <div className="filter-divider"></div>
              <button className="calendar-btn">
                <span className="material-symbols-outlined">calendar_month</span>
              </button>
            </div>
          </div>

          {/* Dashboard Bento Grid */}
          <div className="dashboard-grid">
            {/* Financial Overview (Main Chart) */}
            <div className="card col-8">
              <div className="card-header-flex">
                <div>
                  <h3 className="card-title">Doanh thu theo thời gian</h3>
                  <p className="card-subtitle">Tổng quan dòng tiền từ phí dịch vụ và tin đăng</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="amount">1.420.500.000đ</span>
                  <div className="trend">
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span>
                    <span>+12.4% so với tháng trước</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Simulation */}
              <div className="bar-chart-wrap">
                <div className="chart-lines">
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                  <div className="line"></div>
                </div>
                
                <div className="bar bar-10">
                  <div className="tooltip">T2: 120M</div>
                </div>
                <div className="bar bar-20"></div>
                <div className="bar bar-30"></div>
                <div className="bar bar-50"></div>
                <div className="bar bar-60"></div>
                <div className="bar bar-80"></div>
                <div className="bar bar-100"></div>
              </div>
              <div className="chart-labels">
                <span>Tuần 1</span>
                <span>Tuần 2</span>
                <span>Tuần 3</span>
                <span>Tuần 4</span>
              </div>
            </div>

            {/* Occupancy Rate (Circular Progress) */}
            <div className="card col-4 occupancy-card">
              <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="occupancy-title">Tỷ lệ lấp đầy<br />Hệ thống</h3>
                  <p className="occupancy-subtitle">Dựa trên 2.450 căn phòng</p>
                </div>
                
                <div className="circular-wrap">
                  <div className="circle-container">
                    <svg>
                      <circle cx="64" cy="64" r="58" className="circle-bg" />
                      <circle cx="64" cy="64" r="58" className="circle-progress" />
                    </svg>
                    <span className="circle-text">89%</span>
                  </div>
                </div>

                <div className="occupancy-stats">
                  <div className="stat-box">
                    <p className="label">Đã thuê</p>
                    <p className="val">2.180</p>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-box">
                    <p className="label">Trống</p>
                    <p className="val">270</p>
                  </div>
                </div>
              </div>
              {/* Decorative Background Element */}
              <div className="card-deco"></div>
            </div>

            {/* User Growth (Area Chart) */}
            <div className="card col-6">
              <div className="card-header-flex" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">Tăng trưởng người dùng</h3>
                <div className="legend">
                  <div className="legend-item">
                    <div className="dot primary"></div>
                    <span className="legend-text">Chủ nhà</span>
                  </div>
                  <div className="legend-item">
                    <div className="dot secondary"></div>
                    <span className="legend-text">Sinh viên</span>
                  </div>
                </div>
              </div>

              {/* Line Chart Visual */}
              <div className="area-chart">
                <svg preserveAspectRatio="none" viewBox="0 0 400 100">
                  <path d="M0 80 Q 50 70, 100 75 T 200 40 T 300 30 T 400 10 L 400 100 L 0 100 Z" fill="url(#grad1)" />
                  <path d="M0 80 Q 50 70, 100 75 T 200 40 T 300 30 T 400 10" fill="none" stroke="#005bbf" strokeWidth="3" />
                  <path d="M0 90 Q 80 85, 160 88 T 320 60 T 400 50 L 400 100 L 0 100 Z" fill="url(#grad2)" />
                  <path d="M0 90 Q 80 85, 160 88 T 320 60 T 400 50" fill="none" stroke="#006b5c" strokeWidth="3" />
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#005bbf', stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: '#005bbf', stopOpacity: 0 }} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#006b5c', stopOpacity: 0.2 }} />
                      <stop offset="100%" style={{ stopColor: '#006b5c', stopOpacity: 0 }} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="chart-labels" style={{ marginTop: '16px', padding: 0 }}>
                  <span>01/01</span>
                  <span>10/01</span>
                  <span>20/01</span>
                  <span>30/01</span>
                </div>
              </div>

              <div className="growth-summary">
                <div>
                  <p className="summary-val">8.240</p>
                  <p className="summary-label">Tổng thành viên</p>
                </div>
                <div>
                  <p className="summary-val text-secondary">+1.2k</p>
                  <p className="summary-label">Tháng này</p>
                </div>
              </div>
            </div>

            {/* Listings by Region (Bento Mini Grid) */}
            <div className="card col-6">
              <div className="card-header-flex" style={{ marginBottom: '24px' }}>
                <h3 className="card-title">Tin đăng theo khu vực</h3>
                <button className="btn-link">
                  Xem bản đồ <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>map</span>
                </button>
              </div>

              <div className="region-list">
                <div className="region-row">
                  <div className="region-name">TP. HCM</div>
                  <div className="progress-track">
                    <div className="progress-fill fill-85"></div>
                  </div>
                  <div className="region-count">1,240</div>
                </div>
                <div className="region-row">
                  <div className="region-name">Hà Nội</div>
                  <div className="progress-track">
                    <div className="progress-fill fill-72"></div>
                  </div>
                  <div className="region-count">985</div>
                </div>
                <div className="region-row">
                  <div className="region-name">Đà Nẵng</div>
                  <div className="progress-track">
                    <div className="progress-fill fill-45"></div>
                  </div>
                  <div className="region-count">512</div>
                </div>
                <div className="region-row">
                  <div className="region-name">Cần Thơ</div>
                  <div className="progress-track">
                    <div className="progress-fill fill-25"></div>
                  </div>
                  <div className="region-count">245</div>
                </div>
              </div>

              <div className="region-stats">
                <div className="r-stat-box">
                  <p className="r-stat-label">Mới nhất</p>
                  <p className="r-stat-val">+124</p>
                </div>
                <div className="r-stat-box">
                  <p className="r-stat-label">Chờ duyệt</p>
                  <p className="r-stat-val text-tertiary">18</p>
                </div>
                <div className="r-stat-box">
                  <p className="r-stat-label">Giao dịch</p>
                  <p className="r-stat-val text-secondary" style={{ color: 'var(--secondary)' }}>3.4k</p>
                </div>
              </div>
            </div>

            {/* System Health (Status Cards) */}
            <div className="col-12 health-grid">
              <div className="health-card">
                <div className="h-icon bg-green">
                  <span className="material-symbols-outlined icon-filled">check_circle</span>
                </div>
                <div className="h-info">
                  <p className="h-label">Trạng thái Server</p>
                  <p className="h-val">Hoạt động tốt</p>
                </div>
              </div>
              <div className="health-card">
                <div className="h-icon bg-blue">
                  <span className="material-symbols-outlined icon-filled">speed</span>
                </div>
                <div className="h-info">
                  <p className="h-label">Độ trễ TB</p>
                  <p className="h-val">124ms</p>
                </div>
              </div>
              <div className="health-card">
                <div className="h-icon bg-orange">
                  <span className="material-symbols-outlined icon-filled">bug_report</span>
                </div>
                <div className="h-info">
                  <p className="h-label">Lỗi hệ thống</p>
                  <p className="h-val">0 Ghi nhận</p>
                </div>
              </div>
              <div className="health-card">
                <div className="h-icon bg-purple">
                  <span className="material-symbols-outlined icon-filled">verified_user</span>
                </div>
                <div className="h-info">
                  <p className="h-label">Xác minh mới</p>
                  <p className="h-val">+45 Hồ sơ</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="admin-footer">
          <div className="footer-left">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>security</span>
            <p>Bản quyền thuộc về Editorial Marketplace System © 2024</p>
          </div>
          <div className="footer-links">
            <Link to="#">Bảo mật</Link>
            <Link to="#">Điều khoản</Link>
            <Link to="#">Hỗ trợ</Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SystemStatistics;