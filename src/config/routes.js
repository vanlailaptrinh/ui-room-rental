const routes = {

    // PUBLIC
    home: '/',
    postList: '/postlist',
    detail: '/detail/:id',
    packet: '/packet',

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
    adminVouchers: '/admin/vouchers',
    adminPackages: '/admin/packages',
    adminBlacklist: '/admin/blacklist',
    adminAccounts: '/admin/accounts', 
    adminPosts: '/admin/posts',
    adminFinance: '/admin/finance',
    adminReports: '/admin/reports',
    adminDisputes: '/admin/disputes',
    adminStatistics: '/admin/statistics',
};

export default routes;