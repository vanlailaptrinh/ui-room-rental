import React from 'react';
import { Link } from 'react-router-dom';
import './AccountManagement.css';

const AccountManagement = () => {
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Editorial Marketplace</h2>
          <p>Quản trị hệ thống</p>
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
          {/* Active State */}
          <Link to="/account-management" className="nav-item active">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
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
          <Link to="/admin/statistics" className="nav-item">
            <span className="material-symbols-outlined">analytics</span>
            <span>Thống kê hệ thống</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <img src="https://i.pravatar.cc/150?img=11" alt="Admin" />
          <div className="admin-info">
            <p className="name">Admin Console</p>
            <p className="logout">Administrator</p>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Tìm kiếm người dùng..." />
          </div>

          <div className="header-actions">
            <div className="icon-group">
              <button><span className="material-symbols-outlined">notifications</span></button>
              <button><span className="material-symbols-outlined">mail</span></button>
              <button><span className="material-symbols-outlined">settings</span></button>
            </div>
            <div className="divider"></div>
            <div className="profile-group">
              <img src="https://i.pravatar.cc/150?img=11" alt="Admin" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="admin-content">
          {/* Page Header */}
          <div className="page-header flex-between">
            <div>
              <h1>Quản lý Người dùng</h1>
              <p>Giám sát và điều phối cộng đồng Editorial Marketplace</p>
            </div>
            <div className="header-buttons">
              <button className="btn-outline">
                <span className="material-symbols-outlined">download</span> Xuất báo cáo
              </button>
              <button className="btn-primary">
                <span className="material-symbols-outlined">person_add</span> Thêm người dùng
              </button>
            </div>
          </div>

          {/* STATS GRID */}
          <div className="am-stats-grid">
            <div className="am-stat-card">
              <div className="icon-box blue"><span className="material-symbols-outlined">group</span></div>
              <p className="title">TỔNG NGƯỜI DÙNG</p>
              <h3>12,842</h3>
              <p className="trend positive"><span className="material-symbols-outlined">trending_up</span> +12% tháng này</p>
            </div>
            <div className="am-stat-card">
              <div className="icon-box teal"><span className="material-symbols-outlined">school</span></div>
              <p className="title">SINH VIÊN</p>
              <h3>10,205</h3>
              <div className="progress-bar"><div className="fill teal" style={{width: '80%'}}></div></div>
            </div>
            <div className="am-stat-card">
              <div className="icon-box orange"><span className="material-symbols-outlined">real_estate_agent</span></div>
              <p className="title">CHỦ NHÀ</p>
              <h3>2,637</h3>
              <div className="progress-bar"><div className="fill orange" style={{width: '20%'}}></div></div>
            </div>
            <div className="am-stat-card">
              <div className="icon-box red"><span className="material-symbols-outlined">verified_user</span></div>
              <p className="title">CẦN XÁC MINH</p>
              <h3>148</h3>
              <p className="trend warning">Yêu cầu đang chờ duyệt</p>
            </div>
          </div>

          {/* DATA TABLE SECTION */}
          <div className="am-table-container">
            <div className="am-table-filters">
              <div className="filter-group">
                <div className="filter-item">
                  <label>VAI TRÒ</label>
                  <select defaultValue="Tất cả vai trò">
                    <option>Tất cả vai trò</option>
                    <option>Sinh viên</option>
                    <option>Chủ nhà</option>
                  </select>
                </div>
                <div className="filter-item">
                  <label>TRẠNG THÁI</label>
                  <select defaultValue="Tất cả trạng thái">
                    <option>Tất cả trạng thái</option>
                    <option>Đã xác minh</option>
                    <option>Chờ xác minh</option>
                    <option>Đã khóa</option>
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <span>Hiển thị 1-10 trên 12,842</span>
                <button><span className="material-symbols-outlined">chevron_left</span></button>
                <button><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
            </div>

            <table className="am-table">
              <thead>
                <tr>
                  <th>NGƯỜI DÙNG</th>
                  <th>VAI TRÒ</th>
                  <th>XÁC MINH</th>
                  <th>NGÀY THAM GIA</th>
                  <th className="text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                <UserRow 
                  name="Nguyễn Thu Hà" email="thuha.nguyen@university.edu.vn" avatar="https://i.pravatar.cc/150?img=5"
                  role="Sinh viên" roleColor="teal" status="Đã xác minh" statusIcon="verified" statusColor="teal" date="12/10/2023" online={true}
                />
                <UserRow 
                  name="Trần Văn Hùng" email="hung.tran.bds@gmail.com" avatar="https://i.pravatar.cc/150?img=12"
                  role="Chủ nhà" roleColor="orange" status="Chờ xác minh" statusIcon="pending" statusColor="orange" date="15/10/2023" online={false}
                />
                <UserRow 
                  name="Lê Minh Hoàng" email="minhhoang.le@gmail.com" avatar="https://i.pravatar.cc/150?img=15"
                  role="Sinh viên" roleColor="teal" status="Vô hiệu hóa" statusIcon="cancel" statusColor="grey" date="05/09/2023" online={false} locked={true}
                />
                <UserRow 
                  name="Phạm Thanh Thủy" email="thanhthuy.p@housing.com" avatar="https://i.pravatar.cc/150?img=9"
                  role="Chủ nhà" roleColor="orange" status="Đã xác minh" statusIcon="verified" statusColor="teal" date="20/08/2023" online={true}
                />
              </tbody>
            </table>

            <div className="am-pagination">
              <div className="page-size">
                <span>Hiển thị mỗi trang:</span>
                <select defaultValue="10">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>
              <div className="page-numbers">
                <button className="active">1</button>
                <button>2</button>
                <button>3</button>
                <span>...</span>
                <button>1,284</button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

/* --- SUB COMPONENT --- */
const UserRow = ({ name, email, avatar, role, roleColor, status, statusIcon, statusColor, date, online, locked }) => (
  <tr className={locked ? "locked-row" : ""}>
    <td>
      <div className="am-user-cell">
        <div className="avatar-wrapper">
          <img src={avatar} alt={name} className={locked ? "grayscale" : ""} />
          <span className={`status-dot ${online ? "online" : locked ? "offline" : "away"}`}></span>
        </div>
        <div className="user-info">
          <p className="name">
            {name} {locked && <span className="locked-badge">Đã khóa</span>}
          </p>
          <p className="email">{email}</p>
        </div>
      </div>
    </td>
    <td><span className={`role-badge ${roleColor}`}>{role}</span></td>
    <td>
      <div className={`status-text ${statusColor}`}>
        <span className="material-symbols-outlined">{statusIcon}</span>
        {status}
      </div>
    </td>
    <td className="date-cell">{date}</td>
    <td className="actions-cell">
      <button className="icon-btn" title="Xem chi tiết"><span className="material-symbols-outlined">visibility</span></button>
      {locked ? (
        <button className="icon-btn unlock" title="Gỡ khóa"><span className="material-symbols-outlined">lock_open</span></button>
      ) : (
        <button className="icon-btn block" title="Khóa tài khoản"><span className="material-symbols-outlined">block</span></button>
      )}
    </td>
  </tr>
);

export default AccountManagement;