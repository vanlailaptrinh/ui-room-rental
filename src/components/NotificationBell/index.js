import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification, NOTI_CONFIG } from '../../context/notificationContext';
import { useAuth } from '../../context/authContext';
import './NotificationBell.css';

// ─── Helper format thời gian tương đối ──────────────────────────────────────
function timeAgo(isoStr) {
    if (!isoStr) return '';
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Vừa xong';
    if (mins < 60)  return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
}

function NotificationBell() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notifications, unreadCount, markRead, markAllRead } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Đóng panel khi click ra ngoài
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Build roomId giống backend: sort 2 userId rồi nối bằng '_' ──
    const buildRoomId = (id1, id2) => {
        const ids = [String(id1), String(id2)].sort();
        return ids[0] + '_' + ids[1];
    };

    // ── Navigate đúng chỗ khi click notification ──
    const getNavTarget = (noti) => {
        if (noti.type === 'NEW_MESSAGE' && noti.senderId) {
            const isLandlord = user?.role === 'LANDLORD';
            if (isLandlord) {
                // Landlord dùng embedded chat trong dashboard → navigate vào /landlord + mở tab messages
                return { path: '/landlord', state: { openTab: 'messages', contactId: noti.senderId } };
            } else {
                // User navigate đến trang /chat/{roomId}
                const roomId = buildRoomId(user?.id, noti.senderId);
                return { path: `/chat/${roomId}`, state: { roomId, targetUserId: noti.senderId } };
            }
        }
        // BOOKING_* → my-bookings
        if (noti.refId || noti.type?.startsWith('BOOKING')) {
            const isLandlord = user?.role === 'LANDLORD';
            return { path: isLandlord ? '/landlord' : '/my-bookings', state: isLandlord ? { openTab: 'appointments' } : undefined };
        }
        return null;
    };

    const handleClickNoti = async (noti) => {
        if (!noti.isRead) await markRead(noti.id);
        setIsOpen(false);
        const target = getNavTarget(noti);
        if (target) navigate(target.path, { state: target.state });
    };

    return (
        <div className="noti-bell-wrapper" ref={panelRef}>
            {/* ── Bell + Badge ── */}
            <button
                id="noti-bell-btn"
                className={`noti-bell-btn ${unreadCount > 0 ? 'has-unread' : ''} ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(v => !v)}
                aria-label="Thông báo"
                title="Thông báo"
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="noti-badge" id="noti-unread-badge">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown Panel ── */}
            {isOpen && (
                <div className="noti-panel" id="noti-panel">

                    {/* Header */}
                    <div className="noti-panel-header">
                        <h3>🔔 Thông báo</h3>
                        {unreadCount > 0 && (
                            <button className="noti-mark-all" onClick={markAllRead}>
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="noti-list">
                        {notifications.length === 0 ? (
                            <div className="noti-empty">
                                <span>🔕</span>
                                <p>Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map((noti) => {
                                const cfg = NOTI_CONFIG[noti.type] || { icon: '📢', color: '#6b7280', bg: '#f9fafb' };
                                return (
                                    <div
                                        key={noti.id}
                                        className={`noti-item ${!noti.isRead ? 'unread' : ''}`}
                                        onClick={() => handleClickNoti(noti)}
                                        id={`noti-item-${noti.id}`}
                                    >
                                        <div className="noti-type-icon" style={{ background: cfg.bg, color: cfg.color }}>
                                            {cfg.icon}
                                        </div>
                                        <div className="noti-content">
                                            <p className="noti-title">{noti.title}</p>
                                            <p className="noti-message">{noti.message}</p>
                                            <span className="noti-time">{timeAgo(noti.createdAt)}</span>
                                        </div>
                                        {!noti.isRead && <span className="noti-dot" />}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="noti-panel-footer">
                            <button
                                className="noti-view-all"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate(user?.role === 'LANDLORD' ? '/landlord' : '/my-bookings');
                                }}
                            >
                                {user?.role === 'LANDLORD' ? 'Xem lịch hẹn →' : 'Xem tất cả lịch hẹn →'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
