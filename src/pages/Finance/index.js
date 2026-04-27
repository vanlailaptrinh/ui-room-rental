import React from 'react';
import './Finance.css';

const FinancialManagement = () => {
  const chartData = [
    { label: 'Th. 5', height: 50, tooltip: '120M', active: false },
    { label: 'Th. 6', height: 62, tooltip: '145M', active: false },
    { label: 'Th. 7', height: 75, tooltip: '190M', active: false },
    { label: 'Th. 8', height: 55, tooltip: '135M', active: false },
    { label: 'Th. 9', height: 90, tooltip: '210M', active: true },
    { label: 'Th. 10', height: 68, tooltip: '160M', active: false },
  ];

  return (
    <div className="finance-layout">
      {/* SideNavBar Shell */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">The Editorial Marketplace</span>
        </div>
        
        <nav className="sidebar-nav">
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            Bảng điều khiển
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">confirmation_number</span>
            Quản lý Voucher
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">block</span>
            Quản lý Danh sách đen
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">group</span>
            Quản lý Người dùng
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">apartment</span>
            Quản lý Bài đăng
          </a>
          <a className="nav-item active" href="#">
            <span className="material-symbols-outlined">payments</span>
            Quản lý Tài chính
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">report</span>
            Quản lý Báo cáo
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">gavel</span>
            Xử lý tranh chấp
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">analytics</span>
            Thống kê hệ thống
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <img 
              alt="Admin Profile" 
              className="user-avatar" 
              src="https://via.placeholder.com/40" 
            />
            <div className="user-info">
              <p className="user-name">Editorial Admin</p>
              <p className="user-role">Marketplace Manager</p>
            </div>
          </div>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
          <a className="nav-item" href="#">
            <span className="material-symbols-outlined">help</span>
            Support
          </a>
        </div>
      </aside>

      {/* TopAppBar Shell */}
      <header className="topbar">
        <h1 className="topbar-title">Quản lý Tài chính</h1>
        <div className="topbar-actions">
          <div className="search-box">
            <span className="material-symbols-outlined search-icon">search</span>
            <input className="search-input" placeholder="Tìm kiếm giao dịch..." type="text" />
          </div>
          <div className="action-buttons">
            <button className="icon-btn"><span className="material-symbols-outlined">notifications</span></button>
            <button className="icon-btn"><span className="material-symbols-outlined">mail</span></button>
            <button className="icon-btn"><span className="material-symbols-outlined">account_circle</span></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        
        {/* Dashboard Summary Bento Grid */}
        <div className="bento-grid">
          <div className="stat-card">
            <div className="stat-card-bg-icon">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <p className="stat-label">Tổng Doanh Thu</p>
            <h2 className="stat-value">1.284.000.000 ₫</h2>
            <div className="stat-trend trend-up">
              <span className="material-symbols-outlined">trending_up</span>
              <span>+12.5% so với tháng trước</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-bg-icon">
              <span className="material-symbols-outlined">query_stats</span>
            </div>
            <p className="stat-label">Tăng Trưởng Tháng</p>
            <h2 className="stat-value">84.200.000 ₫</h2>
            <div className="stat-trend trend-primary">
              <span className="material-symbols-outlined">calendar_month</span>
              <span>Tháng 10, 2023</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-bg-icon text-tertiary">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <p className="stat-label">Yêu Cầu Thanh Toán Đang Chờ</p>
            <h2 className="stat-value">12.500.000 ₫</h2>
            <div className="stat-trend trend-warning">
              <span className="material-symbols-outlined">priority_high</span>
              <span>5 giao dịch cần phê duyệt</span>
            </div>
          </div>
        </div>

        {/* Revenue Chart Section */}
        <section className="chart-section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Biểu đồ Doanh thu</h3>
              <p className="section-subtitle">Tổng quan doanh thu 6 tháng gần nhất</p>
            </div>
            <div className="chart-filters">
              <button className="filter-btn active">Tháng</button>
              <button className="filter-btn">Quý</button>
              <button className="filter-btn">Năm</button>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-grid-lines">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            
            <div className="chart-bars">
              {chartData.map((data, index) => (
                <div className="bar-group" key={index}>
                  {/* Bọc thanh bar trong 1 thẻ div wrapper để fix chiều cao */}
                  <div className="bar-wrapper">
                    <div 
                      className={`bar ${data.active ? 'active' : ''}`} 
                      style={{ height: `${data.height}%` }} 
                      data-tooltip={data.tooltip}
                    ></div>
                  </div>
                  <span className={`bar-label ${data.active ? 'active' : ''}`}>
                    {data.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transaction History Table */}
        <section className="table-section">
          <div className="section-header px-8 py-6">
            <h3 className="section-title">Lịch sử Giao dịch</h3>
            <button className="export-btn">
              <span className="material-symbols-outlined">download</span>
              Xuất Báo Cáo
            </button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã Giao Dịch</th>
                  <th>Ngày</th>
                  <th>Người dùng</th>
                  <th>Loại</th>
                  <th className="text-right">Số Tiền</th>
                  <th>Trạng Thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="tx-id">#TXN-88291</td>
                  <td className="tx-date">24/10/2023, 14:30</td>
                  <td>
                    <div className="user-cell">
                      <div className="avatar text-avatar">AV</div>
                      <span className="user-name">Anh Vũ</span>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">Hoa hồng</span></td>
                  <td className="tx-amount text-right">2.450.000 ₫</td>
                  <td>
                    <div className="status-indicator status-success">
                      <span className="dot"></span> Hoàn tất
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="more-btn"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
                <tr>
                  <td className="tx-id">#TXN-88290</td>
                  <td className="tx-date">24/10/2023, 11:15</td>
                  <td>
                    <div className="user-cell">
                      <div className="avatar text-avatar">HT</div>
                      <span className="user-name">Hoàng Trần</span>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">Phí dịch vụ</span></td>
                  <td className="tx-amount text-right">850.000 ₫</td>
                  <td>
                    <div className="status-indicator status-pending">
                      <span className="dot"></span> Đang xử lý
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="more-btn"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
                <tr>
                  <td className="tx-id">#TXN-88289</td>
                  <td className="tx-date">23/10/2023, 17:45</td>
                  <td>
                    <div className="user-cell">
                      <div className="avatar text-avatar">ML</div>
                      <span className="user-name">Minh Lan</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">Rút tiền</span></td>
                  <td className="tx-amount negative text-right">- 5.000.000 ₫</td>
                  <td>
                    <div className="status-indicator status-success">
                      <span className="dot"></span> Hoàn tất
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="more-btn"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
                <tr>
                  <td className="tx-id">#TXN-88288</td>
                  <td className="tx-date">23/10/2023, 09:20</td>
                  <td>
                    <div className="user-cell">
                      <div className="avatar text-avatar">QD</div>
                      <span className="user-name">Quốc Duy</span>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">Hoa hồng</span></td>
                  <td className="tx-amount text-right">3.120.000 ₫</td>
                  <td>
                    <div className="status-indicator status-success">
                      <span className="dot"></span> Hoàn tất
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="more-btn"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="table-footer">
            <span className="pagination-info">Đang hiển thị 4 trong số 1.250 giao dịch</span>
            <div className="pagination-controls">
              <button className="page-btn">Trang trước</button>
              <button className="page-btn">Trang sau</button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default FinancialManagement;