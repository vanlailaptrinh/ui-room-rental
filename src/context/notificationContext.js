import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './authContext';
import NotificationService, { connectSSE } from '../services/notificationService';

// ─── Config icon/màu theo type ───────────────────────────────────────────────
export const NOTI_CONFIG = {
    BOOKING_CREATED:   { icon: '📅', color: '#3b82f6', bg: '#eff6ff', label: 'Đặt lịch mới' },
    BOOKING_APPROVED:  { icon: '✅', color: '#16a34a', bg: '#f0fdf4', label: 'Lịch hẹn được duyệt' },
    BOOKING_REJECTED:  { icon: '❌', color: '#dc2626', bg: '#fef2f2', label: 'Lịch hẹn bị từ chối' },
    BOOKING_CANCELLED: { icon: '🚫', color: '#d97706', bg: '#fffbeb', label: 'Lịch hẹn đã hủy' },
};

const POLL_INTERVAL_MS = 30000; // 30s polling fallback khi SSE lỗi

// ─── Context ─────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotification phải dùng bên trong NotificationProvider');
    return ctx;
};

// ─── Provider ────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }) {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount,   setUnreadCount]   = useState(0);
    const [toasts,        setToasts]        = useState([]);
    const [sseConnected,  setSseConnected]  = useState(false);

    const sseControllerRef = useRef(null);
    const pollIntervalRef  = useRef(null);
    const knownIdsRef      = useRef(new Set()); // theo dõi ID đã biết để tránh duplicate

    // ── Lấy token sạch từ localStorage ──────────────────────────────────────
    const getToken = () => {
        let t = localStorage.getItem('accessToken') || '';
        if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1);
        return t;
    };

    // ── Thêm toast tự xóa sau 5s ────────────────────────────────────────────
    const pushToast = useCallback((noti) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, noti }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    // ── Xử lý thông báo mới (từ SSE hoặc polling) ───────────────────────────
    const handleNewNotification = useCallback((noti) => {
        if (knownIdsRef.current.has(noti.id)) return; // bỏ qua duplicate
        knownIdsRef.current.add(noti.id);
        setNotifications(prev => [noti, ...prev]);
        if (!noti.isRead) setUnreadCount(prev => prev + 1);
        pushToast(noti);
    }, [pushToast]);

    // ── Load toàn bộ notifications ban đầu ──────────────────────────────────
    const loadAll = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await NotificationService.getAll();
            const list = res.data || [];
            // Ghi nhớ tất cả ID đã biết
            list.forEach(n => knownIdsRef.current.add(n.id));
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('[Noti] loadAll error:', err);
        }
    }, []);

    // ── Polling fallback: mỗi 30s fetch notifications mới ───────────────────
    const startPolling = useCallback(() => {
        if (pollIntervalRef.current) return; // đã chạy rồi
        console.log('[Noti] Starting polling fallback (30s)');
        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await NotificationService.getAll();
                const list = res.data || [];
                list.forEach(n => {
                    if (!knownIdsRef.current.has(n.id)) {
                        handleNewNotification(n);
                    }
                });
            } catch (err) {
                console.error('[Noti] Polling error:', err);
            }
        }, POLL_INTERVAL_MS);
    }, [handleNewNotification]);

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    // ── Main effect: setup khi user login / cleanup khi logout ───────────────
    useEffect(() => {
        if (!user) {
            // Logout: dọn sạch
            setNotifications([]);
            setUnreadCount(0);
            setToasts([]);
            setSseConnected(false);
            knownIdsRef.current.clear();
            sseControllerRef.current?.abort();
            sseControllerRef.current = null;
            stopPolling();
            return;
        }

        const token = getToken();
        if (!token) return;

        // 1. Load notifications cũ từ DB
        loadAll();

        // 2. Kết nối SSE
        sseControllerRef.current?.abort();
        sseControllerRef.current = connectSSE(
            token,
            // onNotification
            (noti) => {
                console.log('[Noti] SSE received:', noti);
                handleNewNotification(noti);
            },
            // onConnected
            () => {
                console.log('[Noti] SSE connected OK');
                setSseConnected(true);
                stopPolling(); // SSE hoạt động → dừng polling
            },
            // onError (gọi khi SSE thất bại hẳn)
            () => {
                console.warn('[Noti] SSE failed, switching to polling');
                setSseConnected(false);
                startPolling();
            }
        );

        // 3. Backup: bắt đầu polling song song, nếu SSE connect được thì dừng
        //    Đặt timeout 5s — nếu SSE chưa connect thì polling sẽ thay thế
        const sseTimeout = setTimeout(() => {
            if (!sseControllerRef.current) return;
            console.log('[Noti] SSE timeout — enabling polling fallback');
            startPolling();
        }, 5000);

        return () => {
            clearTimeout(sseTimeout);
            sseControllerRef.current?.abort();
            stopPolling();
        };
    }, [user, loadAll, handleNewNotification, startPolling, stopPolling]);

    // ── markRead ─────────────────────────────────────────────────────────────
    const markRead = useCallback(async (id) => {
        try {
            await NotificationService.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('[Noti] markRead error:', err);
        }
    }, []);

    // ── markAllRead ───────────────────────────────────────────────────────────
    const markAllRead = useCallback(async () => {
        try {
            await NotificationService.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('[Noti] markAllRead error:', err);
        }
    }, []);

    // ── dismissToast ──────────────────────────────────────────────────────────
    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            toasts,
            sseConnected,
            markRead,
            markAllRead,
            dismissToast,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
