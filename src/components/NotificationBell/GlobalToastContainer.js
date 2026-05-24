/**
 * GlobalToastContainer — render ở App.js level
 * Hiển thị ở MỌI trang kể cả /landlord (không dùng MainLayout)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification, NOTI_CONFIG } from '../../context/notificationContext';
import { useAuth } from '../../context/authContext';
import './NotificationBell.css';

function GlobalToastContainer() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toasts, dismissToast, markRead } = useNotification();

    if (toasts.length === 0) return null;

    const buildRoomId = (id1, id2) => {
        const ids = [String(id1), String(id2)].sort();
        return ids[0] + '_' + ids[1];
    };

    const handleToastClick = async (toastId, noti) => {
        dismissToast(toastId);
        if (!noti.isRead) markRead(noti.id).catch(() => {});

        if (noti.type === 'NEW_MESSAGE' && noti.senderId) {
            if (user?.role === 'LANDLORD') {
                navigate('/landlord', { state: { openTab: 'messages', contactId: noti.senderId } });
            } else {
                const roomId = buildRoomId(user?.id, noti.senderId);
                navigate(`/chat/${roomId}`, { state: { roomId, targetUserId: noti.senderId } });
            }
            return;
        }
        if (noti.refId || noti.type?.startsWith('BOOKING')) {
            navigate(user?.role === 'LANDLORD' ? '/landlord' : '/my-bookings',
                user?.role === 'LANDLORD' ? { state: { openTab: 'appointments' } } : undefined);
        }
    };

    return (
        <div className="toast-container" id="toast-container">
            {toasts.map(({ id, noti }) => {
                const cfg = NOTI_CONFIG[noti.type] || { icon: '📢', color: '#6b7280', bg: '#f9fafb' };
                return (
                    <div
                        key={id}
                        className="toast-item toast-item-clickable"
                        id={`toast-${id}`}
                        style={{ borderLeftColor: cfg.color }}
                        onClick={() => handleToastClick(id, noti)}
                        title="Nhấn để xem chi tiết"
                    >
                        <span className="toast-icon">{cfg.icon}</span>
                        <div className="toast-body">
                            <p className="toast-title">{noti.title}</p>
                            <p className="toast-msg">{noti.message}</p>
                            <p className="toast-click-hint">Nhấn để xem →</p>
                        </div>
                        <button
                            className="toast-close"
                            onClick={(e) => { e.stopPropagation(); dismissToast(id); }}
                        >✕</button>
                    </div>
                );
            })}
        </div>
    );
}

export default GlobalToastContainer;

