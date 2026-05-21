import React from 'react';
import './SidebarAdmin.css';
import config from '../../config';
import { Link, useLocation } from 'react-router-dom';

const SidebarAdmin = () => {
  const location = useLocation();

  const menuItems = [
    { path: config.routes.adminDashboard, icon: 'dashboard', label: 'Bảng điều khiển' },
    { path: config.routes.adminVouchers, icon: 'confirmation_number', label: 'Quản lý Voucher' },
    { path: config.routes.adminBlacklist, icon: 'block', label: 'Quản lý Danh sách đen' },
    { path: config.routes.adminAccounts, icon: 'group', label: 'Quản lý Người dùng' },
    { path: config.routes.adminPosts, icon: 'apartment', label: 'Quản lý Bài đăng' },
    { path: config.routes.adminFinance, icon: 'payments', label: 'Quản lý Tài chính' },
    { path: config.routes.adminReports, icon: 'report', label: 'Quản lý Báo cáo' },
    { path: config.routes.adminDisputes, icon: 'gavel', label: 'Xử lý tranh chấp' },
    { path: config.routes.adminStatistics, icon: 'analytics', label: 'Thống kê hệ thống' },
    ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <Link to={config.routes.home} className="header-logo">TroSinhVien</Link>
        <p>Quản trị hệ thống</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={index} 
              to={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarAdmin;