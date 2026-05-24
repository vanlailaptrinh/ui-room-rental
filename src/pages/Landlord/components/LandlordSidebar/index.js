import React from 'react';
import { Link } from 'react-router-dom';
import './LandlordSidebar.css'

const LandlordSidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { key: 'dashboard',    icon: '📊', label: 'Bảng điều khiển' },
        { key: 'appointments', icon: '📅', label: 'Quản lý lịch hẹn' },
        { key: 'listings',     icon: '🏠', label: 'Quản lý tin đăng' },
        { key: 'messages',     icon: '💬', label: 'Tin nhắn' },
        { key: 'payments',     icon: '💳', label: 'Gói tin' },
        { key: 'orders',       icon: '🧾', label: 'Lịch sử giao dịch' },
        { key: 'reports',      icon: '📋', label: 'Báo cáo người thuê' },
    ];

    return (
        <aside className="landlord-sidebar">
            <Link to="/" className="landlord-logo">TroSinhVien</Link>
            <nav className="landlord-nav-menu">
                {menuItems.map(({ key, icon, label }) => (
                    <div
                        key={key}
                        className={`landlord-nav-item ${activeTab === key ? 'landlord-active' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        {icon} {label}
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default LandlordSidebar;