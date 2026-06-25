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
        // Lấy trường "value" (ví dụ: APARTMENT, SINGLE) để truyền lên URL
        const typeValue = type && typeof type === 'object' ? type.value : type;

        if (typeValue) {
            navigate(`/postlist?type=${encodeURIComponent(typeValue)}`);
        } else {
            navigate(`/postlist`);
        }
        setIsMenuOpen(false);
    };

    return (
        <nav className="header-nav">
            <div className="header-container">

                <div className="brand-and-nav">
                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(v => !v)}>
                        <span className="material-symbols-outlined">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <Link to="/" className="header-logo">TroSinhVien</Link>

                    <div className={`header-nav-links ${isMenuOpen ? 'open' : ''}`}>
                        {roomTypes.map((type, index) => {
                            const currentEncoding = type && typeof type === 'object' ? type.value : type;
                            const displayName = type && typeof type === 'object' ? type.name : type;

                            // So sánh khớp chính xác chữ viết hoa/thường (ví dụ: APARTMENT)
                            const isActive = location.pathname === '/postlist' &&
                                activeTypeValue &&
                                decodeURIComponent(activeTypeValue).toUpperCase() === String(currentEncoding).toUpperCase();

                            return (
                                <button
                                    key={currentEncoding || index}
                                    className={isActive ? "nav-link-active" : "nav-link"}
                                    onClick={() => handleRoomTypeClick(type)}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
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