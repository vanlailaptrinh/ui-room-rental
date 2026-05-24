import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Landlord.css';

// Components
import LandlordSidebar from './components/LandlordSidebar';
import LandlordHeader from './components/LandlordHeader';

// Tabs
import OverviewTab from './tabs/OverviewTab';
import BookingManagementTab from './tabs/BookingManagementTab';
import PostManagementTab from './tabs/PostManagementTab';
import MessageTab from './tabs/MessageTab';
import PaymentManagementTab from './tabs/PaymentManagementTab';
import OrderManagementTab from './tabs/OrderManagementTab';
// import ReportTab from './tabs/ReportTab';

function Landlord() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Xử lý navigate từ notification click
    useEffect(() => {
        const state = location.state;
        if (state?.openTab) {
            setActiveTab(state.openTab);
            window.history.replaceState({}, '');
        }
    }, [location.state]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':    return <OverviewTab activeTab={activeTab} />;
            case 'appointments': return <BookingManagementTab activeTab={activeTab} />;
            case 'listings':     return <PostManagementTab activeTab={activeTab} />;
            case 'messages':     return <MessageTab activeTab={activeTab} locationState={location.state} />;
            case 'payments':     return <PaymentManagementTab activeTab={activeTab} />;
            case 'orders':       return <OrderManagementTab activeTab={activeTab} />;

            // case 'reports':      return <ReportTab />;
            default:             return <OverviewTab />;
        }
    };

    return (
        <div className="landlord-container">
            <LandlordSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="landlord-main">
                <LandlordHeader activeTab={activeTab} />
                <div className="landlord-content-area">
                    {renderTabContent()}
                </div>
            </main>
        </div>
    );
}

export default Landlord;