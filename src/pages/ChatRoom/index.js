import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/authContext';
import UserService from '../../services/userService';
import './ChatRoom.css';

// ── Helpers ──────────────────────────────────────────────

function formatTime(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Avatar({ username, avatar, size = 40 }) {
    if (avatar) {
        return (
            <img
                src={avatar}
                alt={username}
                className="cr-avatar-img"
                style={{ width: size, height: size }}
            />
        );
    }
    const initials = (username || '?').slice(0, 2).toUpperCase();
    const colors = ['#6c63ff', '#06d6a0', '#f59e0b', '#ef4444', '#8b5cf6', '#3182ce'];
    const color = colors[(username?.charCodeAt(0) || 0) % colors.length];
    return (
        <div
            className="cr-avatar-fallback"
            style={{
                width: size,
                height: size,
                background: `linear-gradient(135deg, ${color}88, ${color})`,
                fontSize: size * 0.36,
            }}
        >
            {initials}
        </div>
    );
}

// ── Component ────────────────────────────────────────────

function ChatRoom() {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [targetUser, setTargetUser] = useState(location.state?.targetUser || null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Load targetUser nếu chưa có (trường hợp user truy cập trực tiếp URL)
    useEffect(() => {
        if (!targetUser && roomId && user) {
            const parts = roomId.split('_');
            const otherId = parts.find((p) => String(p) !== String(user.id));
            if (otherId) {
                UserService
                    .getUserById(otherId)
                    .then((res) => setTargetUser(res.data || res))
                    .catch(() => {});
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, user]);

    // Subscribe Firestore Realtime
    useEffect(() => {
        if (!roomId) return;

        const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMessages(list);
                setIsLoading(false);
            },
            (error) => {
                console.error('Lỗi lấy tin nhắn:', error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [roomId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message
    async function sendMessage(e) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;

        setSending(true);
        setText('');
        try {
            const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
            await addDoc(messagesRef, {
                senderId: user.id,
                senderName: user.username || user.email,
                content: trimmed,
                timestamp: serverTimestamp(),
            });
        } catch (err) {
            console.error('Send failed:', err);
            setText(trimmed); // restore
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    }

    // Group messages by date
    let lastDate = '';

    return (
        <main className="cr-page-wrapper">
            {/* Header */}
            <header className="cr-header">
                <button className="cr-back-btn" onClick={() => navigate('/chat')}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="cr-header-user">
                    <Avatar
                        username={targetUser?.username}
                        avatar={targetUser?.avatar}
                        size={42}
                    />
                    <div className="cr-header-info">
                        <h4 className="cr-header-name">
                            {targetUser?.username || 'Đang tải...'}
                        </h4>
                        <span className="cr-header-status">
                            <span className="cr-status-dot"></span>
                            {targetUser?.role === 'LANDLORD' ? '🏠 Chủ trọ' : '👤 Người thuê'}
                        </span>
                    </div>
                </div>
                {targetUser?.phone && (
                    <a
                        href={`tel:${targetUser.phone}`}
                        className="cr-call-btn"
                        title="Gọi điện"
                    >
                        <span className="material-symbols-outlined">call</span>
                    </a>
                )}
            </header>

            {/* Messages area */}
            <div className="cr-messages-area cr-custom-scrollbar">
                {isLoading ? (
                    <div className="cr-center-state">
                        <div className="cr-spinner"></div>
                        <span>Đang tải tin nhắn...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="cr-center-state">
                        <span style={{ fontSize: 48 }}>👋</span>
                        <p className="cr-empty-text">Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = String(msg.senderId) === String(user?.id);
                        // Guard timestamp null
                        if (!msg.timestamp) return null;

                        const dateStr = formatDate(msg.timestamp);
                        const showDate = dateStr !== lastDate;
                        lastDate = dateStr;

                        return (
                            <div key={msg.id}>
                                {showDate && (
                                    <div className="cr-date-divider">
                                        <span>{dateStr}</span>
                                    </div>
                                )}
                                <div
                                    className={`cr-msg-row ${isMine ? 'cr-mine' : 'cr-theirs'}`}
                                >
                                    {!isMine && (
                                        <Avatar
                                            username={msg.senderName}
                                            avatar={targetUser?.avatar}
                                            size={32}
                                        />
                                    )}
                                    <div className="cr-bubble">
                                        {!isMine && (
                                            <div className="cr-bubble-sender">
                                                {msg.senderName}
                                            </div>
                                        )}
                                        <div className="cr-bubble-content">{msg.content}</div>
                                        <div className="cr-bubble-time">
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form className="cr-input-bar" onSubmit={sendMessage}>
                <div className="cr-input-container">
                    <textarea
                        ref={textareaRef}
                        className="cr-textarea"
                        placeholder="Nhập tin nhắn... (Enter để gửi)"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        className="cr-send-btn"
                        disabled={!text.trim() || sending}
                    >
                        {sending ? (
                            <div className="cr-spinner cr-spinner-sm"></div>
                        ) : (
                            <span className="material-symbols-outlined">send</span>
                        )}
                    </button>
                </div>
            </form>
        </main>
    );
}

export default ChatRoom;
