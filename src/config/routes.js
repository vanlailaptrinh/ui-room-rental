const routes = {

    // PUBLIC
    home: '/',
    postList: '/postlist',
    detail: '/detail/:id',
    pricing: '/pricing',

    // GUEST
    login: '/login',
    register: '/register',
    verify: '/verify',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',

    // USER
    profile: '/profile',
    favorites: '/favorites',
    chat: '/chat',
    chatRoom: '/chat/:roomId',
    myBookings: '/my-bookings',

    // LANDLORD
    post: '/post',
    landlordDashboard: '/landlord',
    paymentCallback: '/payment-callback',

    // ADMIN
    adminDashboard: '/admin/dashboard',
    adminStatistics: '/admin/statistics',
    adminAccountManagement: '/admin/account-management',
    adminBlacklist: '/admin/blacklist',
    adminFinance: '/admin/finance',
    adminPostManagement: '/admin/post-management',
    adminVoucherManagement: '/admin/voucher-management'
};

export default routes;