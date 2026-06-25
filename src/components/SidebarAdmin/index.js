import React from 'react';
import './SidebarAdmin.css';
import config from '../../config';
import { Link, useLocation } from 'react-router-dom';

const SidebarAdmin = () => {
  const location = useLocation();

  const menuItems = [
    { path: config.routes.home, label: 'TroSinhVien', isLogo: true },
    { path: config.routes.adminDashboard, icon: 'dashboard', label: 'Bảng điều khiển' },
    { path: config.routes.adminStatistics, icon: 'analytics', label: 'Thống kê hệ thống' },
    { path: config.routes.adminAccounts, icon: 'group', label: 'Quản lý Tài khoản' },
    { path: config.routes.adminAmenities, icon: 'widgets', label: 'Quản lý Tiện nghi' },
    { path: config.routes.adminFinance, icon: 'payments', label: 'Quản lý Tài chính' },
    { path: config.routes.adminPackages, icon: 'inventory_2', label: 'Quản lý Gói dịch vụ' },
    { path: config.routes.adminPosts, icon: 'apartment', label: 'Quản lý Bài đăng' },
    { path: config.routes.adminVouchers, icon: 'confirmation_number', label: 'Quản lý Voucher' },
    { path: config.routes.adminBlacklist, icon: 'block', label: 'Quản lý Danh sách đen' },
    { path: config.routes.adminReports, icon: 'report', label: 'Quản lý Báo cáo' },
  ];

  return (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;

          if (item.isLogo) {
            return (
              <div key={index} className="sidebar-logo-container">
                <Link to={item.path} className="logo-item">
                  {item.label}
                </Link>
                <p className="sidebar-subtitle">Quản trị hệ thống</p>
              </div>
            );
          }

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