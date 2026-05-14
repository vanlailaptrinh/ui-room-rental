import React from 'react';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <Header />

            <main className="flex-grow pt-20">
                {children}
            </main>

            <Footer />

        </div>
    );
};

export default MainLayout;