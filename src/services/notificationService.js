import { fetchEventSource } from '@microsoft/fetch-event-source';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── SSE ─────────────────────────────────────────────────────────────────────
/**
 * @param {string}   token          - JWT access token
 * @param {function} onNotification - callback(noti) khi nhận event NOTIFICATION
 * @param {function} onConnected    - callback() khi kết nối thành công
 * @param {function} onError        - callback() khi SSE thất bại (để switch sang polling)
 * @returns {AbortController}
 */
export function connectSSE(token, onNotification, onConnected, onError) {
    const controller = new AbortController();

    fetchEventSource(`${BASE_URL}/notifications/subscribe`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
        },
        signal: controller.signal,
        openWhenHidden: true,

        onopen: async (res) => {
            if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
                console.log('[SSE] Opened successfully');
                onConnected?.();
            } else {
                // Server trả về lỗi (401, 404, v.v.)
                console.error('[SSE] Bad response:', res.status, res.statusText);
                onError?.();
                controller.abort();
            }
        },

        onmessage: (e) => {
            console.log('[SSE] Event:', e.event, e.data);
            if (e.event === 'CONNECTED') {
                console.log('[SSE] CONNECTED event:', e.data);
                onConnected?.();
            } else if (e.event === 'NOTIFICATION') {
                try {
                    const data = JSON.parse(e.data);
                    onNotification?.(data);
                } catch (err) {
                    console.error('[SSE] Parse error:', err);
                }
            }
        },

        onerror: (err) => {
            console.error('[SSE] Error:', err);
            onError?.();
            // Throw để ngăn fetchEventSource tự retry vô hạn
            throw err;
        },
    });

    return controller;
}

// ─── REST API Notifications ───────────────────────────────────────────────────
const getHeaders = () => {
    let token = localStorage.getItem('accessToken') || '';
    if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

const NotificationService = {
    /** GET /notifications */
    getAll: () =>
        fetch(`${BASE_URL}/notifications`, { headers: getHeaders() }).then(r => r.json()),

    /** GET /notifications/unread-count */
    getUnreadCount: () =>
        fetch(`${BASE_URL}/notifications/unread-count`, { headers: getHeaders() }).then(r => r.json()),

    /** PUT /notifications/{id}/read */
    markRead: (id) =>
        fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PUT', headers: getHeaders() }).then(r => r.json()),

    /** PUT /notifications/read-all */
    markAllRead: () =>
        fetch(`${BASE_URL}/notifications/read-all`, { method: 'PUT', headers: getHeaders() }).then(r => r.json()),
};

export default NotificationService;
