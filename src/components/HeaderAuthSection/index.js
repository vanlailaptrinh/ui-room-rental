import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './HeaderAuthSection.css';
import config from '../../config';

function HeaderAuthSection() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate(config.routes.login);
    };

    // ── 🌟 Phân loại Role rõ ràng ──
    const role = user?.role || '';
    const isAdmin = role.includes('ADMIN');
    const isLandlord = role.includes('LANDLORD');
    const isTenant = !isAdmin && !isLandlord; // Nếu không phải Admin/Chủ trọ thì là User thường

    // Chữ cái đại diện cho avatar
    const initials = useMemo(() => {
        const name = user?.fullName || user?.username || user?.email || 'User';
        const parts = name.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        const firstChar = parts[0][0];
        const lastChar = parts[parts.length - 1][0];

        return (firstChar + lastChar).toUpperCase();
    }, [user]);

    // Trả về nút Đăng nhập nếu chưa có user session
    if (!user) {
        return (
            <button id="btn-login" className="btn-login" onClick={() => navigate(config.routes.login)}>
                Đăng nhập
            </button>
        );
    }

    // Xác định nhãn hiển thị Role bên dưới email
    const getRoleBadgeLabel = () => {
        if (isAdmin) return '👑 Ban Quản Trị';
        if (isLandlord) return '🏠 Chủ nhà trọ';
        return '👤 Người thuê phòng';
    };

    return (
        <div className="header-auth-section">
            <div className="user-dropdown-wrapper" ref={dropdownRef}>

                {/* Nút kích hoạt mở Dropdown */}
                <button
                    id="user-avatar-btn"
                    className="user-avatar-btn"
                    onClick={() => setIsDropdownOpen(v => !v)}
                    aria-expanded={isDropdownOpen}
                >
                    <div className="avatar-circle">{initials}</div>
                    <span className="avatar-name">
                        {user.username || user.email?.split('@')[0]}
                    </span>
                    <span className={`avatar-chevron ${isDropdownOpen ? 'open' : ''}`}>▾</span>
                </button>

                {/* Dropdown Menu dựa trên Role */}
                {isDropdownOpen && (
                    <div className="user-dropdown-menu" id="user-dropdown-menu">

                        {/* 1. Header Dropdown: Thông tin tài khoản chung */}
                        <div className="dropdown-header">
                            <div className="dropdown-avatar-large">{initials}</div>
                            <div>
                                <p className="dropdown-name">{user.username || 'Người dùng'}</p>
                                <p className="dropdown-email">{user.email}</p>
                                <span className="dropdown-role-badge">
                                    {getRoleBadgeLabel()}
                                </span>
                            </div>
                        </div>

                        <div className="dropdown-divider" />

                        {/* Mục xem thông tin cá nhân (Tất cả các role đều có) */}
                        <Link to={config.routes.profile} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                            <span className="di-icon">👤</span> Thông tin cá nhân
                        </Link>
                        {!isAdmin && (
                            <Link to={config.routes.reports} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                <span className="di-icon">⚑</span> Báo cáo tài khoản
                            </Link>
                        )}

                        {/* 2. 👤 MENU DÀNH CHO USER THƯỜNG (TENANT) */}
                        {isTenant && (
                            <>
                                <Link to={config.routes.myBookings} className="dropdown-item dropdown-item-highlight" onClick={() => setIsDropdownOpen(false)}>
                                    <span className="di-icon">📅</span> Lịch sử xem phòng
                                </Link>
                                <Link to={config.routes.favorites} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                    <span className="di-icon">❤️</span> Phòng yêu thích
                                </Link>
                            </>
                        )}

                        {/* 3. 🏘️ MENU DÀNH CHO CHỦ TRỌ (LANDLORD) */}
                        {isLandlord && (
                            <>
                                <div className="dropdown-divider" />
                                <p className="dropdown-section-label">Quản lý chủ trọ</p>
                                <Link to={config.routes.landlord} className="dropdown-item dropdown-item-landlord" onClick={() => setIsDropdownOpen(false)}>
                                    <span className="di-icon">🏘️</span> Dashboard chủ trọ
                                </Link>
                                <Link to={config.routes.post} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                    <span className="di-icon">📝</span> Đăng tin phòng
                                </Link>
                                <Link to={config.routes.packet} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                    <span className="di-icon">💳</span> Gói Tin
                                </Link>
                            </>
                        )}

                        {/* 4. 👑 MENU DÀNH CHO ADMIN */}
                        {isAdmin && (
                            <>
                                <div className="dropdown-divider" />
                                <p className="dropdown-section-label">Quản lý hệ thống</p>
                                <Link to={config.routes.adminDashboard} className="dropdown-item dropdown-item-landlord" onClick={() => setIsDropdownOpen(false)} style={{ color: '#d46b08' }}>
                                    <span className="di-icon">⚙️</span> Dashboard Admin
                                </Link>
                            </>
                        )}

                        <div className="dropdown-divider" />

                        {/* Nút đăng xuất (Tất cả các role đều dùng chung) */}
                        <button id="btn-logout" className="dropdown-item dropdown-item-logout" onClick={handleLogout}>
                            <span className="di-icon">🚪</span> Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HeaderAuthSection;
