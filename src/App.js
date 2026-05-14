import React from 'react';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './components/Auth/AuthProvider';
import { NotificationProvider } from './context/notificationContext';
import GlobalToastContainer from './components/NotificationBell/GlobalToastContainer';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <AppRoutes />
                    {/* Toast toàn cục — hiện ở MỌI trang kể cả /landlord */}
                    <GlobalToastContainer />
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;