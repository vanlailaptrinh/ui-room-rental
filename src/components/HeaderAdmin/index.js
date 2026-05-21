import React from 'react';
import './HeaderAdmin.css';

const HeaderAdmin = () => {
  return (
    <header className="admin-header">
      <div className="icon-group">
        <button><span className="material-symbols-outlined">notifications</span></button>
        <button><span className="material-symbols-outlined">mail</span></button>
        <button><span className="material-symbols-outlined">settings</span></button>
      </div>
      <div className="divider"></div>
      <div className="profile-group">
        <span>Admin Console</span>
        <img src="https://i.pravatar.cc/150?img=11" alt="Admin" />
      </div>
    </header>
  );
};

export default HeaderAdmin;