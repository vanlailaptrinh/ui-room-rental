import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import './ForgotPassword.css';

export default function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email) {
            return setError('Vui lòng nhập email.');
        }
        setIsLoading(true);
        try {
            await AuthService.forgetPassword(email);
            setSuccess('OTP đặt lại mật khẩu đã được gửi tới email của bạn.');
            setTimeout(() => {
                navigate('/reset-password', {
                    state: { email }
                });
            }, 1500);
        } catch (err) {
            setError(err.message || 'Không thể gửi OTP đặt lại mật khẩu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-page">
            <main className="forgot-main">
                <div className="forgot-card">

                    {/* LEFT */}
                    <div className="forgot-sidebar">
                        <img
                            className="forgot-image"
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                            alt="Forgot Password"
                        />
                        <div className="sidebar-overlay"></div>
                        <div className="sidebar-text-container">
                            <h1 className="sidebar-title">
                                Tìm lại tài khoản của bạn
                            </h1>

                            <p className="sidebar-desc">
                                Nhập email để nhận OTP đặt lại
                                mật khẩu nhanh chóng.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="forgot-form-container">
                        <div className="brand-header">
                            <div className="brand-title">
                                The Curated Sanctuary
                            </div>
                            <div className="brand-divider"></div>
                        </div>

                        <div className="instructions">
                            <h2 className="instructions-title">
                                Quên mật khẩu?
                            </h2>

                            <p className="instructions-text">
                                Nhập email đã đăng ký để nhận OTP
                                đặt lại mật khẩu.
                            </p>
                        </div>

                        {/* ALERT */}
                        {error && (
                            <div className="alert error-alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="alert success-alert">
                                {success}
                            </div>
                        )}

                        {/* FORM */}
                        <form
                            className="forgot-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="input-group">
                                <label
                                    className="input-label"
                                    htmlFor="email"
                                >
                                    Địa chỉ Email
                                </label>

                                <input
                                    id="email"
                                    className="text-input"
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            {/* ACTION */}
                            <div className="actions-container">
                                <button
                                    className="btn-submit"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading
                                        ? 'Đang gửi...'
                                        : 'Gửi OTP đặt lại'}
                                </button>

                                <Link
                                    to="/login"
                                    className="back-to-login"
                                >
                                    <span className="material-symbols-outlined icon-small">
                                        arrow_back
                                    </span>
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}