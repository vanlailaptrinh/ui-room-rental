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

    const { user } = useAuth();

    const location = useLocation();

    const role = user?.role;

    const getAccessibleRoutes = () => {

        /*
            PUBLIC
            Ai cũng vào được
        */

        let routes = [...publicRoutes];

        /*
            CHƯA LOGIN
            => được vào guest routes
        */

        if (!role) {
            routes.push(...guestRoutes);
        }

        /*
            USER
        */

        if (role === 'USER') {
            routes.push(...userRoutes);
        }

        /*
            LANDLORD
            kế thừa USER
        */

        if (role === 'LANDLORD') {

            routes.push(...userRoutes);

            routes.push(...landlordRoutes);
        }

        /*
            ADMIN
            có toàn quyền
        */

        if (role === 'ADMIN') {

            routes.push(...userRoutes);

            routes.push(...landlordRoutes);

            routes.push(...adminRoutes);
        }

        return routes;
    };

    const accessibleRoutes = getAccessibleRoutes();

    /*
        CHECK PERMISSION
    */

    const isAllowed = accessibleRoutes.some(route =>
        matchPath(
            {
                path: route.path,
                end: false
            },
            location.pathname
        )
    );

    /*
        KHÔNG CÓ QUYỀN
    */

    if (!isAllowed) {

        /*
            Nếu đã login mà cố vào guest route
            => đá về home
        */

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return (
        <Routes>

            {accessibleRoutes.map((route, index) => {

                const Page = route.component;

                /*
                    DEFAULT LAYOUT = Fragment
                */

                const Layout =
                    route.layout === undefined
                        ? Fragment
                        : route.layout;

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

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default AppRoutes;