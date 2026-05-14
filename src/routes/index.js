import { Fragment } from 'react';

import MainLayout from '../layouts/MainLayout';

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
        path: '/',
        component: Home,
        layout: MainLayout
    },
    {
        path: '/postlist',
        component: PostList,
        layout: MainLayout
    },
    {
        path: '/detail/:id',
        component: Detail,
        layout: MainLayout
    },
    {
        path: '/pricing',
        component: Pricing,
        layout: MainLayout
    },
    {
        path: '/payment-callback',
        component: PaymentCallback
    }
];

export const guestRoutes = [
    {
        path: '/login',
        component: Login
    },
    {
        path: '/register',
        component: Register
    },
    {
        path: '/verify',
        component: Verify
    },
    {
        path: '/forgot-password',
        component: ForgotPassword
    },
    {
        path: '/reset-password',
        component: ResetPassword
    }
];

export const userRoutes = [
    {
        path: '/profile',
        component: Profile,
        layout: MainLayout
    },
    {
        path: '/favorites',
        component: Favorites,
        layout: MainLayout
    },
    {
        path: '/chat',
        component: Chat,
        layout: MainLayout
    },
    {
        path: '/my-bookings',
        component: MyBookings,
        layout: MainLayout
    }
];

export const landlordRoutes = [
    {
        path: '/post',
        component: PostRoom,
        layout: MainLayout
    },
    {
        path: '/landlord',
        component: LandlordDashboard
    }
];

export const adminRoutes = [
    {
        path: '/admin/dashboard',
        component: AdminDashboard
    },
    {
        path: '/admin/statistics',
        component: SystemStatistics
    },
    {
        path: '/admin/account-management',
        component: AccountManagement
    },
    {
        path: '/admin/blacklist',
        component: Blacklist
    },
    {
        path: '/admin/finance',
        component: FinancialManagement
    },
    {
        path: '/admin/post-management',
        component: PostManagement
    },
    {
        path: '/admin/voucher-management',
        component: VoucherManagement
    }
];