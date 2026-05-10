import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Detail.css';
import {
    IconLocation, IconVerified, IconFavorite,
    IconChevronRight, IconShare
} from '../../assets/Icons';
import api from '../../services/axios';
import BookingService from '../../services/bookingService';
import FavoriteService from '../../services/favoriteService';
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
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('10:00');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    // Favorite state
    const [isFav, setIsFav] = useState(false);
    const [favLoading, setFavLoading] = useState(false);

    useEffect(() => {
        const fetchPostDetail = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/posts/${id}`);
                // Vì BE trả về { code: 200, data: { ... } }
                if (response.data && response.data.data) {
                    setPost(response.data.data);
                }
                console.log(response.data.data)
            } catch (error) {
                console.error("Lỗi lấy chi tiết:", error);
                // Nếu lỗi 401, hãy kiểm tra lại JWT ở axios interceptor
            } finally {
                setLoading(false);
            }
        };
        if (id && id !== ":1") fetchPostDetail();
    }, [id]);

    // Check favorite status sau khi có post và user
    useEffect(() => {
        if (!user || !id || id === ':1') return;
        FavoriteService.checkFavorite(id)
            .then(isFavorited => setIsFav(isFavorited))
            .catch(() => {}); // silent — không login vẫn ok
    }, [id, user]);

    // Toggle yêu thích
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

    // Xử lý ảnh từ mảng post.images trực tiếp
    const images = post?.images?.length > 0 ? post.images : ["https://picsum.photos/800/500"];

    const handleNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    const handlePrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    const handleOverlayClick = (e) => {
        if (e.target.className === 'booking-overlay') setIsBookingOpen(false);
    };

    if (loading) return <div className="loading-spinner">Đang tải dữ liệu...</div>;
    if (!post) return <div className="error">Không tìm thấy bài đăng này.</div>;

    return (
        <main className="detail-container">
            <div className="detail-grid">
                <div className="detail-main-content">
                    {/* 1. Gallery ảnh */}
                    <section className="gallery">
                        <div className="main-image-wrapper">
                            <img src={images[currentIndex]} className="main-image" alt="Phòng" />
                            <button className="nav-btn prev" onClick={handlePrev}>
                                <IconChevronRight style={{ transform: 'rotate(180deg)' }} />
                            </button>
                            <button className="nav-btn next" onClick={handleNext}>
                                <IconChevronRight />
                            </button>
                        </div>
                        <div className="thumb-grid">
                            {images.map((img, idx) => (
                                <div key={idx}
                                     className={`thumb-item ${idx === currentIndex ? 'active' : ''}`}
                                     onClick={() => setCurrentIndex(idx)}>
                                    <img src={img} alt="thumb" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Nội dung bài đăng */}
                    <section className="detail-section">
                        <div className="section-title"><span className="title-line"></span> Nội dung bài đăng</div>
                        <div className="description-text">
                            <h3>{post.title}</h3>
                            <p style={{ whiteSpace: 'pre-line' }}>{post.content}</p>
                        </div>
                    </section>

                    {/* 3. Tiện ích (Lấy từ post.amenities) */}
                    <section className="detail-section">
                        <div className="section-title"><span className="title-line"></span> Tiện ích phòng</div>
                        <div className="amenities-grid">
                            {post.amenities && post.amenities.length > 0 ? (
                                post.amenities.map((item) => (
                                    <div className="amenity-box" key={item.id}>
                                        <span>{item.name}</span>
                                    </div>
                                ))
                            ) : (
                                <p>Chưa cập nhật tiện ích.</p>
                            )}
                        </div>
                    </section>
                    {/* 4. Vị trí trên bản đồ */}
                    <section className="detail-section">
                        <div className="section-title">
                            <span className="title-line"></span> Vị trí
                        </div>
                        <div className="map-wrapper" style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginTop: '15px', border: '1px solid #e0e0e0' }}>
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
                                <div className="no-map">Thông tin vị trí chưa được cập nhật</div>
                            )}
                        </div>
                        <p className="map-address-text" style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                            <IconLocation width="14" style={{ marginRight: '5px' }} />
                            {post.address}
                        </p>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="detail-sidebar">
                    <div className="sticky-box">
                        <div className="post-header-sidebar">
                            <h1 className="post-title">{post.title}</h1>
                            <div className="address-row" style={{ display: 'flex', gap: '6px', color: '#747780', marginTop: '10px' }}>
                                <IconLocation width="18" />
                                <span>{post.address}</span>
                            </div>
                        </div>

                        <div className="price-card">
                            <p className="label">Giá thuê</p>
                            <h2 className="price-value">{post.price?.toLocaleString()}đ <small>/ tháng</small></h2>

                            <div className="stats-row">
                                <div className="stat-item">
                                    <span className="stat-label">Diện tích</span>
                                    <span className="stat-val">{post.area} m²</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Lượt xem</span>
                                    <span className="stat-val">{post.views}</span>
                                </div>
                            </div>

                            <button className="btn-primary" onClick={() => setIsBookingOpen(true)}>Đặt lịch ngay</button>

                            <div className="action-buttons">
                                <button
                                    className={`btn-outline btn-favorite ${isFav ? 'favorited' : ''}`}
                                    onClick={handleToggleFavorite}
                                    disabled={favLoading}
                                    title={isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
                                >
                                    <IconFavorite style={{ color: isFav ? '#ef4444' : undefined }} />
                                    {favLoading ? '...' : isFav ? 'Đã lưu' : 'Yêu thích'}
                                </button>
                                <button className="btn-outline"><IconShare /> Chia sẻ</button>
                            </div>
                        </div>

                        <div className="landlord-card">
                            <img src="https://i.pravatar.cc/150" className="avatar" alt="Host" />
                            <div className="landlord-info">
                                <h4>Chủ nhà</h4>
                                <div className="verified-badge"><IconVerified width="14" /> Xác thực</div>
                            </div>
                            <button className="btn-chat">Nhắn tin</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {isBookingOpen && (
                <div className="booking-overlay" onClick={handleOverlayClick}>
                    <div className="booking-modal">
                        <button className="close-modal" onClick={() => { setIsBookingOpen(false); setBookingResult(null); }}>&times;</button>
                        <h3>📅 Đặt lịch xem phòng</h3>

                        {bookingResult ? (
                            <div className={`booking-result ${bookingResult.success ? 'result-success' : 'result-error'}`}>
                                <span className="result-icon">{bookingResult.success ? '✅' : '❌'}</span>
                                <p>{bookingResult.message}</p>
                                {bookingResult.success ? (
                                    <button className="btn-submit" onClick={() => { setIsBookingOpen(false); setBookingResult(null); }}>Đóng</button>
                                ) : (
                                    <button className="btn-submit" onClick={() => setBookingResult(null)}>Thử lại</button>
                                )}
                            </div>
                        ) : (
                            <>
                                <p className="modal-desc">Gửi yêu cầu xem phòng <strong>{post.title}</strong> đến chủ nhà. Chủ nhà sẽ duyệt và xác nhận lịch hẹn.</p>
                                <form
                                    className="booking-form"
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        if (!bookingDate) return;
                                        try {
                                            setBookingLoading(true);
                                            // Ghép date + time thành ISO LocalDateTime
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
                                    <label className="form-label">Ngày xem phòng</label>
                                    <input
                                        type="date"
                                        required
                                        className="form-input"
                                        value={bookingDate}
                                        onChange={e => setBookingDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    <label className="form-label">Giờ xem phòng</label>
                                    <select
                                        className="form-input"
                                        value={bookingTime}
                                        onChange={e => setBookingTime(e.target.value)}
                                    >
                                        {['07:00','08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <button type="submit" className="btn-submit" disabled={bookingLoading}>
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