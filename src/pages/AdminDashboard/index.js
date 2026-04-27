import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Editorial Marketplace</h2>
          <p>Quản trị hệ thống</p>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className="nav-item active">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Bảng điều khiển</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">confirmation_number</span>
            <span>Quản lý Voucher</span>
          </Link>
          <Link to="/admin/blacklist" className="nav-item">
            <span className="material-symbols-outlined">block</span>
            <span>Quản lý Danh sách đen</span>
          </Link>
          <Link to="/admin/account-management" className="nav-item">
            <span className="material-symbols-outlined">group</span>
            <span>Quản lý Người dùng</span>
          </Link>
          <Link to="#" className="nav-item">
            <span className="material-symbols-outlined">apartment</span>
            <span>Quản lý Bài đăng</span>
          </Link>
          <Link to="/admin/finance" className="nav-item">
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
          <Link to="/admin/statistics" className="nav-item">
            <span className="material-symbols-outlined">analytics</span>
            <span>Thống kê hệ thống</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <img src="https://i.pravatar.cc/150?img=11" alt="Admin" />
          <div className="admin-info">
            <p className="name">Admin</p>
            <p className="logout">Thoát hệ thống</p>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Tìm kiếm hệ thống..." />
          </div>

          <div className="header-actions">
            <div className="icon-group">
              <button><span className="material-symbols-outlined">notifications</span></button>
              <button><span className="material-symbols-outlined">mail</span></button>
              <button><span className="material-symbols-outlined">settings</span></button>
            </div>
            <div className="divider"></div>
            <div className="profile-group">
              <span>Admin Console</span>
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="admin-content">
          <div className="page-header">
            <h1>Chào buổi sáng, Quản trị viên</h1>
            <p>Hôm nay là 24 tháng 5, 2024. Đây là những gì đang diễn ra trên hệ thống của bạn.</p>
          </div>

          {/* STATS GRID */}
          <div className="stats-grid">
            <StatCard 
              title="Tổng sinh viên" value="12,482" trend="+12%" 
              icon="person" bgIcon="group" colorType="primary" 
            />
            <StatCard 
              title="Tổng chủ nhà" value="1,840" trend="+5%" 
              icon="real_estate_agent" bgIcon="handshake" colorType="secondary" 
            />
            <StatCard 
              title="Chờ phê duyệt" value="156" trend="Cần xử lý" 
              icon="pending_actions" bgIcon="assignment_late" colorType="tertiary" 
            />
            <StatCard 
              title="Doanh thu tháng" value="428.5M ₫" trend="+24%" 
              icon="payments" bgIcon="account_balance_wallet" colorType="primary-solid" 
            />
          </div>

          {/* MIDDLE SECTION */}
          <div className="middle-grid">
            {/* Table */}
            <div className="content-card table-card">
              <div className="card-header">
                <h2>Yêu cầu xác minh gần đây</h2>
                <button className="text-btn">Xem tất cả</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>CHỦ NHÀ</th>
                    <th>TÀI LIỆU</th>
                    <th>NGÀY GỬI</th>
                    <th>TRẠNG THÁI</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  <TableRow 
                    initial="NH" name="Nguyễn Văn Hùng" docs="CCCD, Giấy phép kinh doanh" 
                    time="2 giờ trước" status="CHỜ DUYỆT" statusType="warning" avatarType="primary"
                  />
                  <TableRow 
                    initial="LT" name="Lê Thị Thu" docs="Sổ hồng, CCCD" 
                    time="5 giờ trước" status="CHỜ DUYỆT" statusType="warning" avatarType="secondary"
                  />
                  <TableRow 
                    initial="PT" name="Phạm Minh Tuấn" docs="CCCD" 
                    time="Hôm qua" status="ĐÃ XÁC MINH" statusType="success" avatarType="primary"
                  />
                </tbody>
              </table>
            </div>

            {/* Area Distribution */}
            <div className="content-card distribution-card">
              <h2>Phân bổ theo khu vực</h2>
              <div className="progress-list">
                <ProgressBar label="Quận Cầu Giấy" percent="42" barClass="bg-primary" />
                <ProgressBar label="Quận Hai Bà Trưng" percent="28" barClass="bg-secondary" />
                <ProgressBar label="Quận Đống Đa" percent="15" barClass="bg-tertiary" />
                <ProgressBar label="Khu vực khác" percent="15" barClass="bg-grey" />
              </div>
              <div className="info-box">
                <span className="material-symbols-outlined">info</span>
                <p>Nhu cầu phòng trọ tại <b>Cầu Giấy</b> tăng 15% so với tháng trước do mùa nhập học.</p>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="bottom-grid">
            {/* Image Card */}
            <div className="featured-card">
              <div className="overlay"></div>
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" alt="Office" />
              <div className="featured-content">
                <h3>Phân tích xu hướng thị trường</h3>
                <p>Khám phá dữ liệu chuyên sâu về giá thuê và sự hài lòng của sinh viên trong học kỳ này.</p>
                <button className="btn-white">Tải báo cáo PDF</button>
              </div>
            </div>

            {/* Alert Card */}
            <div className="alert-card">
              <div>
                <div className="alert-badge">
                  <span className="material-symbols-outlined">warning</span>
                  <span>Cảnh báo hệ thống</span>
                </div>
                <h3>Phát hiện 12 tài khoản giả mạo</h3>
                <p>Hệ thống AI đã gắn cờ một số bài đăng có dấu hiệu lừa đảo tại khu vực Thủ Đức. Cần kiểm tra ngay lập tức.</p>
              </div>
              <div className="alert-actions">
                <button className="btn-primary">Xử lý ngay</button>
                <button className="btn-outline">Bỏ qua</button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

/* --- SUB COMPONENTS --- */

const StatCard = ({ title, value, trend, icon, bgIcon, colorType }) => (
  <div className={`stat-card border-${colorType}`}>
    <div className="stat-header">
      <div className={`icon-wrapper ${colorType}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className={`trend-badge ${colorType}`}>{trend}</span>
    </div>
    <div className="stat-info">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
    <span className="material-symbols-outlined bg-icon">{bgIcon}</span>
  </div>
);

const TableRow = ({ initial, name, docs, time, status, statusType, avatarType }) => (
  <tr>
    <td>
      <div className="user-cell">
        <div className={`avatar-initial ${avatarType}`}>{initial}</div>
        <span>{name}</span>
      </div>
    </td>
    <td className="text-muted">{docs}</td>
    <td className="text-muted">{time}</td>
    <td><span className={`status-badge ${statusType}`}>{status}</span></td>
    <td>
      <button className="action-btn"><span className="material-symbols-outlined">visibility</span></button>
    </td>
  </tr>
);

const ProgressBar = ({ label, percent, barClass }) => (
  <div className="progress-item">
    <div className="progress-labels">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="progress-track">
      <div className={`progress-fill ${barClass}`} style={{ width: `${percent}%` }}></div>
    </div>
  </div>
);

export default AdminDashboard;