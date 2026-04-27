import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import PostList from "../pages/PostList";
import Detail from "../pages/Detail";
import Login from "../pages/Login";
import Verify from '../pages/Verify';
import ForgotPassword from '../pages/ForgotPassword';
import Register from '../pages/Register';
import AccountManagement from "../pages/AccountManagement"; 
import PostRoom from "../pages/PostRoom";
import Favorites from "../pages/Favorites";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import LandlordDashboard from "../pages/LandlordDashboard";
import Pricing from "../pages/Pricing";
import Blacklist from "../pages/Blacklist";
import FinancialManagement from "../pages/Finance";
import PostManagement from "../pages/PostManagement";
import VoucherManagement from "../pages/VoucherManagement";


// Import trang Admin Dashboard cũ
import AdminDashboard from '../pages/AdminDashboard';

// ĐÃ SỬA: Import trang Thống kê từ thư mục mới bạn vừa tạo
import SystemStatistics from '../pages/SystemStatistics'; 

function AppRoutes() {
    return (
        <Routes>
            {/* 1. Nhóm Route cho Authentication & Guest */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<Chat />} />

            {/* 2. Nhóm Dashboard/Cá nhân: Tự có Sidebar riêng */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Route thống kê  SystemStatistics */}
            <Route path="/admin/statistics" element={<SystemStatistics />} />

            {/* Route quản lý tài khoản */}
            <Route path="/admin/account-management" element={<AccountManagement />} />

            {/* Route quản lý danh sách đen */}
            <Route path="/admin/blacklist" element={<Blacklist />} />

            {/* Route quản lý tài chính */}
            <Route path="/admin/finance" element={<FinancialManagement />} />

            {/* Route quản lý bài đăng */}
            <Route path="/admin/post-management" element={<PostManagement />} />
            
            {/* Route quản lý voucher */}
            <Route path="/admin/voucher-management" element={<VoucherManagement />} />

            {/* 3. Nhóm Route dùng MainLayout cho khách hàng */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/postlist" element={<PostList />} />
                <Route path="/detail/:id" element={<Detail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/post" element={<PostRoom />} />
                <Route path="/landlord" element={<LandlordDashboard />} />
                <Route path="/pricing" element={<Pricing />} />
            </Route>

            {/* 4. Điều hướng mặc định */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;