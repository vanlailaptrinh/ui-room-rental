import React from 'react';
import './HeaderAdmin.css';
import HeaderAuthSection from '../HeaderAuthSection'

const HeaderAdmin = () => {
  return (
    <header className="admin-header">
      <div className="icon-group">
        <button><span className="material-symbols-outlined">notifications</span></button>
        <button><span className="material-symbols-outlined">mail</span></button>
        <button><span className="material-symbols-outlined">settings</span></button>
      </div>
      <div className="divider"></div>
      <HeaderAuthSection />
    </header>
  );
};

export default HeaderAdmin;