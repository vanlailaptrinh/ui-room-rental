import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { IconSearch } from "../../assets/Icons";
import { useAuth } from '../../context/authContext';

function Header() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const handleLoginClick = () => {
        navigate('/login');
    };

    // Hàm xử lý đăng xuất
    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="header-nav">
            <div className="header-container">

                <div className="brand-and-nav">

                    <button className="mobile-menu-btn" onClick={toggleMenu}>
                    <span className="material-symbols-outlined">
                        {isMenuOpen ? 'close' : 'menu'}
                    </span>
                    </button>

                    <Link to="/" className="header-logo">
                        TroSinhVien
                    </Link>

                    <div className={`header-nav-links ${isMenuOpen ? 'open' : ''}`}>
                        <NavLink to="/postlist" className={({isActive}) => isActive ? "nav-link-active" : "nav-link"}>
                            Phòng
                        </NavLink>
                        <NavLink to="/pricing" className={({isActive}) => isActive ? "nav-link-active" : "nav-link"}>
                            Gói Tin
                        </NavLink>
                        <NavLink to="/uudai" className={({isActive}) => isActive ? "nav-link-active" : "nav-link"}>
                            Ưu Đãi
                        </NavLink>
                        <NavLink to="/blog" className={({isActive}) => isActive ? "nav-link-active" : "nav-link"}>
                            Blog
                        </NavLink>
                        <NavLink to="/lienhe" className={({isActive}) => isActive ? "nav-link-active" : "nav-link"}>
                            Liên Hệ
                        </NavLink>
                    </div>
                </div>

                <div className="search-container">
                    <IconSearch className="search-icon-svg"/>
                    <input className="search-input" placeholder="Search..." type="text"/>
                </div>

                {/* 3. Render giao diện có điều kiện dựa trên trạng thái user */}
                {/* <div className="header-auth-section">
                    {user ? (
                        // Nếu ĐÃ đăng nhập
                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span className="welcome-text">
                                Chào, <strong>{user.username}</strong>
                            </span>
                            <button onClick={handleLogoutClick} className="btn-logout" style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        // Nếu CHƯA đăng nhập
                        <button onClick={handleLoginClick} className="btn-login">
                            Đăng nhập
                        </button>
                    )}
                </div> */}

                    {/* 3. Render giao diện có điều kiện dựa trên trạng thái user */}
                <div className="header-auth-section">
                    {user ? (
                        // Nếu ĐÃ đăng nhập
                        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span className="welcome-text">
                                Chào, <strong>{user.username}</strong>
                            </span>
                            <button onClick={handleLogoutClick} className="btn-logout" style={{ cursor: 'pointer', padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        // Nếu CHƯA đăng nhập
                        <button onClick={handleLoginClick} className="btn-login">
                            Đăng nhập
                        </button>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Header;