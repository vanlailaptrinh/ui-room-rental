import React from 'react';
import './AdminLayout.css';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout-container">
      {/* SIDEBAR */}
      <SidebarAdmin />

      {/* MAIN WRAPPER */}
      <div className="admin-main">
        {/* HEADER */}
        <HeaderAdmin />

        {/* CONTENT DYNAMIC */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;