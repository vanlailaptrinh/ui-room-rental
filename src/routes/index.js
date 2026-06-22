import MainLayout from '../layouts/MainLayout';
import HeaderLayout from '../layouts/HeaderLayout';
import AdminLayout from '../layouts/AdminLayout';

import config from '../config';

import Home from '../pages/Home';
import PostList from '../pages/PostList';
import Detail from '../pages/Detail';
import PacketPage from '../pages/Packet';

import Login from '../pages/Login';
import Verify from '../pages/Verify';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

import Profile from '../pages/Profile';
import Favorites from '../pages/Favorites';
import Chat from '../pages/Chat';
import ChatRoom from '../pages/ChatRoom';
import MyBookings from '../pages/MyBookings';
import Reports from '../pages/Reports';

import PostRoom from '../pages/PostRoom';
import Landlord from '../pages/Landlord';
import PaymentCallback from '../pages/PaymentCallback';

import AdminDashboard from '../pages/Admin/AdminDashboard';
import AccountManagement from '../pages/Admin/AccountManagement';
import AmenityManagement from '../pages/Admin/AmenityManagement';
import FinanceManagement from '../pages/Admin/FinanceManagement';
import PackageManagement from '../pages/Admin/PackageManagement';
import PostManagement from '../pages/Admin/PostManagement';
import VoucherManagement from '../pages/Admin/VoucherManagement';
import ReportManagement from '../pages/Admin/ReportManagement';
import Blacklist from '../pages/Blacklist';

export const publicRoutes = [
    {
        path: config.routes.home,
        component: Home,
        layout: MainLayout
    },
    {
        path: config.routes.postList,
        component: PostList,
        layout: MainLayout
    },
    {
        path: config.routes.detail,
        component: Detail,
        layout: MainLayout
    },
    {
        path: config.routes.packet,
        component: PacketPage,
        layout: MainLayout
    }
];

export const guestRoutes = [
    {
        path: config.routes.login,
        component: Login,
        layout: HeaderLayout
    },
    {
        path: config.routes.register,
        component: Register,
        layout: HeaderLayout
    },
    {
        path: config.routes.verify,
        component: Verify,
        layout: HeaderLayout
    },
    {
        path: config.routes.forgotPassword,
        component: ForgotPassword,
        layout: HeaderLayout
    },
    {
        path: config.routes.resetPassword,
        component: ResetPassword,
        layout: HeaderLayout
    }
];

export const userRoutes = [
    {
        path: config.routes.profile,
        component: Profile,
        layout: MainLayout
    },
    {
        path: config.routes.favorites,
        component: Favorites,
        layout: MainLayout
    },
    {
        path: config.routes.chat,
        component: Chat,
        layout: MainLayout
    },
    {
        path: config.routes.chatRoom,
        component: ChatRoom,
        layout: MainLayout
    },
    {
        path: config.routes.myBookings,
        component: MyBookings,
        layout: MainLayout
    },
    {
        path: config.routes.reports,
        component: Reports,
        layout: MainLayout
    }
];

export const landlordRoutes = [
    {
        path: config.routes.post,
        component: PostRoom,
        layout: MainLayout
    },
    {
        path: config.routes.landlord,
        component: Landlord
    },
    {
        path: config.routes.paymentCallback,
        component: PaymentCallback
    }
];

export const adminRoutes = [
    {
        path: config.routes.adminDashboard,
        component: AdminDashboard,
        layout: AdminLayout
    },
    {
        path: config.routes.adminAccounts,
        component: AccountManagement,
        layout: AdminLayout
    },
    {
        path: config.routes.adminAmenities,
        component: AmenityManagement,
        layout: AdminLayout
    },
    {
        path: config.routes.adminBlacklist,
        component: Blacklist,
        layout: AdminLayout
    },
    {
        path: config.routes.adminFinance,
        component: FinanceManagement,
        layout: AdminLayout
    },
    {
        path: config.routes.adminPackages,
        component: PackageManagement,
        layout: AdminLayout
    },
    {
        path: config.routes.adminPosts,
        component: PostManagement,
        layout: AdminLayout
    },
    {
        path: config.routes.adminVouchers,
        component: VoucherManagement,
        layout: AdminLayout
    },
    {
        path: config.routes.adminReports,
        component: ReportManagement,
        layout: AdminLayout
    },
];
