/**
 * GlobalToastContainer — render ở App.js level
 * Hiển thị ở MỌI trang kể cả /landlord (không dùng MainLayout)
 */
import React from 'react';
import { useNotification, NOTI_CONFIG } from '../../context/notificationContext';
import './NotificationBell.css';

function GlobalToastContainer() {
    const { toasts, dismissToast } = useNotification();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container" id="toast-container">
            {toasts.map(({ id, noti }) => {
                const cfg = NOTI_CONFIG[noti.type] || { icon: '📢', color: '#6b7280', bg: '#f9fafb' };
                return (
                    <div
                        key={id}
                        className="toast-item"
                        id={`toast-${id}`}
                        style={{ borderLeftColor: cfg.color }}
                    >
                        <span className="toast-icon">{cfg.icon}</span>
                        <div className="toast-body">
                            <p className="toast-title">{noti.title}</p>
                            <p className="toast-msg">{noti.message}</p>
                        </div>
                        <button className="toast-close" onClick={() => dismissToast(id)}>✕</button>
                    </div>
                );
            })}
        </div>
    );
}

export default GlobalToastContainer;
