import React, { useMemo, useState } from 'react';
import ReviewService from '../../services/reviewService';
import './RentalFeedbackPanel.css';

const isSameId = (left, right) => String(left || '') === String(right || '');

function RentalFeedbackPanel({
    user,
    landlord,
    reviews,
    loading,
    canReview,
    onLogin,
    onReviewsChange
}) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const myReview = useMemo(() => {
        if (!user) return null;
        return reviews.find((review) => isSameId(review.userId || review.reviewerId || review.user?.id, user.id));
    }, [reviews, user]);

    const isEditing = Boolean(editingReviewId);

    const resetForm = () => {
        setRating(5);
        setComment('');
        setEditingReviewId(null);
    };

    const startEdit = (review) => {
        setRating(review.rating || 5);
        setComment(review.comment || '');
        setEditingReviewId(review.id);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const normalizedComment = comment.trim();

        if (!user) {
            onLogin?.();
            return;
        }
        if (!canReview) {
            alert('Bạn cần xác nhận đã thuê trọ trước khi đánh giá.');
            return;
        }
        if (!landlord?.id || normalizedComment.length === 0) {
            alert('Vui lòng nhập nội dung đánh giá.');
            return;
        }
        if (normalizedComment.length > 1000) {
            alert('Nội dung đánh giá tối đa 1000 ký tự.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = { rating: Number(rating), comment: normalizedComment };
            const response = isEditing
                ? await ReviewService.updateReview(editingReviewId, payload)
                : await ReviewService.createReview({ ...payload, landlordId: landlord.id });
            const savedReview = {
                ...(response.data || response),
                user,
                userId: (response.data || response)?.userId || user.id
            };

            onReviewsChange((current) => {
                if (isEditing) {
                    return current.map((item) => item.id === editingReviewId ? { ...item, ...savedReview } : item);
                }
                return [savedReview, ...current];
            });
            resetForm();
            alert(isEditing ? 'Cập nhật đánh giá thành công.' : 'Gửi đánh giá thành công.');
        } catch (error) {
            alert(error?.response?.data?.message || 'Không thể lưu đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        try {
            setDeletingId(reviewId);
            await ReviewService.deleteReview(reviewId);
            onReviewsChange((current) => current.filter((item) => item.id !== reviewId));
            if (editingReviewId === reviewId) resetForm();
        } catch (error) {
            alert(error?.response?.data?.message || 'Không thể xóa đánh giá. Vui lòng thử lại.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <section className="detail-section detail-section-reviews">
            <div className="detail-section-title">
                <span className="detail-title-line"></span> Đánh giá chủ trọ
            </div>

            <div className="detail-reviews-list">
                {loading ? (
                    <p className="detail-review-status">Đang tải đánh giá...</p>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => {
                        const isOwner = user && isSameId(review.userId || review.reviewerId || review.user?.id, user.id);
                        return (
                            <div key={review.id} className="detail-review-card">
                                <div className="detail-review-header">
                                    <div>
                                        <div className="detail-review-user">
                                            {review.user?.fullName || review.user?.username || review.reviewerName || 'Người dùng'}
                                        </div>
                                        <div className="detail-review-stars">
                                            {'★'.repeat(review.rating || 0)}{'☆'.repeat(Math.max(0, 5 - (review.rating || 0)))}
                                        </div>
                                    </div>
                                    {review.createdAt && (
                                        <span className="detail-review-date">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    )}
                                </div>
                                <p className="detail-review-body">{review.comment}</p>
                                {isOwner && (
                                    <div className="rental-feedback-actions">
                                        <button type="button" onClick={() => startEdit(review)}>Sửa</button>
                                        <button
                                            type="button"
                                            className="rental-feedback-danger"
                                            onClick={() => handleDelete(review.id)}
                                            disabled={deletingId === review.id}
                                        >
                                            {deletingId === review.id ? 'Đang xóa...' : 'Xóa'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p className="detail-review-empty">Chưa có đánh giá nào.</p>
                )}
            </div>

            {!user ? (
                <div className="detail-review-login-prompt">
                    <p>Vui lòng <span onClick={onLogin}>đăng nhập</span> để đánh giá sau khi thuê.</p>
                </div>
            ) : !canReview ? (
                <div className="rental-feedback-locked">
                    Chỉ mở đánh giá khi booking của bạn đã ở trạng thái RENTED.
                </div>
            ) : myReview && !isEditing ? (
                <div className="rental-feedback-locked">
                    Bạn đã đánh giá chủ trọ này. Có thể sửa hoặc xóa đánh giá của mình ở bên trên.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="detail-review-form">
                    <div className="detail-review-form-row">
                        <label>Chất lượng:</label>
                        <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                            <option value={5}>5 sao</option>
                            <option value={4}>4 sao</option>
                            <option value={3}>3 sao</option>
                            <option value={2}>2 sao</option>
                            <option value={1}>1 sao</option>
                        </select>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value.slice(0, 1000))}
                        placeholder="Viết phản hồi của bạn về chủ trọ..."
                        maxLength={1000}
                        required
                    />
                    <div className="rental-feedback-form-footer">
                        <span>{comment.length}/1000</span>
                        {isEditing && <button type="button" className="rental-feedback-cancel" onClick={resetForm}>Hủy</button>}
                    </div>
                    <button type="submit" className="detail-btn-primary detail-btn-review-submit" disabled={submitting}>
                        {submitting ? 'Đang lưu...' : isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                    </button>
                </form>
            )}
        </section>
    );
}

export default RentalFeedbackPanel;
