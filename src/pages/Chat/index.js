import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import ChatService from '../../services/chatService';
import UserService from '../../services/userService';
import './Chat.css';

function Avatar({ username, avatar, size = 48 }) {
    if (avatar) {
        return (
            <img
                src={avatar}
                alt={username}
                className="chat-avatar-img"
                style={{ width: size, height: size }}
            />
        );
    }
    const initials = (username || '?').slice(0, 2).toUpperCase();
    const colors = ['#6c63ff', '#06d6a0', '#f59e0b', '#ef4444', '#8b5cf6', '#3182ce'];
    const color = colors[(username?.charCodeAt(0) || 0) % colors.length];
    return (
        <div
            className="chat-avatar-fallback"
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

function Chat() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [connecting, setConnecting] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // USER → thấy LANDLORD, LANDLORD → thấy USER
    const targetRole = user?.role === 'USER' ? 'LANDLORD' : 'USER';
    const roleLabel = targetRole === 'LANDLORD' ? 'chủ trọ' : 'người thuê';

    useEffect(() => {
        loadContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    async function loadContacts() {
        try {
            setLoading(true);
            setError('');
            const all = await UserService.getAllUsers();
            const filtered = all.filter(
                (u) => u.role === targetRole && u.id !== user?.id
            );
            setContacts(filtered);
        } catch (err) {
            setError(err?.response?.data?.message || err.message || 'Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    }

    async function startChat(targetUser) {
        try {
            setConnecting(targetUser.id);
            const room = await ChatService.getOrCreateChatRoom(targetUser.id);
            navigate(`/chat/${room.roomId}`, {
                state: { roomId: room.roomId, targetUser },
            });
        } catch (err) {
            alert('Không thể tạo phòng chat: ' + (err?.response?.data?.message || err.message));
        } finally {
            setConnecting(null);
        }
    }

    const filteredContacts = useMemo(() => {
        if (!searchTerm.trim()) return contacts;
        const term = searchTerm.toLowerCase();
        return contacts.filter(
            (c) =>
                c.username?.toLowerCase().includes(term) ||
                c.email?.toLowerCase().includes(term)
        );
    }, [contacts, searchTerm]);

    return (
        <main className="chat-page-wrapper">
            {/* Sidebar bên trái */}
            <aside className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <div className="chat-flex-between">
                        <h3 className="chat-sidebar-title">
                            💬 Tin nhắn
                        </h3>
                        <button
                            className="chat-icon-btn-rounded material-symbols-outlined"
                            onClick={loadContacts}
                            title="Làm mới"
                        >
                            refresh
                        </button>
                    </div>
                    <p className="chat-sidebar-subtitle">
                        Danh sách {roleLabel} có thể nhắn tin
                    </p>
                    <div className="chat-search-container">
                        <span className="chat-search-icon material-symbols-outlined">search</span>
                        <input
                            className="chat-search-input"
                            placeholder={`Tìm ${roleLabel}...`}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="chat-list-scroll chat-custom-scrollbar">
                    {loading ? (
                        <div className="chat-loading-state">
                            <div className="chat-spinner"></div>
                            <span>Đang tải danh sách...</span>
                        </div>
                    ) : error ? (
                        <div className="chat-error-state">
                            <span className="chat-error-icon">⚠️</span>
                            <p>{error}</p>
                            <button className="chat-retry-btn" onClick={loadContacts}>
                                Thử lại
                            </button>
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="chat-empty-state">
                            <span style={{ fontSize: 40 }}>🔍</span>
                            <p>
                                {searchTerm
                                    ? 'Không tìm thấy kết quả'
                                    : `Chưa có ${roleLabel} nào`}
                            </p>
                        </div>
                    ) : (
                        filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={`chat-item ${connecting === contact.id ? 'chat-item-connecting' : ''}`}
                                onClick={() => !connecting && startChat(contact)}
                            >
                                <div className="chat-avatar-ring">
                                    <Avatar
                                        username={contact.username}
                                        avatar={contact.avatar}
                                        size={48}
                                    />
                                    <div className="chat-online-dot"></div>
                                </div>
                                <div className="chat-item-body">
                                    <div className="chat-flex-between">
                                        <span className="chat-name">{contact.username}</span>
                                        <span className="chat-role-badge">
                                            {contact.role === 'LANDLORD' ? '🏠 Chủ trọ' : '👤 Người thuê'}
                                        </span>
                                    </div>
                                    <p className="chat-preview">{contact.email}</p>
                                    {contact.phone && (
                                        <p className="chat-phone">📞 {contact.phone}</p>
                                    )}
                                </div>
                                {connecting === contact.id ? (
                                    <div className="chat-spinner chat-spinner-sm"></div>
                                ) : (
                                    <span className="chat-arrow material-symbols-outlined">
                                        chevron_right
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Placeholder bên phải */}
            <section className="chat-window">
                <div className="chat-placeholder">
                    <div className="chat-placeholder-icon">💬</div>
                    <h2>Chọn một cuộc trò chuyện</h2>
                    <p>Chọn {roleLabel} từ danh sách bên trái để bắt đầu nhắn tin</p>
                </div>
            </section>
        </main>
    );
}

export default Chat;