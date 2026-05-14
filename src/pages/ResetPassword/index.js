import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import './ResetPassword.css';

export default function ResetPassword() {

    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError('');
        setSuccess('');

        if (
            !formData.email ||
            !formData.otp ||
            !formData.newPassword ||
            !formData.confirmPassword
        ) {
            return setError('Vui lòng nhập đầy đủ thông tin.');
        }

        if (
            formData.newPassword !==
            formData.confirmPassword
        ) {
            return setError('Mật khẩu xác nhận không khớp.');
        }

        setIsLoading(true);

        try {

            await AuthService.resetPassword(
                formData.email,
                formData.otp,
                formData.newPassword,
                formData.confirmPassword
            );

            setSuccess(
                'Đặt lại mật khẩu thành công.'
            );

            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {

            setError(
                err.message ||
                'Không thể đặt lại mật khẩu.'
            );

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-page">

            <main className="reset-main">

                <div className="reset-card">

                    {/* LEFT */}
                    <div className="reset-sidebar">

                        <img
                            className="reset-image"
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop"
                            alt="Reset Password"
                        />

                        <div className="sidebar-overlay"></div>

                        <div className="sidebar-text-container">

                            <h1 className="sidebar-title">
                                Đặt lại mật khẩu
                            </h1>

                            <p className="sidebar-desc">
                                Nhập OTP và mật khẩu mới để
                                khôi phục tài khoản của bạn.
                            </p>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="reset-form-container">

                        <div className="brand-header">

                            <div className="brand-title">
                                The Curated Sanctuary
                            </div>

                            <div className="brand-divider"></div>

                        </div>

                        <div className="instructions">

                            <h2 className="instructions-title">
                                Tạo mật khẩu mới
                            </h2>

                            <p className="instructions-text">
                                OTP đã được gửi tới email của bạn.
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
                            className="reset-form"
                            onSubmit={handleSubmit}
                        >

                            {/* EMAIL */}
                            <div className="input-group">

                                <label>Email</label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@gmail.com"
                                    readOnly={!!location.state?.email}
                                    required
                                />

                            </div>

                            {/* OTP */}
                            <div className="input-group">

                                <label>Mã OTP</label>

                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    placeholder="Nhập mã OTP"
                                    required
                                />

                            </div>

                            {/* PASSWORD */}
                            <div className="input-group">

                                <label>Mật khẩu mới</label>

                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                />

                            </div>

                            {/* CONFIRM */}
                            <div className="input-group">

                                <label>Xác nhận mật khẩu</label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
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
                                        ? 'Đang xử lý...'
                                        : 'Đặt lại mật khẩu'}
                                </button>

                                <Link
                                    to="/login"
                                    className="back-to-login"
                                >
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