import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
// import { verifyOtpApi, resendOtpApi } from '../../services/authService';
import AuthService from '../../services/authService';

import './Verify.css';

export default function Verify() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. THAY ĐỔI QUAN TRỌNG: Đổi email thành state để có thể cập nhật qua ô input
    const [email, setEmail] = useState(location.state?.email || '');

    // Mảng lưu 6 số OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    // Refs để quản lý focus của 6 ô input
    const inputRefs = useRef([]);

    // States xử lý API
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Xử lý đếm ngược (Timer 60s mockup)
    const [countdown, setCountdown] = useState(60);

    // 2. THAY ĐỔI: Bỏ thông báo lỗi bắt buộc ngay khi load trang, chỉ chạy timer
    useEffect(() => {
        // Chạy timer đếm ngược
        const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    // Format timer hiển thị (vd: 00:54)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `0${mins}:${secs < 10 ? `0${secs}` : secs}`;
    };

    // Hàm xử lý khi gõ vào ô OTP
    const handleChange = (index, e) => {
        const value = e.target.value;
        // Chỉ cho phép nhập số
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Lấy ký tự cuối cùng (đề phòng user paste nhiều số)
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Tự động focus sang ô tiếp theo nếu có dữ liệu
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Hàm xử lý phím Backspace để lùi ô
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Hàm Submit gửi lên API
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Ghép 6 ô lại thành 1 chuỗi
        const otpString = otp.join('');

        if (otpString.length < 6) {
            return setError('Please enter all 6 digits. (Vui lòng nhập đủ 6 số)');
        }

        if (!email) {
            return setError('Please provide an email to verify. (Vui lòng nhập email)');
        }

        setIsLoading(true);

        try {
            // Gọi API xác thực
            await AuthService.verifyOtp(email, otpString);

            setSuccess('Verification successful! Redirecting...');

            // Chuyển hướng sang trang login sau 2 giây
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm xử lý khi bấm nút "Resend code"
    const handleResend = async () => {
        if (!email) {
            return setError('Vui lòng nhập email trước khi yêu cầu gửi lại mã.');
        }

        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // 1. Gọi API yêu cầu gửi lại OTP
            await AuthService.readOnly(email);

            // 2. Thông báo thành công
            setSuccess('Mã OTP mới đã được gửi đến email của bạn!');

            // 3. Reset lại bộ đếm thời gian
            setCountdown(300);

            // 4. Reset các ô input OTP cho trống lại
            setOtp(['', '', '', '', '', '']);
            if (inputRefs.current[0]) inputRefs.current[0].focus();

        } catch (err) {
            setError(err.message || 'Lỗi khi gửi lại OTP. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="verify-page">
            <main className="verify-main">
                <div className="verify-card">
                    {/* Left Side: Editorial Image/Brand Moment */}
                    <div className="verify-sidebar">
                        <img
                            className="verify-image"
                            data-alt="Modern minimalist student apartment with a large window, warm morning sunlight, and a cozy study nook with books"
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop"
                            alt="Sanctuary"
                        />
                        <div className="sidebar-overlay"></div>
                        <div className="sidebar-text-container">
                            <h1 className="sidebar-title">Securing your new lifestyle.</h1>
                            <p className="sidebar-desc">We're verifying your identity to ensure The Curated Sanctuary remains a safe space for our student community.</p>
                        </div>
                    </div>

                    {/* Right Side: OTP Verification Form */}
                    <div className="verify-form-container">
                        {/* Brand Anchor (Identity Check) */}
                        <div className="brand-header">
                            <div className="brand-title">The Curated Sanctuary</div>
                            <div className="brand-divider"></div>
                        </div>

                        {/* Instructions */}
                        <div className="instructions">
                            <h2 className="instructions-title">Check your inbox</h2>
                            <p className="instructions-text">
                                We've sent a 6-digit verification code to your email. The code will expire in 10 minutes.
                            </p>
                        </div>

                        {/* Thông báo lỗi / thành công */}
                        {error && (
                            <div style={{ color: '#dc3545', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ color: '#198754', backgroundColor: '#d1e7dd', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
                                {success}
                            </div>
                        )}

                        <form className="verify-form" onSubmit={handleVerify}>

                            {/* 3. THÊM Ô NHẬP EMAIL: Nếu có email truyền sang thì readOnly, nếu trống thì cho gõ tay */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email to verify"
                                    required
                                    readOnly={!!location.state?.email} // Khóa ô này nếu email được tự động truyền sang
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #d1d5db',
                                        backgroundColor: location.state?.email ? '#f3f4f6' : '#fff', // Màu xám nếu bị khóa
                                        outline: 'none',
                                        fontSize: '15px'
                                    }}
                                />
                            </div>

                            {/* OTP Input Grid */}
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                                Verification Code
                            </label>
                            <div className="otp-container">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        className="otp-input"
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleChange(index, e)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        required
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="actions-container" style={{ marginTop: '30px' }}>
                                <button
                                    className="btn-submit"
                                    type="submit"
                                    disabled={isLoading}
                                    style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Account'}
                                </button>

                                <div className="resend-container">
                                    <button
                                        className="btn-resend"
                                        type="button"
                                        onClick={handleResend}
                                        disabled={countdown > 0 || isLoading}
                                        style={{ opacity: countdown > 0 ? 0.5 : 1, cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
                                    >
                                        <span className="material-symbols-outlined icon-small">refresh</span>
                                        <span>Resend code</span>
                                    </button>
                                    <div className="timer-badge">
                                        {countdown > 0 && <span className="pulse-dot"></span>}
                                        Request new code in <span className="timer-text">{formatTime(countdown)}</span>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Help Link */}
                        <div className="help-section">
                            <p className="help-text">
                                <span className="material-symbols-outlined icon-small">help</span>
                                Having trouble? <Link className="help-link" to="/contact">Contact Student Support</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer-container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-title">The Curated Sanctuary</span>
                        <p className="footer-copyright">© 2024 The Curated Sanctuary. Editorial Student Living.</p>
                    </div>
                    <div className="footer-links">
                        <a className="footer-link" href="#!">Privacy Policy</a>
                        <a className="footer-link" href="#!">Terms of Service</a>
                        <a className="footer-link" href="#!">Help Center</a>
                        <a className="footer-link" href="#!">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}