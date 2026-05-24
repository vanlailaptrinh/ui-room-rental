import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { useAuth } from '../../../../context/authContext';
import ChatService from '../../../../services/chatService';
import UserService from '../../../../services/userService';
import './MessageTab.css'

/* ─── Chat helpers ─── */
function chatFormatTime(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function chatFormatDate(ts) {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ChatAvatar({ username, avatar, size = 40 }) {
    if (avatar) return <img src={avatar} alt={username} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
    const initials = (username || '?').slice(0, 2).toUpperCase();
    const colors = ['#6c63ff', '#06d6a0', '#f59e0b', '#ef4444', '#8b5cf6', '#3182ce'];
    const color = colors[(username?.charCodeAt(0) || 0) % colors.length];
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg, ${color}88, ${color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, color: '#fff', flexShrink: 0 }}>
            {initials}
        </div>
    );
}

const MessageTab = ({ activeTab, locationState }) => {
    const { user } = useAuth();

    /* ─── Chat states ─── */
    const [chatContacts, setChatContacts] = useState([]);
    const [chatLoading, setChatLoading]   = useState(false);
    const [chatError, setChatError]       = useState('');
    const [activeContact, setActiveContact] = useState(null);  // người đang chat
    const [chatRoomId, setChatRoomId]     = useState(null);
    const [messages, setMessages]         = useState([]);
    const [msgLoading, setMsgLoading]     = useState(false);
    const [text, setText]                 = useState('');
    const [sending, setSending]           = useState(false);
    const [connecting, setConnecting]     = useState(null);

    const messagesEndRef = useRef(null);
    const textareaRef    = useRef(null);

    /* ─── Load contacts (người thuê) ─── */
    const loadChatContacts = useCallback(async () => {
        try {
            setChatLoading(true);
            setChatError('');
            const res = await UserService.getAllUsers();
            const all = res?.data || res || [];

            // LANDLORD chỉ thấy USER (người thuê)
            const tenants = (Array.isArray(all) ? all : []).filter(u => u.role === 'USER' && String(u.id) !== String(user?.id));

            // Lấy tin nhắn cuối cùng cho mỗi contact từ Firestore
            const contactsWithLastMsg = await Promise.all(
                tenants.map(async (contact) => {
                    try {
                        const ids = [String(user?.id), String(contact.id)].sort();
                        const roomId = ids[0] + '_' + ids[1];
                        const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
                        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
                        const snap = await getDocs(q);

                        if (!snap.empty) {
                            const lastMsg = snap.docs[0].data();
                            return {
                                ...contact,
                                lastMessage: lastMsg.content,
                                lastMessageTime: lastMsg.timestamp,
                                hasUnread: String(lastMsg.senderId) !== String(user?.id),
                            };
                        }
                    } catch (e) {
                        // Ignore — phòng chat chưa tồn tại
                    }
                    return { ...contact, lastMessage: null, lastMessageTime: null, hasUnread: false };
                })
            );

            // Sắp xếp: người có tin nhắn gần nhất lên đầu
            contactsWithLastMsg.sort((a, b) => {
                if (!a.lastMessageTime && !b.lastMessageTime) return 0;
                if (!a.lastMessageTime) return 1;
                if (!b.lastMessageTime) return -1;
                const tA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate() : new Date(a.lastMessageTime);
                const tB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate() : new Date(b.lastMessageTime);
                return tB - tA;
            });

            setChatContacts(contactsWithLastMsg);
        } catch (err) {
            console.error('loadChatContacts error:', err);
            setChatError(err?.response?.data?.message || err.message || 'Không thể tải danh sách');
        } finally {
            setChatLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'messages') loadChatContacts();
    }, [activeTab, loadChatContacts]);

    /* ─── Xử lý tự động mở chat từ Notification (nếu có locationState) ─── */
    useEffect(() => {
        if (activeTab === 'messages' && locationState?.contactId) {
            const tryOpenContact = (contacts) => {
                const found = contacts.find(c => String(c.id) === String(locationState.contactId));
                if (found) openChat(found);
            };

            if (chatContacts.length > 0) {
                tryOpenContact(chatContacts);
            } else {
                (async () => {
                    try {
                        const res = await UserService.getAllUsers();
                        const all = res?.data || res || [];
                        const tenants = (Array.isArray(all) ? all : []).filter(u => u.role === 'USER' && String(u.id) !== String(user?.id));
                        tryOpenContact(tenants);
                    } catch (e) {
                        console.warn('Auto-open chat contact failed:', e);
                    }
                })();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, locationState, user]);

    /* ─── Mở phòng chat với contact ─── */
    const openChat = async (contact) => {
        try {
            setConnecting(contact.id);
            const res = await ChatService.getOrCreateChatRoom(contact.id);
            const roomData = res?.data || res;
            const roomId = roomData?.roomId;
            if (!roomId) throw new Error('Không nhận được roomId từ server');

            setActiveContact(contact);
            setChatRoomId(roomId);
            setMessages([]);
            setMsgLoading(true);
        } catch (err) {
            console.error('openChat error:', err);
            alert('Không thể mở phòng chat: ' + (err?.response?.data?.message || err.message));
        } finally {
            setConnecting(null);
        }
    };

    /* ─── Subscribe Firestore khi roomId thay đổi ─── */
    useEffect(() => {
        if (!chatRoomId) return;
        const messagesRef = collection(db, 'chat_rooms', chatRoomId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsub = onSnapshot(q,
            (snap) => {
                setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setMsgLoading(false);
            },
            (err) => { console.error('Firestore error:', err); setMsgLoading(false); }
        );
        return () => unsub();
    }, [chatRoomId]);

    /* ─── Auto scroll ─── */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ─── Gửi tin nhắn ─── */
    const sendChatMessage = async (e) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || sending) return;
        setSending(true);
        setText('');
        try {
            await addDoc(collection(db, 'chat_rooms', chatRoomId, 'messages'), {
                senderId:   user?.id,
                senderName: user?.username || user?.email,
                content:    trimmed,
                timestamp:  serverTimestamp(),
            });

            if (activeContact?.id) {
                try {
                    await ChatService.sendMessageNotification(activeContact.id, trimmed);
                } catch (notiErr) {
                    console.warn('Gửi thông báo tin nhắn thất bại:', notiErr);
                }
            }
        } catch (err) {
            console.error('Send failed:', err);
            setText(trimmed);
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    };

    let lastDate = '';

    return (
        <div className="landlord-chat-wrapper landlord-fade-in">
            {/* Danh sách người thuê */}
            <aside className="landlord-chat-sidebar">
                <div className="landlord-chat-sidebar-header">
                    <h3>👤 Người thuê</h3>
                    <button className="landlord-chat-refresh-btn" onClick={loadChatContacts} title="Làm mới">↻</button>
                </div>
                <div className="landlord-chat-contacts">
                    {chatLoading ? (
                        <div className="landlord-chat-center"><div className="landlord-ld-spinner" /><span>Đang tải...</span></div>
                    ) : chatError ? (
                        <div className="landlord-chat-center" style={{ color: '#e53e3e', gap: 8, flexDirection: 'column' }}>
                            <span>⚠️ {chatError}</span>
                            <button className="landlord-btn-text" onClick={loadChatContacts}>Thử lại</button>
                        </div>
                    ) : chatContacts.length === 0 ? (
                        <div className="landlord-chat-center"><span>🔍</span><p style={{ color: '#a0aec0', fontSize: 13 }}>Chưa có người thuê nào</p></div>
                    ) : (
                        chatContacts.map(contact => (
                            <div
                                key={contact.id}
                                className={`landlord-chat-contact-item ${activeContact?.id === contact.id ? 'landlord-chat-contact-active' : ''}`}
                                onClick={() => connecting !== contact.id && openChat(contact)}
                            >
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    <ChatAvatar username={contact.username} avatar={contact.avatar} size={42} />
                                    <span className="landlord-chat-online-dot" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {contact.username}
                                        {contact.hasUnread && <span className="landlord-chat-unread-dot" />}
                                    </div>
                                    <div style={{ fontSize: 12, color: contact.lastMessage ? '#718096' : '#a0aec0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {contact.lastMessage
                                            ? (contact.lastMessage.length > 30 ? contact.lastMessage.slice(0, 30) + '...' : contact.lastMessage)
                                            : contact.email
                                        }
                                    </div>
                                </div>
                                {connecting === contact.id
                                    ? <div className="landlord-ld-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    : <span style={{ color: '#cbd5e0', fontSize: 18 }}>›</span>
                                }
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Cửa sổ chat */}
            <section className="landlord-chat-room">
                {!activeContact ? (
                    <div className="landlord-chat-placeholder">
                        <div style={{ fontSize: 64, marginBottom: 12 }}>💬</div>
                        <h3 style={{ color: '#2d3748', margin: 0 }}>Chọn người thuê để xem tin nhắn</h3>
                        <p style={{ color: '#a0aec0', fontSize: 14, margin: '8px 0 0' }}>Click vào một người trong danh sách bên trái</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="landlord-chat-room-header">
                            <ChatAvatar username={activeContact.username} avatar={activeContact.avatar} size={38} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a202c' }}>{activeContact.username}</div>
                                <div style={{ fontSize: 12, color: '#718096', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#48bb78', display: 'inline-block' }} />
                                    👤 Người thuê
                                </div>
                            </div>
                            <button
                                className="landlord-btn-text"
                                onClick={() => { setActiveContact(null); setChatRoomId(null); setMessages([]); }}
                                style={{ fontSize: 20, padding: '4px 8px' }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="landlord-chat-messages">
                            {msgLoading ? (
                                <div className="landlord-chat-center"><div className="landlord-ld-spinner" /><span>Đang tải tin nhắn...</span></div>
                            ) : messages.length === 0 ? (
                                <div className="landlord-chat-center"><span style={{ fontSize: 40 }}>👋</span><p style={{ color: '#718096' }}>Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</p></div>
                            ) : (
                                messages.map(msg => {
                                    const isMine = String(msg.senderId) === String(user?.id);
                                    if (!msg.timestamp) return null;
                                    const dateStr = chatFormatDate(msg.timestamp);
                                    const showDate = dateStr !== lastDate;
                                    lastDate = dateStr;
                                    return (
                                        <div key={msg.id}>
                                            {showDate && (
                                                <div className="landlord-chat-date-divider"><span>{dateStr}</span></div>
                                            )}
                                            <div className={`landlord-chat-msg-row ${isMine ? 'landlord-chat-mine' : 'landlord-chat-theirs'}`}>
                                                {!isMine && <ChatAvatar username={msg.senderName} avatar={activeContact?.avatar} size={28} />}
                                                <div className={`landlord-chat-bubble ${isMine ? 'landlord-chat-bubble-mine' : 'landlord-chat-bubble-theirs'}`}>
                                                    <div style={{ wordWrap: 'break-word' }}>{msg.content}</div>
                                                    <div className="landlord-chat-bubble-time">{chatFormatTime(msg.timestamp)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form className="landlord-chat-input-bar" onSubmit={sendChatMessage}>
                            <textarea
                                ref={textareaRef}
                                className="landlord-chat-textarea"
                                placeholder="Nhập tin nhắn... (Enter để gửi)"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(e); } }}
                                rows={1}
                                disabled={sending}
                            />
                            <button type="submit" className="landlord-chat-send-btn" disabled={!text.trim() || sending}>
                                {sending
                                    ? <div className="landlord-ld-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    : <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                                }
                            </button>
                        </form>
                    </>
                )}
            </section>
        </div>
    );
};

export default MessageTab;