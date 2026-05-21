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

import PostRoom from '../pages/PostRoom';
import LandlordDashboard from '../pages/LandlordDashboard';

import AdminDashboard from '../pages/Admin/AdminDashboard';
import SystemStatistics from '../pages/Admin/SystemStatistics';
import AccountManagement from '../pages/Admin/AccountAdmin';
import Blacklist from '../pages/Blacklist';
import FinancialManagement from '../pages/Finance';
import PostManagement from '../pages/Admin/PostManagement';
import VoucherManagement from '../pages/Admin/VoucherManagement';
import PackageManagement from '../pages/Admin/PackageManagement';
import PaymentCallback from '../pages/PaymentCallback';

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
    }
];

export const landlordRoutes = [
    {
        path: config.routes.post,
        component: PostRoom,
        layout: MainLayout
    },
    {
        path: config.routes.landlordDashboard,
        component: LandlordDashboard
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
        path: config.routes.adminStatistics,
        component: SystemStatistics,
        layout: AdminLayout
    },
    {
        path: config.routes.adminAccounts,
        component: AccountManagement,
        layout: AdminLayout
    },
    {
        path: config.routes.adminBlacklist,
        component: Blacklist,
        layout: AdminLayout
    },
    {
        path: config.routes.adminFinance,
        component: FinancialManagement,
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
        path: config.routes.adminPackages,
        component: PackageManagement,
        layout: AdminLayout
    }
];