import React, { useState, useEffect } from 'react';
import BookingService from '../../../../services/bookingService';
import PostService from '../../../../services/postService';
import BookingManagementTab from '../BookingManagementTab';
import './OverviewTab.css'

const OverviewTab = ({ activeTab }) => {
    const [bookings, setBookings] = useState([]);
    const [postStats, setPostStats] = useState({ totalViews: 0, activePostsCount: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch dữ liệu lịch hẹn
                const bookingRes = await BookingService.getLandlordBookings();
                setBookings(bookingRes.data || []);

                // 2. Fetch dữ liệu bài đăng để tính toán thống kê
                const postRes = await PostService.getMyPosts();
                const posts = postRes?.data || [];

                let views = 0;
                let activeCount = 0;

                // Lặp qua tất cả bài đăng để cộng dồn lượt xem và đếm bài đang hiển thị
                posts.forEach(post => {
                    views += (post.views || 0);
                    // Điều chỉnh chuỗi status này cho khớp với database của bạn ('ACTIVE', 'Đang hiển thị', v.v.)
                    if (post.status === 'ACTIVE' || post.status === 'Đang hiển thị' || post.status === 'APPROVED') {
                        activeCount += 1;
                    }
                });

                setPostStats({ totalViews: views, activePostsCount: activeCount });

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu tổng quan:", err);
            }
        };

        // Chỉ fetch data nếu đang ở tab dashboard
        if (activeTab === 'dashboard') {
            fetchDashboardData();
        }
    }, [activeTab]);

    return (
        <div className="landlord-fade-in">
            <div className="landlord-stat-grid">

                {/* Thống kê Tổng lượt xem */}
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#e6f7ff', color: '#1890ff'}}>📊</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Tổng lượt xem</span>
                        <h2 className="landlord-stat-value">
                            {postStats.totalViews.toLocaleString('vi-VN')}
                        </h2>
                    </div>
                </div>

                {/* Thống kê Lịch hẹn chờ duyệt */}
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#f6ffed', color: '#52c41a'}}>📅</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Lịch hẹn mới</span>
                        <h2 className="landlord-stat-value">
                            {bookings.filter(b => b.status === 'PENDING').length}
                        </h2>
                    </div>
                </div>

                {/* Thống kê Bài đăng đang active */}
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#fff7e6', color: '#fa8c16'}}>🏠</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Tin đang hiển thị</span>
                        <h2 className="landlord-stat-value">
                            {postStats.activePostsCount}
                        </h2>
                    </div>
                </div>

            </div>

            {/* Nhúng list lịch hẹn vào Dashboard */}
            <BookingManagementTab activeTab={activeTab} />
        </div>
    );
};

export default OverviewTab;