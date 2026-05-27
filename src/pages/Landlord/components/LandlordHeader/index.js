import React, { useState, useEffect, useMemo } from 'react';
import NotificationBell from '../../../../components/NotificationBell';
import UserService from '../../../../services/userService';
import './LandlordHeader.css'
import HeaderAuthSection from '../../../../components/HeaderAuthSection'

const tabTitle = {
    dashboard:    'Bảng điều khiển',
    appointments: 'Quản lý lịch hẹn',
    listings:     'Tin đăng của tôi',
    messages:     'Tin nhắn',
    payments:     'Gói tin',
    reports:      'Báo cáo & Khiếu nại',
};

const LandlordHeader = ({ activeTab }) => {
    const [landlord, setLandlord] = useState(null);

    const landlordInitials = useMemo(() => {
        if (!landlord) return '??';
        const name = landlord.fullName || landlord.username || 'User';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [landlord]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await UserService.getUserProfile();
                setLandlord(data.data);
            } catch (err) {
                console.error('Lỗi lấy profile:', err);
            }
        };
        fetchProfile();
    }, []);

    return (
        <header className="landlord-main-header">
            <h1>{tabTitle[activeTab]}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <NotificationBell />
                <HeaderAuthSection />
            </div>
        </header>
    );
};

export default LandlordHeader;