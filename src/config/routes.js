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
    adminAccounts: '/admin/accounts', 
    adminAmenities: '/admin/amenyties', 
    adminFinance: '/admin/finance',
    adminPackages: '/admin/packages',
    adminPosts: '/admin/posts',
    adminVouchers: '/admin/vouchers',
    adminBlacklist: '/admin/blacklist',
    adminReports: '/admin/reports',
    adminDisputes: '/admin/disputes',
    adminStatistics: '/admin/statistics',
};

export default routes;