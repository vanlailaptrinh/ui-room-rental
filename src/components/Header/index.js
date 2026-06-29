import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../../context/authContext';
import NotificationBell from '../NotificationBell';
import HeaderAuthSection from '../HeaderAuthSection';
import roomService from '../../services/roomService';

function Header() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);

    const searchParams = new URLSearchParams(location.search);
    const activeTypeValue = searchParams.get('type');

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const result = await roomService.getRoomTypes();
                if (result && result.code === 200 && Array.isArray(result.data)) {
                    setRoomTypes(result.data);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách loại phòng ở Header:", error);
            }
        };
        fetchRoomTypes();
    }, []);

    const handleRoomTypeClick = (type) => {
        const typeValue = type && typeof type === 'object' ? type.value : type;

        if (typeValue) {
            navigate(`/postlist?type=${encodeURIComponent(typeValue)}`);
        } else {
            navigate(`/postlist`);
        }
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    const isRoomPageActive = location.pathname === '/postlist';

    return (
        <nav className="header-nav">
            <div className="header-container">

                <div className="brand-and-nav">
                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(v => !v)}>
                        <span className="material-symbols-outlined">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <Link to="/" className="header-logo" onClick={() => { setIsMenuOpen(false); setIsDropdownOpen(false); }}>
                        TroSinhVien
                    </Link>

                    <div className={`header-nav-links ${isMenuOpen ? 'open' : ''}`}>
                        <Link
                            to="/"
                            className={location.pathname === '/' ? "nav-link-active" : "nav-link"}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Trang chủ
                        </Link>

                        <div
                            className="header-dropdown"
                            onMouseEnter={() => setIsDropdownOpen(true)}
                            onMouseLeave={() => setIsDropdownOpen(false)}
                        >
                            <button
                                className={isRoomPageActive ? "nav-link-active" : "nav-link"}
                                onClick={() => handleRoomTypeClick(null)}
                            >
                                Phòng
                            </button>

                            {isDropdownOpen && roomTypes.length > 0 && (
                                <div className="dropdown-menu">
                                    {roomTypes.map((type, index) => {
                                        const currentEncoding = type && typeof type === 'object' ? type.value : type;
                                        const displayName = type && typeof type === 'object' ? type.name : type;

                                        const isActive = isRoomPageActive &&
                                            activeTypeValue &&
                                            decodeURIComponent(activeTypeValue).toUpperCase() === String(currentEncoding).toUpperCase();

                                        return (
                                            <button
                                                key={currentEncoding || index}
                                                className={isActive ? "dropdown-item active" : "dropdown-item"}
                                                onClick={() => handleRoomTypeClick(type)}
                                            >
                                                {displayName}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="header-right-actions">
                    {user && <NotificationBell />}
                    <HeaderAuthSection />
                </div>

            </div>
        </nav>
    );
}

export default Header;