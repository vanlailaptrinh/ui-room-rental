import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../context/authContext';
import NotificationBell from '../NotificationBell';
import HeaderAuthSection from '../HeaderAuthSection'

function Header() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
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
    const initials = useMemo(() => {
        const name = user?.fullName || user?.username || user?.email || 'User';
        const parts = name.trim().split(/\s+/);

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }
        // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
        const firstChar = parts[0][0];
        const lastChar = parts[parts.length - 1][0];

        return (firstChar + lastChar).toUpperCase();
    }, [user]);

    // Hàm xử lý tìm kiếm
    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (searchQuery.trim()) {
                navigate(`/postlist?search=${encodeURIComponent(searchQuery.trim())}`);
                setIsMenuOpen(false);
            }
        }
    };
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
                        <NavLink to="/uudai"    className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}>Ưu Đãi</NavLink>
                    </div>
                </div>

                {/* ── Giữa: Thanh tìm kiếm ── */}
                <div className="header-search-container">
                    <span
                        className="material-symbols-outlined search-icon"
                        onClick={handleSearch}
                        style={{ cursor: 'pointer' }}
                    >
                        search
                    </span>
                    <input
                        className="header-search-input"
                        placeholder="Tìm phòng..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                </div>

                {/* ── Chuông thông báo (chỉ khi đã đăng nhập) ── */}
                {user && <NotificationBell />}

                {/* ── Phải: Avatar / Đăng nhập ── */}
                <HeaderAuthSection />

            </div>
        </nav>
    );
}

export default Header;