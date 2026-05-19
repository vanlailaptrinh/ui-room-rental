import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landlord.css';
import BookingService from '../../services/bookingService';
import NotificationBell from '../../components/NotificationBell';
import * as UserService from '../../services/userService';
import { getOrCreateChatRoom, getAllUsers } from '../../services/chatService';
import { db } from '../../services/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/authContext';
import packageService from '../../services/packageService';
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService";
import PacketCard from '../../components/PacketCard'

/* ─── Helper: format thời gian ─── */
const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
    const map = {
        PENDING:   { label: 'Chờ duyệt',    cls: 'landlord-sb-pending' },
        APPROVED:  { label: 'Đã duyệt',     cls: 'landlord-sb-approved' },
        REJECTED:  { label: 'Từ chối',       cls: 'landlord-sb-rejected' },
        CANCELLED: { label: 'Đã hủy',        cls: 'landlord-sb-cancelled' },
    };
    const { label, cls } = map[status] || { label: status, cls: '' };
    return <span className={`landlord-ld-status-badge ${cls}`}>{label}</span>;
};

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

function LandlordDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    /* ─── Booking states ─── */
    const [bookings, setBookings]       = useState([]);
    const [bookingLoading, setBLoading] = useState(false);
    const [bookingError, setBError]     = useState(null);
    const [processing, setProcessing]   = useState(null);

    /* ─── Listings (mock) ─── */
    const [listings] = useState([
        { id: 101, title: 'Phòng trọ cao cấp Bình Thạnh', views: 1250, status: 'Đang hiển thị' },
        { id: 102, title: 'Căn hộ Studio Quận 7', views: 840, status: 'Đã cho thuê' },
    ]);

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
    const messagesEndRef                  = useRef(null);
    const textareaRef                     = useRef(null);

    /* ─── Fetch landlord bookings ─── */
    const fetchBookings = useCallback(async () => {
        try {
            setBLoading(true);
            setBError(null);
            const res = await BookingService.getLandlordBookings();
            setBookings(res.data || []);
        } catch (err) {
            console.error('Lỗi lấy booking:', err);
            setBError('Không thể tải danh sách. Vui lòng thử lại.');
        } finally {
            setBLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'appointments') fetchBookings();
    }, [activeTab, fetchBookings]);

    /* ─── Approve ─── */
    const handleApprove = async (id) => {
        try {
            setProcessing(id);
            await BookingService.approveBooking(id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'APPROVED' } : b));
        } catch (err) {
            alert('Không thể duyệt lịch hẹn. Thử lại!');
        } finally {
            setProcessing(null);
        }
    };

    /* ─── Reject ─── */
    const handleReject = async (id) => {
        if (!window.confirm('Bạn có chắc muốn từ chối lịch hẹn này?')) return;
        try {
            setProcessing(id);
            await BookingService.rejectBooking(id);
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED' } : b));
        } catch (err) {
            alert('Không thể từ chối lịch hẹn. Thử lại!');
        } finally {
            setProcessing(null);
        }
    };

    /* ─── Tab: Dashboard (Bảng điều khiển) ─── */
    const renderDashboard = () => (
        <div className="landlord-fade-in">
            <div className="landlord-stat-grid">
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#e6f7ff', color: '#1890ff'}}>📊</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Tổng lượt xem</span>
                        <h2 className="landlord-stat-value">2,540</h2>
                    </div>
                </div>
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#f6ffed', color: '#52c41a'}}>📅</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Lịch hẹn mới</span>
                        <h2 className="landlord-stat-value">{bookings.filter(b => b.status === 'PENDING').length}</h2>
                    </div>
                </div>
                <div className="landlord-stat-card">
                    <div className="landlord-stat-icon" style={{background: '#fff7e6', color: '#fa8c16'}}>🏠</div>
                    <div className="landlord-stat-info">
                        <span className="landlord-stat-label">Tin đang đăng</span>
                        <h2 className="landlord-stat-value">3</h2>
                    </div>
                </div>
            </div>
            {/* Có thể render thêm biểu đồ hoặc danh sách lịch hẹn gần đây ở đây */}
            {renderAppointments()}
        </div>
    );
    /* ─── Load contacts (người thuê) khi vào tab messages ─── */
    const loadChatContacts = useCallback(async () => {
        try {
            setChatLoading(true);
            setChatError('');
            const all = await getAllUsers();
            // LANDLORD chỉ thấy USER (người thuê)
            const tenants = all.filter(u => u.role === 'USER' && String(u.id) !== String(user?.id));
            setChatContacts(tenants);
        } catch (err) {
            setChatError(err?.response?.data?.message || err.message || 'Không thể tải danh sách');
        } finally {
            setChatLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'messages') loadChatContacts();
    }, [activeTab, loadChatContacts]);

    /* ─── Mở phòng chat với contact ─── */
    const openChat = async (contact) => {
        try {
            setConnecting(contact.id);
            const room = await getOrCreateChatRoom(contact.id);
            setActiveContact(contact);
            setChatRoomId(room.roomId);
            setMessages([]);
            setMsgLoading(true);
        } catch (err) {
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
        } catch (err) {
            console.error('Send failed:', err);
            setText(trimmed);
        } finally {
            setSending(false);
            textareaRef.current?.focus();
        }
    };

    /* ─── Tab: Messages (Tin nhắn) — REAL ─── */
    const renderMessages = () => {
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
                                        <div style={{ fontWeight: 700, fontSize: 14, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.username}</div>
                                        <div style={{ fontSize: 12, color: '#a0aec0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.email}</div>
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

    /* ─── Tab: Appointments (Bookings từ API) ─── */
    const renderAppointments = () => {
        if (bookingLoading) {
            return (
                <section className="landlord-card landlord-full-width">
                    <h3>Lịch hẹn từ khách thuê</h3>
                    <div className="landlord-ld-loading">
                        <div className="landlord-ld-spinner" />
                        <span>Đang tải...</span>
                    </div>
                </section>
            );
        }

        if (bookingError) {
            return (
                <section className="landlord-card landlord-full-width">
                    <h3>Lịch hẹn từ khách thuê</h3>
                    <div className="landlord-ld-error">
                        <span>⚠️ {bookingError}</span>
                        <button className="landlord-btn-text" onClick={fetchBookings}>Thử lại</button>
                    </div>
                </section>
            );
        }

        return (
            <section className="landlord-card landlord-full-width">
                <h3>
                    Lịch hẹn từ khách thuê
                    <span className="landlord-ld-count-badge">{bookings.length}</span>
                </h3>

                {bookings.length === 0 ? (
                    <div className="landlord-ld-empty">
                        <span>🗓️</span>
                        <p>Chưa có lịch hẹn nào được gửi đến.</p>
                    </div>
                ) : (
                    <div className="landlord-appointment-list">
                        {bookings.map((b) => {
                            const dt = b.bookingTime ? new Date(b.bookingTime) : null;
                            const day  = dt ? dt.getDate() : '?';
                            const mon  = dt ? dt.toLocaleString('vi-VN', { month: 'short' }) : '';
                            const time = dt ? dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

                            return (
                                <div key={b.id} className={`landlord-appointment-item landlord-ld-item-${b.status?.toLowerCase()}`}>
                                    {/* Date tag */}
                                    <div className="landlord-date-tag">
                                        {day}<br /><span>{mon}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="landlord-apt-details">
                                        <h4>{b.post?.title || 'Phòng chưa có tiêu đề'}</h4>
                                        <p>
                                            ⏰ {time} &nbsp;•&nbsp;
                                            <StatusBadge status={b.status} />
                                        </p>
                                        <p style={{ marginTop: 4, fontSize: 13, color: '#9ca3af' }}>
                                            📍 {b.post?.address || '—'} &nbsp;|&nbsp;
                                            Đặt lúc: {fmtDate(b.createdAt)}
                                        </p>
                                    </div>

                                    {/* Actions — chỉ show khi PENDING */}
                                    <div className="landlord-apt-actions">
                                        {b.status === 'PENDING' && (
                                            <>
                                                <button
                                                    className="landlord-btn-approve"
                                                    onClick={() => handleApprove(b.id)}
                                                    disabled={processing === b.id}
                                                >
                                                    {processing === b.id ? '...' : '✓ Duyệt'}
                                                </button>
                                                <button
                                                    className="landlord-btn-danger"
                                                    onClick={() => handleReject(b.id)}
                                                    disabled={processing === b.id}
                                                >
                                                    {processing === b.id ? '...' : 'Từ chối'}
                                                </button>
                                            </>
                                        )}
                                        {b.status !== 'PENDING' && (
                                            <span style={{ fontSize: 13, color: '#9ca3af' }}>Đã xử lý</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        );
    };

    /* ─── Tab: Listings  ─── */
    const renderListings = () => (
        <section className="landlord-card landlord-full-width landlord-fade-in">
            <div className="landlord-section-header">
                <div className="header-left">
                    <h3>Danh sách tin đăng</h3>
                    <span className="landlord-ld-count-badge">{listings.length} tin</span>
                </div>
                <button className="landlord-btn-primary-small">+ Đăng tin mới</button>
            </div>

            <div className="landlord-table-responsive">
                <table className="landlord-table">
                    <thead>
                    <tr>
                        <th>Hình ảnh</th>
                        <th>Thông tin phòng</th>
                        <th>Giá thuê</th>
                        <th>Lượt xem</th>
                        <th>Ngày đăng</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {listings.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <div className="landlord-table-img">
                                    <img src={`https://picsum.photos/80/60?random=${item.id}`} alt="room" />
                                </div>
                            </td>
                            <td>
                                <div className="landlord-table-info">
                                    <div className="title">{item.title}</div>
                                    <div className="address">📍 {item.id === 101 ? 'Bình Thạnh, TP.HCM' : 'Quận 7, TP.HCM'}</div>
                                </div>
                            </td>
                            <td>
                                <span className="landlord-table-price">{item.id === 101 ? '4.5tr' : '3.8tr'}/tháng</span>
                            </td>
                            <td>
                                <div className="landlord-table-views">
                                    <span>👁️ {item.views}</span>
                                </div>
                            </td>
                            <td>
                                <span className="landlord-table-date">12/04/2024</span>
                            </td>
                            <td>
                                <span className={`landlord-status-dot ${item.status === 'Đang hiển thị' ? 'active' : 'inactive'}`}>
                                    {item.status}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                                <div className="landlord-table-actions">
                                    <button className="btn-action edit" title="Chỉnh sửa">✏️</button>
                                    <button className="btn-action push" title="Đẩy tin">🚀</button>
                                    <button className="btn-action delete" title="Xóa">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    const [subTab, setSubTab] = useState('buy');
    const [packages, setPackages] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho Modal thanh toán
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // lấy data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [pkgRes, voucherRes] = await Promise.all([
                    packageService.getPackages(),
                    packageService.getActiveVouchers()
                ]);

                if (pkgRes.code === 200) {
                    setPackages(pkgRes.data || []);
                }
                if (voucherRes && voucherRes.code === 200) {
                    setVouchers(voucherRes.data || []);
                }
            } catch (err) {
                console.error("Lỗi fetch data:", err);
                setError("Không thể kết nối đến hệ thống.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Fetch thông tin gói đang hoạt động của user
        const fetchCurrentPackage = async () => {
            setLoadingCurrentPkg(true);
            try {
                // Gọi API lấy toàn bộ gói (API này các chức năng khác gọi bình thường, không cần ID)
                const res = await packageService.getPackages();

                if (res && res.code === 200) {
                    const allPackages = res.data || [];

                    // Vì tài khoản của bạn đang test là Landlord thường,
                    // chúng ta sẽ lọc lấy gói 'Gói đăng tin' với tier 'NORMAL' đang có trong hệ thống để hiển thị
                    const myPackage = allPackages.find(
                        pkg => pkg.type?.value === 'POSTING' && pkg.tier?.value === 'NORMAL'
                    );

                    if (myPackage) {
                        console.log("Tìm thấy gói phù hợp cho Landlord:", myPackage);
                        setCurrentPackage(myPackage); // Set vào state để hiển thị lên giao diện "Gói của tôi"
                    } else {
                        setCurrentPackage(null);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy gói đang hoạt động:", error);
                setCurrentPackage(null);
            } finally {
                setLoadingCurrentPkg(false);
            }
        };
        fetchCurrentPackage();
    }, []);

    // CÁC HÀM XỬ LÝ THANH TOÁN & VOUCHER
    const handleSelectPacket = (pkg) => {
        setSelectedPkg(pkg);
        setSelectedVoucher(null);
        setShowModal(true); // Mở modal khi bấm chọn gói
    };

    const calculateFinalPrice = () => {
        if (!selectedPkg) return 0;
        let price = selectedPkg.price || 0;

        if (selectedVoucher) {
            let discount = (price * (selectedVoucher.discountPercentage || 0)) / 100;
            if (selectedVoucher.maxDiscountAmount && discount > selectedVoucher.maxDiscountAmount) {
                discount = selectedVoucher.maxDiscountAmount;
            }
            price = Math.max(0, price - discount);
        }
        return price;
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const finalPrice = calculateFinalPrice();
            const orderPayload = {
                packageId: selectedPkg.id,
                voucherId: selectedVoucher ? selectedVoucher.id : null,
                totalPrice: finalPrice
            };

            const orderRes = await orderService.createOrder(orderPayload);
            const orderId = orderRes?.data?.id || orderRes?.id;

            if (orderId) {
                const resData = await paymentService.createPaymentUrl(orderId);
                if (resData && resData.code === 200) {
                    window.location.href = resData.data;
                } else {
                    alert(resData.message || 'Không lấy được URL thanh toán');
                }
            } else {
                alert(orderRes?.message || 'Khởi tạo đơn hàng thất bại, vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            alert(error.response?.data?.message || "Có lỗi xảy ra tại hệ thống thanh toán");
        } finally {
            setLoading(false);
        }
    };

    // Thêm state để lưu thông tin gói hiện tại
    const [currentPackage, setCurrentPackage] = useState(null);
    const [loadingCurrentPkg, setLoadingCurrentPkg] = useState(false);


    // 4. RENDER GIAO DIỆN CHÍNH
    const renderPayments = () => {
        if (loading) return <div className="nexus-pricing-loading">Đang tải dữ liệu...</div>;
        if (error) return <div className="nexus-pricing-error">{error}</div>;

        // Tách gói đăng tin (POSTING) và đẩy tin (BOOSTING) từ API thật
        const postPackages = packages.filter(pkg => pkg.type?.value === 'POSTING');
        const pushPackages = packages.filter(pkg => pkg.type?.value === 'BOOSTING');

        return (
            <div className="landlord-fade-in landlord-payment-wrapper">
                {/* 5. MODAL THANH TOÁN (Chỉ hiện khi showModal = true) */}
                {showModal && selectedPkg && (
                    <div className="nexus-modal-overlay">
                        <div className="nexus-confirm-modal">
                            <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
                            <h2>Xác nhận gói dịch vụ</h2>

                            <div className="modal-pkg-info">
                                <div className="info-row">
                                    <span>Gói đã chọn:</span>
                                    <strong>{selectedPkg.name} ({selectedPkg.tier?.value})</strong>
                                </div>
                                <div className="info-row">
                                    <span>Thời gian:</span>
                                    <strong>{selectedPkg.activeDays} ngày</strong>
                                </div>
                                <div className="info-row">
                                    <span>Giá gốc:</span>
                                    <strong>{selectedPkg.price?.toLocaleString()}đ</strong>
                                </div>
                            </div>

                            <div className="voucher-section">
                                <h4>Chọn Voucher giảm giá</h4>
                                <select
                                    className="voucher-select"
                                    value={selectedVoucher?.id || ""}
                                    onChange={(e) => {
                                        const v = vouchers.find(v => v.id === e.target.value);
                                        setSelectedVoucher(v || null);
                                    }}
                                >
                                    <option value="">-- Không sử dụng voucher --</option>
                                    {vouchers && vouchers.length > 0 ? (
                                        vouchers.map(v => (
                                            <option key={v.id} value={v.id}>
                                                Mã: ...{v.id.slice(-6).toUpperCase()} (Giảm {v.discountPercentage}% - Tối đa {v.maxDiscountAmount?.toLocaleString()}đ)
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Không có mã giảm giá nào khả dụng</option>
                                    )}
                                </select>
                            </div>

                            <div className="total-payment">
                                <div className="total-row">
                                    <span>Số tiền được giảm:</span>
                                    <span className="discount-text">
                                    -{selectedPkg && selectedVoucher
                                        ? Math.min((selectedPkg.price * selectedVoucher.discountPercentage) / 100, selectedVoucher.maxDiscountAmount).toLocaleString()
                                        : 0}đ
                                </span>
                                </div>
                                <div className="total-row final">
                                    <span>Tổng thanh toán:</span>
                                    <span className="final-price">{calculateFinalPrice().toLocaleString()}đ</span>
                                </div>
                            </div>

                            <button className="btn-confirm-payment" onClick={handlePayment}>
                                Thanh toán ngay
                            </button>
                        </div>
                    </div>
                )}

                {/* Sub-navigation */}
                <div className="landlord-custom-subtabs">
                    <button
                        className={subTab === 'current' ? 'active' : ''}
                        onClick={() => setSubTab('current')}
                    >
                        Gói của tôi
                    </button>
                    <button
                        className={subTab === 'buy' ? 'active' : ''}
                        onClick={() => setSubTab('buy')}
                    >
                        Mua gói mới
                    </button>
                </div>

                {subTab === 'current' ? (
                    <div className="landlord-active-card">
                        <div className="landlord-card-header">
                            <h3>Gói đang hoạt động</h3>
                            {currentPackage && (
                                <span className="status-badge-active">
                                ● Đang hoạt động
                            </span>
                            )}
                        </div>

                        {loadingCurrentPkg ? (
                            <p className="loading-text">Đang tải thông tin gói dịch vụ...</p>
                        ) : currentPackage ? (
                            <div className="landlord-current-pkg-item landlord-current-pkg-box">
                                <div className="pkg-info">
                                    <h4 className="pkg-title-row">
                                        🚀 {currentPackage.name}
                                        {currentPackage.tier?.value && (
                                            <span className="tier-badge">
                                            {currentPackage.tier.value}
                                        </span>
                                        )}
                                    </h4>

                                    <div className="info-stats-grid">
                                        <div className="stat-card-item">
                                            <span>📅 Hạn sử dụng gói</span>
                                            <strong>{currentPackage.activeDays} ngày</strong>
                                        </div>
                                        <div className="stat-card-item">
                                            <span>📊 Hạn mức đăng tin</span>
                                            <strong>{currentPackage.limitQuota} bài viết</strong>
                                        </div>
                                        <div className="stat-card-item">
                                            <span>🏷️ Loại dịch vụ</span>
                                            <strong>
                                                {currentPackage.type?.value === 'POSTING' ? 'Gói đăng tin' : currentPackage.type?.value || 'Đăng tin'}
                                            </strong>
                                        </div>
                                        <div className="stat-card-item">
                                            <span>💰 Giá trị gói</span>
                                            <strong>{currentPackage.price?.toLocaleString()}đ</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="landlord-empty-pkg-state">
                                <div className="icon">📦</div>
                                <p>Bạn hiện chưa có gói dịch vụ nào đang hoạt động.</p>
                                <button
                                    className="btn-buy-now-trigger"
                                    onClick={() => setSubTab('buy')}
                                >
                                    Mua gói dịch vụ ngay
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="landlord-pricing-container">
                        <div className="landlord-pricing-header">
                            <h2>Bảng giá dịch vụ</h2>
                            <p>Lựa chọn gói dịch vụ phù hợp để tối ưu hiệu quả cho thuê</p>
                        </div>

                        <div className="landlord-pricing-section">
                            {/* Danh sách Gói Đăng Tin (Lọc từ API) */}
                            {postPackages.length > 0 && (
                                <>
                                    <h3 className="pricing-section-title">Gói đăng tin</h3>
                                    <div className="landlord-pricing-grid">
                                        {postPackages.map((pkg) => (
                                            <PacketCard key={pkg.id} pkg={pkg} onSelect={handleSelectPacket} />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Danh sách Gói Đẩy Tin (Lọc từ API) */}
                            {pushPackages.length > 0 && (
                                <>
                                    <h3 className="pricing-section-title pricing-section-title boost">Gói đẩy tin</h3>
                                    <div className="landlord-pricing-grid">
                                        {pushPackages.map((pkg) => (
                                            <PacketCard key={pkg.id} pkg={pkg} onSelect={handleSelectPacket} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /* ─── Tab: Reports ─── */
    const renderReports = () => (
        <section className="landlord-card landlord-full-width">
            <h3>Phản hồi từ người thuê</h3>
            <div className="landlord-report-item">
                <div className="landlord-report-user">Lê Văn C (Phòng 302)</div>
                <p>"Vòi hoa sen bị hỏng, nhờ chủ nhà qua kiểm tra giúp ạ."</p>
                <button className="landlord-btn-text">Phản hồi ngay</button>
            </div>
        </section>
    );

    const tabTitle = {
        dashboard:    'Bảng điều khiển',
        appointments: 'Quản lý lịch hẹn',
        listings:     'Tin đăng của tôi',
        messages:     'Tin nhắn',
        payments:     'Gói tin',
        reports:      'Báo cáo & Khiếu nại',
    };
    const [landlord, setLandlord] = useState(null);
    const landlordInitials = useMemo(() => {
        if (!landlord) return '??';
        const name = landlord.fullName || landlord.username || 'User';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [landlord]);
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await UserService.getUserProfile();
                setLandlord(data.data); // Lưu dữ liệu trả về từ API (thường có fullName, avatarUrl...)
            } catch (err) {
                console.error('Lỗi lấy profile:', err);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="landlord-container">
            <aside className="landlord-sidebar">
                <Link to="/" className="landlord-logo">TroSinhVien</Link>
                <nav className="landlord-nav-menu">
                    {[
                        { key: 'dashboard',    icon: '📊', label: 'Bảng điều khiển' },
                        { key: 'appointments', icon: '📅', label: 'Quản lý lịch hẹn' },
                        { key: 'listings',     icon: '🏠', label: 'Quản lý tin đăng' },
                        { key: 'messages',     icon: '💬', label: 'Tin nhắn' },
                        { key: 'payments',     icon: '💳', label: 'Gói tin' },
                        { key: 'reports',      icon: '📋', label: 'Báo cáo người thuê' },
                    ].map(({ key, icon, label }) => (
                        <div
                            key={key}
                            className={`landlord-nav-item ${activeTab === key ? 'landlord-active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {icon} {label}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className="landlord-main">
                <header className="landlord-main-header">
                    <h1>{tabTitle[activeTab]}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <NotificationBell />
                        <div className="landlord-user-info">
                            <div className="detail-avatar-wrapper">
                                {landlord?.avatar ? (
                                    <img
                                        src={landlord.avatar}
                                        className="detail-avatar-img"
                                        alt="Host"
                                    />
                                ) : (
                                    <div className="detail-avatar-circle">
                                        {landlordInitials}
                                    </div>
                                )}
                            </div>
                            <div className="detail-landlord-info">
                                <h4 className="landlord-name-display">
                                    {landlord?.fullName || landlord?.username || 'Đang tải...'}
                                </h4>
                                <div className="detail-verified-badge">
                                    {/* Giả sử bạn dùng emoji hoặc SVG cho IconVerified */}
                                    <span className="badge-icon">✓</span>
                                    Chủ trọ
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="landlord-content-area">
                    {activeTab === 'dashboard'    && renderDashboard()}
                    {activeTab === 'appointments' && renderAppointments()}
                    {activeTab === 'listings'     && renderListings()}
                    {activeTab === 'messages'     && renderMessages()}
                    {activeTab === 'payments'     && renderPayments()}
                    {activeTab === 'reports'      && renderReports()}
                </div>
            </main>
        </div>
    );
}

export default LandlordDashboard;