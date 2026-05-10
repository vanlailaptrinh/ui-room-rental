import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { IconSearch } from "../../assets/Icons";
import { useAuth } from '../../context/authContext';
import NotificationBell from '../NotificationBell';

function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [isMenuOpen,     setIsMenuOpen]     = useState(false);
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
        navigate('/login');
    };

    // Kiểm tra role — BE có thể trả 'ROLE_LANDLORD' hoặc 'LANDLORD'
    const role = user?.role || '';
    const isLandlord = role.includes('LANDLORD') || role.includes('ADMIN');

    // Chữ cái đại diện cho avatar
    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : (user?.email?.slice(0, 2).toUpperCase() || 'U');

    return (
        <nav className="header-nav">
            <div className="header-container">

                {/* ── Trái: Logo + Nav links ── */}
                <div className="brand-and-nav">
                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(v => !v)}>
                        <span className="material-symbols-outlined">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <Link to="/" className="header-logo">TroSinhVien</Link>

                    <div className={`header-nav-links ${isMenuOpen ? 'open' : ''}`}>
                        <NavLink to="/postlist" className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Phòng</NavLink>
                        <NavLink to="/pricing"  className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Gói Tin</NavLink>
                        <NavLink to="/uudai"    className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Ưu Đãi</NavLink>
                        <NavLink to="/blog"     className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Blog</NavLink>
                        <NavLink to="/lienhe"   className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Liên Hệ</NavLink>
                    </div>
                </div>

                {/* ── Giữa: Thanh tìm kiếm ── */}
                <div className="search-container">
                    <IconSearch className="search-icon-svg" />
                    <input className="search-input" placeholder="Tìm phòng..." type="text" />
                </div>

                {/* ── Chuông thông báo (chỉ khi đã đăng nhập) ── */}
                {user && <NotificationBell />}

                {/* ── Phải: Avatar / Đăng nhập ── */}
                <div className="header-auth-section">
                    {user ? (
                        <div className="user-dropdown-wrapper" ref={dropdownRef}>

                            {/* Nút avatar */}
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

                            {/* Dropdown menu */}
                            {isDropdownOpen && (
                                <div className="user-dropdown-menu" id="user-dropdown-menu">

                                    {/* Phần đầu: thông tin user */}
                                    <div className="dropdown-header">
                                        <div className="dropdown-avatar-large">{initials}</div>
                                        <div>
                                            <p className="dropdown-name">{user.username || 'Người dùng'}</p>
                                            <p className="dropdown-email">{user.email}</p>
                                            <span className="dropdown-role-badge">
                                                {isLandlord ? '🏠 Chủ trọ' : '👤 Người thuê'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="dropdown-divider" />

                                    {/* Menu chung */}
                                    <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                        <span className="di-icon">👤</span> Thông tin cá nhân
                                    </Link>

                                    {/* ─ Lịch hẹn của tôi (Tenant) ─ */}
                                    <Link
                                        to="/my-bookings"
                                        id="link-my-bookings"
                                        className="dropdown-item dropdown-item-highlight"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <span className="di-icon">📅</span> Lịch hẹn của tôi
                                    </Link>

                                    <Link to="/favorites" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                        <span className="di-icon">❤️</span> Phòng yêu thích
                                    </Link>

                                    {/* ─ Khu vực Chủ trọ ─ */}
                                    {isLandlord && (
                                        <>
                                            <div className="dropdown-divider" />
                                            <p className="dropdown-section-label">Quản lý chủ trọ</p>
                                            <Link
                                                to="/landlord"
                                                id="link-landlord-dashboard"
                                                className="dropdown-item dropdown-item-landlord"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <span className="di-icon">🏘️</span> Dashboard chủ trọ
                                            </Link>
                                            <Link to="/post" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                                                <span className="di-icon">📝</span> Đăng tin phòng
                                            </Link>
                                        </>
                                    )}

                                    <div className="dropdown-divider" />

                                    <button
                                        id="btn-logout"
                                        className="dropdown-item dropdown-item-logout"
                                        onClick={handleLogout}
                                    >
                                        <span className="di-icon">🚪</span> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button id="btn-login" className="btn-login" onClick={() => navigate('/login')}>
                            Đăng nhập
                        </button>
                    )}
                </div>

            </div>
        </nav>
    );
}

export default Header;