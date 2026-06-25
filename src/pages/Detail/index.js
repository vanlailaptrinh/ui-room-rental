import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Detail.css';
import {
    IconLocation, IconVerified, IconFavorite,
    IconChevronRight, IconReport
} from '../../assets/Icons';
import api from '../../services/axios';
import BookingService from '../../services/bookingService';
import ChatService from '../../services/chatService';
import FavoriteService from '../../services/favoriteService';
import UserService from '../../services/userService';
import ReviewService from '../../services/reviewService';
import { useAuth } from '../../context/authContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Detail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [landlord, setLandlord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('10:00');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    const [isFav, setIsFav] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submitReviewLoading, setSubmitReviewLoading] = useState(false);

    useEffect(() => {
        const fetchFullData = async () => {
            if (!id || id === ":1") return;
            try {
                setLoading(true);
                const postRes = await api.get(`/posts/${id}`);
                const postData = postRes.data?.data;

                if (postData) {
                    setPost(postData);

                    if (postData.landlordId) {
                        try {
                            const landlordRes = await UserService.getUserById(postData.landlordId);
                            setLandlord(landlordRes.data);
                        } catch (err) {
                            console.error("Lỗi lấy thông tin chủ nhà:", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết bài đăng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFullData();
    }, [id]);

    useEffect(() => {
        if (!user || !id || id === ':1') return;
        FavoriteService.checkFavorite(id)
            .then(isFavorited => setIsFav(isFavorited))
            .catch(() => {});
    }, [id, user]);

    useEffect(() => {
        if (!landlord?.id) return;

        const fetchReviews = async () => {
            try {
                setReviewLoading(true);
                const res = await ReviewService.getReviewsByLandlord(landlord.id);

                if (res.code === 200) {
                    const fetchedReviews = res.data || [];

                    // 1. Lấy danh sách userId duy nhất từ các bài đánh giá để tránh gọi API trùng lặp
                    const uniqueUserIds = [...new Set(fetchedReviews.map(rv => rv.userId).filter(Boolean))];

                    // 2. Gọi API lấy thông tin chi tiết cho từng userId
                    const userPromises = uniqueUserIds.map(userId =>
                        UserService.getUserById(userId)
                            .then(userRes => ({ id: userId, data: userRes.data }))
                            .catch(() => ({ id: userId, data: null }))
                    );

                    const usersData = await Promise.all(userPromises);

                    // 3. Tạo một object map userId => thông tin user
                    const userMap = usersData.reduce((acc, curr) => {
                        if (curr.data) acc[curr.id] = curr.data;
                        return acc;
                    }, {});

                    // 4. Ghép thông tin user vào danh sách review
                    const reviewsWithUsers = fetchedReviews.map(rv => ({
                        ...rv,
                        user: userMap[rv.userId] || null
                    }));

                    setReviews(reviewsWithUsers);
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách đánh giá:", err);
            } finally {
                setReviewLoading(false);
            }
        };

        fetchReviews();
    }, [landlord?.id]);

    const handleToggleFavorite = async () => {
        if (!user) { alert('Vui lòng đăng nhập để lưu yêu thích!'); return; }
        if (favLoading) return;
        try {
            setFavLoading(true);
            if (isFav) {
                await FavoriteService.removeFavorite(id);
                setIsFav(false);
            } else {
                await FavoriteService.addFavorite(id);
                setIsFav(true);
            }
        } catch (err) {
            console.error('Toggle favorite error:', err);
            alert(err?.response?.data?.message || 'Không thể cập nhật yêu thích.');
        } finally {
            setFavLoading(false);
        }
    };

    const handleStartChat = async () => {
        if (!user) {
            alert('Vui lòng đăng nhập để nhắn tin!');
            return;
        }
        if (!landlord?.id) {
            alert('Không tìm thấy thông tin chủ trọ.');
            return;
        }
        if (chatLoading) return;
        try {
            setChatLoading(true);
            const res = await ChatService.getOrCreateChatRoom(landlord.id);
            const roomData = res?.data || res;
            const roomId = roomData?.roomId;
            if (!roomId) throw new Error('Không nhận được roomId từ server');
            navigate(`/chat/${roomId}`, {
                state: { roomId, targetUser: landlord },
            });
        } catch (err) {
            console.error('Chat error:', err);
            alert(err?.response?.data?.message || 'Không thể mở phòng chat. Vui lòng thử lại.');
        } finally {
            setChatLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Vui lòng đăng nhập để đánh giá!');
            return;
        }
        if (!newComment.trim()) {
            alert('Vui lòng nhập nội dung đánh giá!');
            return;
        }
        if (submitReviewLoading) return;

        try {
            setSubmitReviewLoading(true);
            const res = await ReviewService.createReview({
                rating: newRating,
                comment: newComment,
                landlordId: landlord.id
            });

            if (res.code === 200) {
                alert('Gửi đánh giá thành công!');
                setNewComment('');
                setNewRating(5);
                setReviews(prev => [{ ...res.data, user: user }, ...prev]);
            }
        } catch (err) {
            console.error('Lỗi gửi đánh giá:', err);
            alert(err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmitReviewLoading(false);
        }
    };

    const images = post?.images?.length > 0 ? post.images : ["https://picsum.photos/800/500"];

    const handleNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    const handleOverlayClick = (e) => {
        if (e.target.className === 'detail-booking-overlay') setIsBookingOpen(false);
    };

    const landlordInitials = useMemo(() => {
        if (!landlord) return '??';
        const name = landlord.fullName || landlord.username || 'User';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }, [landlord]);

    if (loading) return <div className="detail-loading-spinner">Đang tải dữ liệu...</div>;
    if (!post) return <div className="detail-error">Không tìm thấy bài đăng này.</div>;

    return (
        <main className="detail-container">
            <div className="detail-grid">
                <div className="detail-main-content">
                    <section className="detail-gallery">
                        <div className="detail-main-image-wrapper">
                            <img src={images[currentIndex]} className="detail-main-image" alt="Phòng" />
                            <button className="detail-nav-btn detail-prev" onClick={handlePrev}>
                                <IconChevronRight style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <button className="detail-nav-btn detail-next" onClick={handleNext}>
                                <IconChevronRight />
                            </button>
                        </div>
                        <div className="detail-thumb-grid">
                            {images.map((img, idx) => (
                                <div key={idx}
                                     className={`detail-thumb-item ${idx === currentIndex ? 'detail-active' : ''}`}
                                     onClick={() => setCurrentIndex(idx)}>
                                    <img src={img} alt="thumb" />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="detail-section">
                        <div className="detail-section-title"><span className="detail-title-line"></span> Nội dung bài đăng</div>
                        <div className="detail-description-text">
                            <h3>{post.title}</h3>
                            <p style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
                        </div>
                    </section>

                    <section className="detail-section">
                        <div className="detail-section-title"><span className="detail-title-line"></span> Tiện ích phòng</div>
                        <div className="detail-amenities-grid">
                            {post.amenities && post.amenities.length > 0 ? (
                                post.amenities.map((item) => (
                                    <div className="detail-amenity-box" key={item.id}>
                                        <span>{item.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa cập nhật tiện ích.</p>
                            )}
                        </div>
                    </section>

                    <section className="detail-section">
                        <div className="detail-section-title">
                            <span className="detail-title-line"></span> Vị trí
                        </div>
                        <div className="detail-map-wrapper" style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginTop: '15px', border: '1px solid #e0e0e0' }}>
                            {post.latitude && post.longitude ? (
                                <MapContainer
                                    center={[post.latitude, post.longitude]}
                                    zoom={15}
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[post.latitude, post.longitude]}>
                                        <Popup>
                                            {post.address}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="detail-no-map">Thông tin vị trí chưa được cập nhật</div>
                            )}
                        </div>
                        <p className="detail-map-address-text" style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                            <IconLocation width="14" style={{ marginRight: '5px' }} />
                            {post.address}
                        </p>
                    </section>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-sticky-box">
                        <div className="detail-post-header-sidebar">
                            <h1 className="detail-post-title">{post.title}</h1>
                            <div className="detail-address-row" style={{ display: 'flex', gap: '6px', color: '#747780', marginTop: '10px' }}>
                                <IconLocation width="18" />
                                <span>{post.address}</span>
                            </div>
                        </div>

                        <div className="detail-price-card">
                            <p className="detail-label">Giá thuê</p>
                            <h2 className="detail-price-value">{post.price?.toLocaleString()}đ <small>/ tháng</small></h2>

                            <div className="detail-stats-row">
                                <div className="detail-stat-item">
                                    <span className="detail-stat-label">Diện tích</span>
                                    <span className="detail-stat-val">{post.area} m²</span>
                                </div>
                                <div className="detail-stat-item">
                                    <span className="detail-stat-label">Lượt xem</span>
                                    <span className="detail-stat-val">{post.views}</span>
                                </div>
                            </div>

                            <button className="detail-btn-primary" onClick={() => setIsBookingOpen(true)}>Đặt lịch ngay</button>

                            <div className="detail-action-buttons">
                                <button
                                    className={`detail-btn-outline detail-btn-favorite ${isFav ? 'detail-favorited' : ''}`}
                                    onClick={handleToggleFavorite}
                                    disabled={favLoading}
                                    title={isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                                >
                                    <IconFavorite style={{ color: isFav ? '#ef4444' : undefined }} />
                                    {favLoading ? '...' : isFav ? 'Đã lưu' : 'Yêu thích'}
                                </button>
                                {user?.role !== 'LANDLORD' && user?.role !== 'ADMIN' && (
                                    <button className="detail-btn-outline" onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            return;
                                        }
                                        navigate('/reports', { state: { targetId: post.id } });
                                    }}>
                                        <IconReport /> Báo cáo
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="detail-landlord-card">
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
                                <h4>{landlord?.fullName || landlord?.username || 'Đang tải...'}</h4>
                                <div className="detail-verified-badge">
                                    <IconVerified width="14" />
                                    Chủ trọ
                                </div>
                            </div>
                            <button
                                className="detail-btn-chat"
                                onClick={handleStartChat}
                                disabled={chatLoading}
                            >
                                {chatLoading ? 'Đang kết nối...' : 'Nhắn tin'}
                            </button>
                        </div>

                        {/* --- KHU VỰC ĐÁNH GIÁ CHỦ TRỌ ĐÃ ĐƯỢC TỐI ƯU UX/UI --- */}
                        <section className="detail-section" style={{ marginTop: '24px', borderTop: '1px solid #edf2f7', paddingTop: '20px' }}>
                            <div className="detail-section-title" style={{ marginBottom: '16px' }}>
                                <span className="detail-title-line"></span> Đánh giá chủ trọ
                            </div>

                            <div className="detail-reviews-list" style={{ maxBoundedHeight: '280px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                                {reviewLoading ? (
                                    <p style={{ color: '#718096', fontSize: '14px' }}>Đang tải đánh giá...</p>
                                ) : reviews.length > 0 ? (
                                    reviews.map((rv) => (
                                        <div key={rv.id} className="detail-review-card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#1a202c', fontSize: '14px', lineHeight: '1.2', marginBottom: '2px' }}>
                                                        {rv.user?.fullName || rv.user?.username || 'Người dùng'}
                                                    </div>
                                                    <div style={{ color: '#ecc94b', fontSize: '13px', letterSpacing: '1px' }}>
                                                        {"★".repeat(rv.rating)}{"☆".repeat(5 - rv.rating)}
                                                    </div>
                                                </div>
                                                {rv.createdAt && (
                                                    <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                                                {new Date(rv.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                                )}
                                            </div>
                                            <p style={{ margin: 0, color: '#4a5568', fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-line' }}>{rv.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#718096', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Chưa có đánh giá nào.</p>
                                )}
                            </div>

                            {user ? (
                                <form onSubmit={handleSubmitReview} className="detail-review-form" style={{ marginTop: '16px', padding: '14px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <label style={{ fontWeight: '500', fontSize: '13px', color: '#4a5568' }}>Chất lượng:</label>
                                        <select
                                            value={newRating}
                                            onChange={(e) => setNewRating(Number(e.target.value))}
                                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px', color: '#2d3748', outline: 'none' }}
                                        >
                                            <option value={5}>⭐⭐⭐⭐⭐</option>
                                            <option value={4}>⭐⭐⭐⭐</option>
                                            <option value={3}>⭐⭐⭐</option>
                                            <option value={2}>⭐⭐</option>
                                            <option value={1}>⭐</option>
                                        </select>
                                    </div>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Viết phản hồi của bạn về chủ trọ..."
                                        style={{ width: '100%', minHeight: '65px', maxHeight: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '13px', resize: 'vertical', outline: 'none' }}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="detail-btn-primary"
                                        disabled={submitReviewLoading}
                                        style={{ width: '100%', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}
                                    >
                                        {submitReviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                                    </button>
                                </form>
                            ) : (
                                <div style={{ marginTop: '16px', padding: '12px 16px', textAlign: 'center', backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #e1f0ff' }}>
                                    <p style={{ margin: 0, color: '#4a5568', fontSize: '13px' }}>
                                        Vui lòng <span style={{ color: '#2b6cb0', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }} onClick={() => navigate('/login')}>đăng nhập</span> để để lại đánh giá.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {isBookingOpen && (
                <div className="detail-booking-overlay" onClick={handleOverlayClick}>
                    <div className="detail-booking-modal">
                        <button className="detail-close-modal" onClick={() => { setIsBookingOpen(false); setBookingResult(null); }}>&times;</button>
                        <h3>📅 Đặt lịch xem phòng</h3>

                        {bookingResult ? (
                            <div className={`detail-booking-result ${bookingResult.success ? 'detail-result-success' : 'detail-result-error'}`}>
                                <span className="detail-result-icon">{bookingResult.success ? '✅' : '❌'}</span>
                                <p>{bookingResult.message}</p>
                                {bookingResult.success ? (
                                    <button className="detail-btn-submit" onClick={() => { setIsBookingOpen(false); setBookingResult(null); }}>Đóng</button>
                                ) : (
                                    <button className="detail-btn-submit" onClick={() => setBookingResult(null)}>Thử lại</button>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="detail-modal-desc">Gửi yêu cầu xem phòng <strong>{post.title}</strong> đến chủ nhà. Chủ nhà sẽ duyệt và xác nhận lịch hẹn.</p>
                                <form
                                    className="detail-booking-form"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!bookingDate) return;
                                        try {
                                            setBookingLoading(true);
                                            const isoDateTime = `${bookingDate}T${bookingTime}:00`;
                                            await BookingService.createBooking({
                                                postId: post.id,
                                                bookingTime: isoDateTime,
                                            });
                                            setBookingResult({ success: true, message: 'Đặt lịch thành công! Chủ nhà sẽ liên hệ xác nhận sớm.' });
                                        } catch (err) {
                                            const msg = err?.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.';
                                            setBookingResult({ success: false, message: msg });
                                        } finally {
                                            setBookingLoading(false);
                                        }
                                    }}
                                >
                                    <label className="detail-form-label">Ngày xem phòng</label>
                                    <input
                                        type="date"
                                        required
                                        className="detail-form-input"
                                        value={bookingDate}
                                        onChange={e => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <label className="detail-form-label">Giờ xem phòng</label>
                                    <select
                                        className="detail-form-input"
                                        value={bookingTime}
                                        onChange={e => setBookingTime(e.target.value)}
                                    >
                                        {['07:00','08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <button type="submit" className="detail-btn-submit" disabled={bookingLoading}>
                                        {bookingLoading ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}

export default Detail;