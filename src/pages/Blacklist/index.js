// src/pages/Blacklist/index.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Thêm Link nếu bạn dùng react-router-dom
import './Blacklist.css';

const Blacklist = () => {
    const [activeFilter, setActiveFilter] = useState('Tất cả');

    // Dữ liệu mô phỏng
    const blacklistData = [
        {
            id: '49281',
            name: 'Nguyễn Văn A',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBENLfFY-LoYLtfY_phed0aQttXi2huMMGdrA2fWazT4tp9_pdIqDwI4UcajoS1qTsWtzR-JR5QXj14cugs8T2wFuff_9vWul-FzxD7TS_ZjwFVcHjXk8Fyk0hnEEXYJ5_eY5tTpeEe_gquznBVAJOVO_M-ZZBsuYxCCzybIti-ipIy6XfJn_x9-00qc1vL_MvvggAi_c7PDYpsfsW0EAUdEBr_c0Ekw8pVv79BtDAWPalynUO4It09uSWqFESbJnbE9uWCgZLlCz8', // Thay bằng URL avatar thật
            isIP: false,
            email: 'nva.fraud@email.com',
            phone: '0901 234 567',
            violationType: 'Lừa đảo (Fraud)',
            violationBadge: 'badge-fraud',
            date: '15/10/2023',
            adminName: 'Anh Đức',
            adminInitials: 'AD',
            adminColor: 'avt-blue'
        },
        {
            id: '51022',
            name: 'Trần Thị B',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjDSC03dYTdPpbyCO6auUddgtmYWWu52axjOqhMhrRgVzw87NWqS6oBI18qEBkIBlwhduF_OiGSnwDnJc-8OKTFv0N31B5r87EesyHxaE0zSFi8WfSk7v0JK5VVgmm38COronJ7zvv6kSu05AGgH-I17aIBOVGCnkfDOoIvaaUo9E0oXmbr0cPLYUxJX5LoViFy8JaTkftXEGaxT3D3DQWSvQJCCelRpA_cxCJ126LXteb6qIKecSGx1oeewkEI9zogQspuXGpTKI', // Thay bằng URL avatar thật
            isIP: false,
            email: 'ttb.scam@email.com',
            phone: '0938 111 222',
            violationType: 'Quấy rối (Scam)',
            violationBadge: 'badge-scam',
            date: '20/10/2023',
            adminName: 'Minh Hòa',
            adminInitials: 'MH',
            adminColor: 'avt-blue'
        },
        {
            id: 'IP',
            name: 'Địa chỉ IP: 192.168.1.45',
            avatar: 'dns',
            isIP: true,
            location: 'Vị trí: Hà Nội, VN',
            network: 'Dải mạng VNPT',
            violationType: 'Spam Bot',
            violationBadge: 'badge-spam',
            date: '22/10/2023',
            adminName: 'Hệ thống',
            adminInitials: 'SYS',
            adminColor: 'avt-gray'
        }
    ];

    return (
        <div className="bl-page-wrapper">
            
            {/* --- SIDEBAR --- */}
            <aside className="bl-sidebar">
                <div className="bl-sidebar-logo">
                    The Editorial Marketplace
                </div>
                
                <nav className="bl-nav">
                    {/* Dùng thẻ <a> hoặc <Link> tùy theo dự án của bạn */}
                    <a href="/admin/dashboard" className="bl-nav-item">
                        <span className="material-symbols-outlined">dashboard</span> Bảng điều khiển
                    </a>
                    <a href="#" className="bl-nav-item">
                        <span className="material-symbols-outlined">confirmation_number</span> Quản lý Voucher
                    </a>
                    {/* Active State */}
                    <a href="#" className="bl-nav-item active">
                        <span className="material-symbols-outlined">block</span> Quản lý Danh sách đen
                    </a>
                    <a href="account-management" className="bl-nav-item">
                        <span className="material-symbols-outlined">group</span> Quản lý Người dùng
                    </a>
                    <a href="#" className="bl-nav-item">
                        <span className="material-symbols-outlined">apartment</span> Quản lý Bài đăng
                    </a>
                    <a href="/admin/finance" className="bl-nav-item">
                        <span className="material-symbols-outlined">payments</span> Quản lý Tài chính
                    </a>
                    <a href="#" className="bl-nav-item">
                        <span className="material-symbols-outlined">report</span> Quản lý Báo cáo
                    </a>
                    <a href="#" className="bl-nav-item">
                        <span className="material-symbols-outlined">gavel</span> Xử lý tranh chấp
                    </a>
                    <a href="/admin/statistics" className="bl-nav-item">
                        <span className="material-symbols-outlined">analytics</span> Thống kê hệ thống
                    </a>
                </nav>

                <div className="bl-sidebar-footer">
                    <a href="#" className="bl-nav-item">
                        <span className="material-symbols-outlined">settings</span> Settings
                    </a>
                    <div className="bl-admin-profile">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdLPbrMLtlYCjXT-Moj15oZwUKmzXzC0wCO7koQic264uBBUBemc9EXujm8U1aE8HwjXXUS4gErFAoUWgPAVGQXHZROZi1KyTLJvowUad6phNFFYi-IX7g9IciUUtk1K5_J4s4CWEN4AiprvqL9KUPIYqom_91L93XWV_NsSbDgkksRkYsu1De6zrHTjN-KghzxEL4Rpqi9IaOvCw5hALQlWZPsKOzhuaqdVYQuX1mbxR4PsEZRYvsYuTuv_S3CMJTzvJc2N7COzs" alt="Admin" />
                        <div className="bl-admin-info">
                            <span className="bl-admin-name">Editorial Admin</span>
                            <span className="bl-admin-role">Marketplace Manager</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- HEADER --- */}
            <header className="bl-header">
                <h1 className="bl-header-title">QUẢN LÝ DANH SÁCH ĐEN</h1>
                <div className="bl-header-actions">
                    <div className="bl-search-box">
                        <span className="material-symbols-outlined">search</span>
                        <input type="text" className="bl-search-input" placeholder="Tìm kiếm tài khoản/IP..." />
                    </div>
                    <div className="flx-row-center" style={{ gap: '0.5rem' }}>
                        <button className="bl-icon-btn"><span className="material-symbols-outlined">notifications</span></button>
                        <button className="bl-icon-btn"><span className="material-symbols-outlined">mail</span></button>
                        <button className="bl-icon-btn"><span className="material-symbols-outlined">account_circle</span></button>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="bl-main-content">
                {/* Cụm thống kê Bento Grid */}
                <section className="stats-bento">
                    <div className="stat-card main-bento">
                        <div style={{ zIndex: 10 }}>
                            <p className="stat-label">Tổng tài khoản bị chặn</p>
                            <h3 className="stat-number">1.284</h3>
                        </div>
                        <div style={{ zIndex: 10 }}>
                            <span className="stat-growth-badge">+12% so với tháng trước</span>
                        </div>
                        <span className="material-symbols-outlined bg-watermark-icon">block</span>
                    </div>
                    
                    <div className="stat-card border-left-error">
                        <p className="stat-label">Lừa đảo (Fraud)</p>
                        <h3 className="stat-number">452</h3>
                        <p className="stat-percent">Chiếm 35.2%</p>
                    </div>
                    
                    <div className="stat-card border-left-tertiary">
                        <p className="stat-label">Quấy rối (Harassment)</p>
                        <h3 className="stat-number">312</h3>
                        <p className="stat-percent">Chiếm 24.3%</p>
                    </div>
                </section>

                {/* Thanh công cụ Tìm kiếm / Lọc */}
                <div className="filter-header">
                    <div className="flx-row-center" style={{ gap: '1rem' }}>
                        <h2 className="filter-title font-manrope">Danh sách đối tượng vi phạm</h2>
                        <div className="v-divider"></div>
                        <div className="flx-row-center" style={{ gap: '0.5rem' }}>
                            {['Tất cả', 'Lừa đảo', 'IP Spam'].map(filter => (
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
                    <button className="btn-primary">
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add</span>
                        Thêm vào danh sách đen
                    </button>
                </div>

                {/* Bảng dữ liệu */}
                <div className="table-container">
                    <table className="bl-table">
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Liên hệ</th>
                                <th>Loại vi phạm</th>
                                <th>Ngày thêm</th>
                                <th>Admin xử lý</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blacklistData.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="flx-row-center" style={{ gap: '0.75rem' }}>
                                            <div className="user-avatar">
                                                {item.isIP ? (
                                                    <span className="material-symbols-outlined">{item.avatar}</span>
                                                ) : (
                                                    <img src={item.avatar} alt="avatar" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="txt-bold">{item.name}</div>
                                                <div className="txt-sub">{item.isIP ? item.location : `ID: #${item.id}`}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="txt-bold" style={{ fontWeight: 400 }}>{item.isIP ? 'N/A' : item.email}</div>
                                        <div className="txt-sub">{item.isIP ? item.network : item.phone}</div>
                                    </td>
                                    <td>
                                        <span className={`violation-badge ${item.violationBadge}`}>
                                            {item.violationType}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.875rem' }}>{item.date}</span>
                                    </td>
                                    <td>
                                        <div className="flx-row-center" style={{ gap: '0.5rem' }}>
                                            <div className={`admin-avt ${item.adminColor}`}>{item.adminInitials}</div>
                                            <span style={{ fontSize: '0.875rem' }}>{item.adminName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flx-row-center" style={{ gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button className="btn-icon primary-color" title="Xem chi tiết">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                            <button className="btn-icon secondary-color" title="Bỏ chặn">
                                                <span className="material-symbols-outlined">lock_open</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Phân trang */}
                    <div className="pagination-bar">
                        <span className="page-desc">Hiển thị 1-10 trên 1.284 kết quả</span>
                        <div className="flx-row-center" style={{ gap: '0.25rem' }}>
                            <button className="page-btn">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>chevron_left</span>
                            </button>
                            <button className="page-btn active">1</button>
                            <button className="page-btn">2</button>
                            <button className="page-btn">3</button>
                            <span className="page-btn" style={{ cursor: 'default' }}>...</span>
                            <button className="page-btn">129</button>
                            <button className="page-btn">
                                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Banner Cảnh báo */}
                <div className="warning-banner">
                    <div className="warning-content">
                        <h4 className="font-manrope">Chính sách xử lý nghiêm ngặt</h4>
                        <p>Mọi tài khoản nằm trong danh sách đen đều đã được thẩm định qua ít nhất 2 bước xác thực. Việc gỡ bỏ khỏi danh sách đen yêu cầu sự phê duyệt từ Quản lý cấp cao.</p>
                    </div>
                    <div style={{ zIndex: 10 }}>
                        <button className="btn-outline-white">Xem quy định</button>
                    </div>
                    <div className="warning-gradient"></div>
                </div>
            </main>

            {/* Nút FAB góc phải */}
            <button className="fab-btn">
                <span className="material-symbols-outlined" style={{ fontSize: '1.875rem' }}>security</span>
            </button>
            
        </div>
    );
};

export default Blacklist;