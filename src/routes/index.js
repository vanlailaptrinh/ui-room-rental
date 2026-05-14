import MainLayout from '../layouts/MainLayout';

import config from '../config';

import Home from '../pages/Home';
import PostList from '../pages/PostList';
import Detail from '../pages/Detail';
import Pricing from '../pages/Pricing';

import Login from '../pages/Login';
import Verify from '../pages/Verify';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

import Profile from '../pages/Profile';
import Favorites from '../pages/Favorites';
import Chat from '../pages/Chat';
import MyBookings from '../pages/MyBookings';

import PostRoom from '../pages/PostRoom';
import LandlordDashboard from '../pages/LandlordDashboard';

import AdminDashboard from '../pages/AdminDashboard';
import SystemStatistics from '../pages/SystemStatistics';
import AccountManagement from '../pages/AccountManagement';
import Blacklist from '../pages/Blacklist';
import FinancialManagement from '../pages/Finance';
import PostManagement from '../pages/PostManagement';
import VoucherManagement from '../pages/VoucherManagement';
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
        path: config.routes.pricing,
        component: Pricing,
        layout: MainLayout
    }
];

export const guestRoutes = [
    {
        path: config.routes.login,
        component: Login
    },
    {
        path: config.routes.register,
        component: Register
    },
    {
        path: config.routes.verify,
        component: Verify
    },
    {
        path: config.routes.forgotPassword,
        component: ForgotPassword
    },
    {
        path: config.routes.resetPassword,
        component: ResetPassword
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
        component: AdminDashboard
    },
    {
        path: config.routes.adminStatistics,
        component: SystemStatistics
    },
    {
        path: config.routes.adminAccountManagement,
        component: AccountManagement
    },
    {
        path: config.routes.adminBlacklist,
        component: Blacklist
    },
    {
        path: config.routes.adminFinance,
        component: FinancialManagement
    },
    {
        path: config.routes.adminPostManagement,
        component: PostManagement
    },
    {
        path: config.routes.adminVoucherManagement,
        component: VoucherManagement
    }
];