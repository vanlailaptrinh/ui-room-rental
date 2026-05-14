import React, { Fragment } from 'react';

import {
    Routes,
    Route,
    Navigate,
    matchPath,
    useLocation
} from 'react-router-dom';

import {
    publicRoutes,
    guestRoutes,
    userRoutes,
    landlordRoutes,
    adminRoutes
} from './index';

import { useAuth } from '../context/authContext';

function AppRoutes() {
    const { user, loading } = useAuth();
    const location = useLocation();

    const role = user?.role;

    const getRoutes = () => [
        ...publicRoutes,
        ...(!role ? guestRoutes : []),
        ...(role === 'USER' ? userRoutes : []),
        ...(role === 'LANDLORD' ? [...userRoutes, ...landlordRoutes] : []),
        ...(role === 'ADMIN' ? [...userRoutes, ...landlordRoutes, ...adminRoutes] : [])
    ];

    const routes = getRoutes();

    if (loading) return null;

    const isAllowed = routes.some(route =>
        matchPath({ path: route.path, end: true }, location.pathname)
    );

    if (!isAllowed) {
        return <Navigate to="/" replace />;
    }

    return (
        <Routes>
            {routes.map((route, index) => {
                const Page = route.component;
                const Layout = route.layout || React.Fragment;

                return (
                    <Route
                        key={index}
                        path={route.path}
                        element={
                            <Layout>
                                <Page />
                            </Layout>
                        }
                    />
                );
            })}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;