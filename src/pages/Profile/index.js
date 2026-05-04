import React, { useState, useEffect } from 'react';
import './Profile.css';
import { IconChevronRight } from '../../assets/Icons';
import PropertyCard from "../../components/PropertyCard";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { getUserProfile, updateProfile } from '../../services/userService';

function Profile() {
    const [activeTab, setActiveTab] = useState('personal');
    const { user, logout, refreshUserProfile } = useAuth();
    const navigate = useNavigate();
    // State quản lý trạng thái loading khi bấm nút Lưu
    const [isSaving, setIsSaving] = useState(false);

    // 1. Tạo state để lưu trữ dữ liệu form đang nhập
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: ''
    });

    // 2. Khi biến 'user' có dữ liệu (API load xong), cập nhật vào form ngay
    useEffect(() => {
        const fetchFullProfile = async () => {
            try {
                // Gọi API lấy dữ liệu từ Backend
                const response = await getUserProfile();
                const userData = response.data;

                setFormData({
                    fullName: userData.username || '',
                    phone: userData.phone || '',
                    address: userData.address || ''
                });
            } catch (error) {
                console.error("Lỗi khi tải thông tin profile:", error);
            }
        };

        fetchFullProfile();
    }, []);

    const handleTabChange = (e, tabName) => {
        e.preventDefault();
        setActiveTab(tabName);
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    // 3. Hàm xử lý khi gõ chữ vào input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 4. Hàm xử lý khi bấm "Lưu thay đổi"
    const handleSaveChanges = async () => {
        try {
            setIsSaving(true);

            const dataToSubmit = {
                username: formData.fullName,
                phone: formData.phone,
                address: formData.address
            };
            console.log("Dữ liệu thực tế gửi đi:", dataToSubmit);

            const response = await updateProfile(dataToSubmit);
            console.log("Phản hồi từ BE:", response);
            alert("Cập nhật thông tin thành công!");
            await refreshUserProfile();


        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            alert("Có lỗi xảy ra khi cập nhật. Vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="account-container">
            <aside className="account-sidebar">
                <div className="sidebar-header">
                    <span className="account-type">Tài khoản sinh viên</span>
                    <p className="account-desc">Quản lý không gian của bạn</p>
                </div>

                <nav className="sidebar-nav">
                    <a
                        href="#personal"
                        className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'personal')}
                    >
                        <span className="material-symbols-outlined">person</span>
                        Thông tin cá nhân
                    </a>
                    <a href="#password" className="nav-item">
                        <span className="material-symbols-outlined">lock_reset</span>
                        Đổi mật khẩu
                    </a>
                    <a
                        href="#favorite"
                        className={`nav-item ${activeTab === 'favorite' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'favorite')}
                    >
                        <span className="material-symbols-outlined">favorite</span>
                        Phòng yêu thích
                    </a>
                    <a
                        href="#history"
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'history')}
                    >
                        <span className="material-symbols-outlined">history</span>
                        Lịch sử xem phòng
                    </a>
                    <a
                        href="#calendar"
                        className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
                        onClick={(e) => handleTabChange(e, 'calendar')}
                    >
                        <span className="material-symbols-outlined">calendar_month</span>
                        Lịch hẹn
                    </a>
                    <a href="#Notification" className="nav-item">
                        <span className="material-symbols-outlined">notifications</span>
                        Thông báo
                    </a>
                </nav>

                <div className="sidebar-footer">
                    {/* Gắn hàm Đăng xuất vào đây */}
                    <button onClick={handleLogoutClick} className="btn-secondary-full">Đăng xuất</button>
                </div>
            </aside>

            <section className="account-content">
                {activeTab === 'personal' && (
                    <div className="fade-in-animation">
                        <header className="content-header">
                            <h1>Thông tin tài khoản</h1>
                            <p>Cập nhật thông tin cá nhân và quản lý tài khoản của bạn.</p>
                        </header>

                        <div className="account-card main-form">
                            <div className="avatar-section">
                                <div className="avatar-wrapper">
                                    <img
                                        src={user?.avatar || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=150"}
                                        alt="Avatar"
                                    />
                                    <button className="btn-edit-avatar">
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                </div>
                                <div className="avatar-text">
                                    <h3>Ảnh đại diện</h3>
                                    <p>PNG, JPG tối đa 5MB. Khuyên dùng ảnh vuông.</p>
                                </div>
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Họ và tên</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Email liên hệ</label>
                                    {/* Email thường không cho sửa */}
                                    <input type="email" value={user?.email || ''} readOnly className="readonly-input"/>
                                </div>
                                <div className="input-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Địa chỉ</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button className="btn-ghost">Hủy bỏ</button>
                                <button className="btn-primary-lg" onClick={handleSaveChanges} disabled={isSaving}>
                                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>

                        {/* Section phòng đã lưu */}
                        <div className="saved-section">
                            <div className="section-flex-header">
                                <h2>Phòng đã lưu gần đây</h2>
                                <button className="btn-text">
                                    Xem tất cả <IconChevronRight width="16"/>
                                </button>
                            </div>

                            <div className="saved-grid">
                                <PropertyCard/>
                                <PropertyCard/>
                                <PropertyCard/>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div className="fade-in-animation apt-container">
                        <header className="apt-header">
                            <h1>Lịch Hẹn Của Tôi</h1>
                            <p>Quản lý các buổi tham quan và trao đổi với chủ hộ của bạn.</p>
                        </header>

                        <div className="apt-dashboard">
                            {/* Cột trái: Danh sách lịch hẹn */}
                            <div className="apt-list-section">
                                <div className="apt-section-header">
                                    <h2>Lịch hẹn sắp tới</h2>
                                    <button className="btn-view-all">Xem tất cả</button>
                                </div>

                                {/* Thẻ lịch hẹn 1 */}
                                <div className="apt-card">
                                    <div className="apt-card-image">
                                        <img alt="Apartment interior"
                                             src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"/>
                                    </div>
                                    <div className="apt-card-content">
                                        <div className="apt-card-top">
                                            <div className="apt-title-row">
                                                <h3>The Zenith Penthouse - Studio 402</h3>
                                                <span className="apt-badge badge-success">Đã xác nhận</span>
                                            </div>
                                            <p className="apt-location">
                                                <span className="material-symbols-outlined">location_on</span> Quận 1,
                                                TP. Hồ Chí Minh
                                            </p>
                                            <div className="apt-time-tags">
                                                <div className="apt-tag">
                                                    <span className="material-symbols-outlined icon-blue">event</span>
                                                    <span>Thứ Sáu, 24 Tháng 5</span>
                                                </div>
                                                <div className="apt-tag">
                                                    <span
                                                        className="material-symbols-outlined icon-blue">schedule</span>
                                                    <span>14:30 - 15:30</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="apt-card-bottom">
                                            <div className="apt-landlord">
                                                <img alt="Landlord profile" src="https://i.pravatar.cc/150?u=minh"/>
                                                <div className="apt-landlord-info">
                                                    <span className="label">Chủ hộ</span>
                                                    <span className="name">Ông Minh Trần</span>
                                                </div>
                                            </div>
                                            <div className="apt-actions">
                                                <button className="btn-apt-chat">
                                                    <span className="material-symbols-outlined">chat_bubble</span> Nhắn
                                                    tin
                                                </button>
                                                <button className="btn-apt-detail">Chi tiết</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Thẻ lịch hẹn 2 */}
                                <div className="apt-card">
                                    <div className="apt-card-image">
                                        <img alt="Shared room interior"
                                             src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5"/>
                                    </div>
                                    <div className="apt-card-content">
                                        <div className="apt-card-top">
                                            <div className="apt-title-row">
                                                <h3>Harmony Co-living - Phòng Đôi</h3>
                                                <span className="apt-badge badge-pending">Chờ xác nhận</span>
                                            </div>
                                            <p className="apt-location">
                                                <span className="material-symbols-outlined">location_on</span> Quận 7,
                                                TP. Hồ Chí Minh
                                            </p>
                                            <div className="apt-time-tags">
                                                <div className="apt-tag">
                                                    <span className="material-symbols-outlined icon-blue">event</span>
                                                    <span>Chủ Nhật, 26 Tháng 5</span>
                                                </div>
                                                <div className="apt-tag">
                                                    <span
                                                        className="material-symbols-outlined icon-blue">schedule</span>
                                                    <span>10:00 - 11:00</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="apt-card-bottom">
                                            <div className="apt-landlord">
                                                <img alt="Landlord profile" src="https://i.pravatar.cc/150?u=linh"/>
                                                <div className="apt-landlord-info">
                                                    <span className="label">Chủ hộ</span>
                                                    <span className="name">Bà Linh Nguyễn</span>
                                                </div>
                                            </div>
                                            <div className="apt-actions">
                                                <button className="btn-apt-chat">
                                                    <span className="material-symbols-outlined">chat_bubble</span> Nhắn
                                                    tin
                                                </button>
                                                <button className="btn-apt-detail">Chi tiết</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cột phải: Mini Calendar */}
                            <div className="apt-sidebar">
                                <div className="apt-calendar-widget">
                                    <div className="apt-cal-header">
                                        <h3>Tháng 5, 2024</h3>
                                        <div className="apt-cal-nav">
                                            <button><span className="material-symbols-outlined">chevron_left</span>
                                            </button>
                                            <button><span className="material-symbols-outlined">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="apt-cal-days">
                                        <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
                                    </div>
                                    <div className="apt-cal-dates">
                                        <div className="date prev-month">28</div>
                                        <div className="date prev-month">29</div>
                                        <div className="date prev-month">30</div>
                                        <div className="date">1</div>
                                        <div className="date">2</div>
                                        <div className="date">3</div>
                                        <div className="date">4</div>
                                        <div className="date">5</div>
                                        <div className="date">6</div>
                                        <div className="date">7</div>
                                        <div className="date">8</div>
                                        <div className="date">9</div>
                                        <div className="date">10</div>
                                        <div className="date">11</div>
                                        <div className="date">12</div>
                                        <div className="date">13</div>
                                        <div className="date has-event event-blue">14</div>
                                        <div className="date">15</div>
                                        <div className="date">16</div>
                                        <div className="date">17</div>
                                        <div className="date">18</div>
                                        <div className="date">19</div>
                                        <div className="date">20</div>
                                        <div className="date">21</div>
                                        <div className="date">22</div>
                                        <div className="date">23</div>
                                        <div className="date active">24</div>
                                        <div className="date has-event event-blue">25</div>
                                        <div className="date has-event event-yellow">26</div>
                                        <div className="date">27</div>
                                        <div className="date">28</div>
                                        <div className="date">29</div>
                                        <div className="date">30</div>
                                        <div className="date">31</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'history' && (
                    <div className="saved-section">
                        <div className="section-flex-header">
                            <h2>Phòng đã lưu gần đây</h2>
                            <button className="btn-text">
                                Xem tất cả <IconChevronRight width="16"/>
                            </button>
                        </div>

                        <div className="saved-grid">
                            <PropertyCard/>
                            <PropertyCard/>
                            <PropertyCard/>
                        </div>
                    </div>
                )}
                {activeTab === 'favorite' && (
                    <div className="saved-section">
                        <div className="section-flex-header">
                            <h2>Phòng đã lưu gần đây</h2>
                            <button className="btn-text">
                                Xem tất cả <IconChevronRight width="16"/>
                            </button>
                        </div>

                        <div className="saved-grid">
                            <PropertyCard/>
                            <PropertyCard/>
                            <PropertyCard/>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

export default Profile;