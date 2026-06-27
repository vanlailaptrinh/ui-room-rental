import React, { useState, useEffect } from 'react';
import UserService from '../../../services/userService';
import './BlacklistManagement.css';

const BlacklistManagement = () => {
    const [bannedUsers, setBannedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tất cả');

    // Gọi API lấy danh sách user bị khóa khi component mount
    const fetchBannedUsers = async () => {
        try {
            setLoading(true);
            const response = await UserService.getBannedUsers();
            if (response && response.data) {
                setBannedUsers(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách chặn:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBannedUsers();
    }, []);

    // Hàm xử lý Mở khóa tài khoản (Bỏ chặn)
    const handleUnbanUser = async (userId, username) => {
        const confirmUnban = window.confirm(`Bạn có chắc chắn muốn bỏ chặn cho tài khoản "${username}" không?`);
        if (!confirmUnban) return;

        try {
            const response = await UserService.toggleUserStatus(userId, true);
            if (response) {
                alert(response.message || "Đã gỡ bỏ tài khoản khỏi danh sách đen thành công!");
                setBannedUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            }
        } catch (error) {
            console.error("Lỗi khi bỏ chặn người dùng:", error);
            alert("Có lỗi xảy ra khi thực hiện thao tác này.");
        }
    };

    // Lọc dữ liệu theo ô tìm kiếm và chip filter Vai trò (Role)
    const filteredUsers = bannedUsers.filter(user => {
        const matchesSearch = 
            (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.phone && user.phone.includes(searchTerm));

        const matchesFilter = 
            activeFilter === 'Tất cả' || 
            (activeFilter === 'Chủ nhà' && user.role === 'LANDLORD') ||
            (activeFilter === 'Người thuê' && user.role === 'USER') ||
            (activeFilter === 'Quản trị viên' && user.role === 'ADMIN');

        return matchesSearch && matchesFilter;
    });

    // Thống kê số lượng theo vai trò
    const countByRole = (role) => bannedUsers.filter(u => u.role === role).length;

    return (
        <div className="bl-management-container">
            
            {/* Thanh tìm kiếm và Tiêu đề nội dung */}
            <div className="bl-content-header">
                <h1 className="bl-content-title">QUẢN LÝ DANH SÁCH ĐEN</h1>
                <div className="bl-search-box">
                    <input 
                        type="text" 
                        className="bl-search-input" 
                        placeholder="Tìm kiếm tài khoản, email, sđt..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Cụm thống kê Bento Grid Động */}
            <section className="stats-bento">
                <div className="stat-card main-bento">
                    <div style={{ zIndex: 10 }}>
                        <p className="stat-label">Tổng tài khoản bị chặn</p>
                        <h3 className="stat-number">{bannedUsers.length}</h3>
                    </div>
                    <div style={{ zIndex: 10 }}>
                        <span className="stat-growth-badge">Trạng thái: isActive = false</span>
                    </div>
                    <span className="material-symbols-outlined bg-watermark-icon">block</span>
                </div>
                
                <div className="stat-card border-left-error">
                    <p className="stat-label">Chủ nhà (LANDLORD)</p>
                    <h3 className="stat-number">{countByRole('LANDLORD')}</h3>
                    <p className="stat-percent">
                        Chiếm {bannedUsers.length > 0 ? ((countByRole('LANDLORD') / bannedUsers.length) * 100).toFixed(1) : 0}%
                    </p>
                </div>
                
                <div className="stat-card border-left-tertiary">
                    <p className="stat-label">Người thuê (USER)</p>
                    <h3 className="stat-number">{countByRole('USER')}</h3>
                    <p className="stat-percent">
                        Chiếm {bannedUsers.length > 0 ? ((countByRole('USER') / bannedUsers.length) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            </section>

            {/* Thanh công cụ Lọc */}
            <div className="filter-header">
                <div className="flx-row-center" style={{ gap: '1rem' }}>
                    <h2 className="filter-title font-manrope">Danh sách tài khoản vi phạm</h2>
                    <div className="v-divider"></div>
                    <div className="flx-row-center" style={{ gap: '0.5rem' }}>
                        {['Tất cả', 'Chủ nhà', 'Người thuê', 'Quản trị viên'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`chip ${activeFilter === filter ? 'active' : 'inactive'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bảng dữ liệu người dùng bị khóa */}
            <div className="table-container">
                {loading ? (
                    <div className="loading-state">Đang tải danh sách người dùng...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">Không tìm thấy tài khoản vi phạm nào.</div>
                ) : (
                    <table className="bl-table">
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Liên hệ</th>
                                <th>Vai trò</th>
                                <th>Xác thực Email</th>
                                <th>Trạng thái hoạt động</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flx-row-center" style={{ gap: '0.75rem' }}>
                                            <div className="user-avatar">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.username} />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="txt-bold">{user.username || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="txt-bold" style={{ fontWeight: 400 }}>{user.email}</div>
                                        <div className="txt-sub">{user.phone || 'Chưa cung cấp SĐT'}</div>
                                    </td>
                                    <td>
                                        <span className={`role-badge role-${user.role ? user.role.toLowerCase() : 'user'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flx-row-center" style={{ gap: '0.25rem' }}>
                                            <span className={`material-symbols-outlined ${user.isVerified ? 'verified-icon' : 'unverified-icon'}`}>
                                                {user.isVerified ? 'verified' : 'cancel'}
                                            </span>
                                            <span style={{ fontSize: '0.875rem' }}>
                                                {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-indicator-banned">
                                            <span className="status-dot"></span> Đang bị khóa
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flx-row-center" style={{ gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <span className="user-rating-score">
                                                ⭐ {user.rating ? user.rating.toFixed(1) : '0.0'}
                                            </span>
                                            <button 
                                                className="btn-icon secondary-color" 
                                                title="Mở khóa tài khoản"
                                                onClick={() => handleUnbanUser(user.id, user.username)}
                                            >
                                                <span className="material-symbols-outlined">lock_open</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Banner Cảnh báo */}
            <div className="warning-banner">
                <div className="warning-content">
                    <h4 className="font-manrope">Chính sách xử lý tài khoản vi phạm</h4>
                    <p>Mọi tài khoản nằm trong danh sách đen đều bị vô hiệu hóa (isActive = false) và không thể đăng nhập vào hệ thống. Việc gỡ bỏ yêu cầu có sự xác minh chuẩn xác của quản trị viên hệ thống.</p>
                </div>
                <div className="warning-gradient"></div>
            </div>
        </div>
    );
};

export default BlacklistManagement;