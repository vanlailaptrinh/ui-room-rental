import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Favorites.css';
import FavoriteService from '../../services/favoriteService';
import { useAuth } from '../../context/authContext';

function Favorites() {
    const { user } = useAuth();
    const navigate  = useNavigate();

    const [favorites, setFavorites]   = useState([]);
    const [loading,   setLoading]     = useState(true);
    const [removing,  setRemoving]    = useState(null); // postId đang xóa

    const fetchFavorites = useCallback(async () => {
        try {
            setLoading(true);
            const res  = await FavoriteService.getMyFavorites();
            setFavorites(res.data || []);
        } catch (err) {
            console.error('Lấy favorites lỗi:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchFavorites();
    }, [user, navigate, fetchFavorites]);

    const handleRemove = async (postId) => {
        try {
            setRemoving(postId);
            await FavoriteService.removeFavorite(postId);
            setFavorites(prev => prev.filter(f => f.postId !== postId));
        } catch (err) {
            alert('Không thể xóa. Vui lòng thử lại!');
        } finally {
            setRemoving(null);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <main className="favorites-page">
                <div className="fav-loading">
                    <div className="fav-spinner" />
                    <p>Đang tải danh sách yêu thích...</p>
                </div>
            </main>
        );
    }

    // ── Empty ────────────────────────────────────────────────────────────────
    if (favorites.length === 0) {
        return (
            <main className="favorites-page">
                <header className="favorites-header">
                    <h1>❤️ Phòng yêu thích</h1>
                    <p className="header-subtitle">Bạn chưa lưu phòng nào</p>
                </header>
                <div className="empty-favorites">
                    <div className="empty-icon">🏠</div>
                    <h2>Chưa có phòng yêu thích</h2>
                    <p>Hãy dạo quanh và nhấn ❤️ cho những căn phòng bạn thích!</p>
                    <button className="btn-go-home" onClick={() => navigate('/postlist')}>
                        Khám phá ngay
                    </button>
                </div>
            </main>
        );
    }

    // ── List ─────────────────────────────────────────────────────────────────
    return (
        <main className="favorites-page">
            <header className="favorites-header">
                <h1>❤️ Phòng yêu thích</h1>
                <p className="header-subtitle">
                    Bạn đang lưu <strong>{favorites.length}</strong> phòng
                </p>
            </header>

            <div className="fav-grid">
                {favorites.map((fav) => {
                    const post = fav.post || {};
                    const img  = post.images?.[0] || `https://picsum.photos/400/280?random=${fav.postId}`;

                    return (
                        <div key={fav.id} className="fav-card">
                            {/* Ảnh */}
                            <div className="fav-card-img" onClick={() => navigate(`/detail/${fav.postId}`)}>
                                <img src={img} alt={post.title} />
                                <span className={`fav-status-badge ${post.status?.toLowerCase()}`}>
                                    {post.status === 'ACTIVE' ? 'Còn trống' :
                                     post.status === 'RENTED' ? 'Đã cho thuê' : post.status}
                                </span>
                            </div>

                            {/* Nội dung */}
                            <div className="fav-card-body">
                                <h3
                                    className="fav-card-title"
                                    onClick={() => navigate(`/detail/${fav.postId}`)}
                                >
                                    {post.title || 'Chưa có tiêu đề'}
                                </h3>

                                <p className="fav-card-address">
                                    📍 {post.address || '—'}
                                </p>

                                <div className="fav-card-meta">
                                    {post.price && (
                                        <span className="fav-price">
                                            {post.price.toLocaleString('vi-VN')}đ<small>/tháng</small>
                                        </span>
                                    )}
                                    {post.area && (
                                        <span className="fav-area">📐 {post.area} m²</span>
                                    )}
                                </div>

                                <div className="fav-card-actions">
                                    <button
                                        className="btn-fav-view"
                                        onClick={() => navigate(`/detail/${fav.postId}`)}
                                    >
                                        Xem phòng
                                    </button>
                                    <button
                                        className="btn-fav-remove"
                                        onClick={() => handleRemove(fav.postId)}
                                        disabled={removing === fav.postId}
                                    >
                                        {removing === fav.postId ? '...' : '🗑 Bỏ lưu'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}

export default Favorites;