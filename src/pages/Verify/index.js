import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthService from '../../services/authService';
import './Verify.css';

export default function Verify() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy email từ Register
    const email = location.state?.email || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const inputRefs = useRef([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // OTP hết hạn sau 5 phút
    const OTP_EXPIRE_TIME = 300;

    const [expireCountdown, setExpireCountdown] =
        useState(OTP_EXPIRE_TIME);

    // Nếu vào trực tiếp /verify
    useEffect(() => {
        if (!location.state?.email) {
            navigate('/register');
        }
    }, [location, navigate]);

    // Countdown OTP
    useEffect(() => {
        if (expireCountdown <= 0) {
            setError(
                'Mã OTP đã hết hạn. Vui lòng đăng ký lại.'
            );

            setOtp(['', '', '', '', '', '']);

            return;
        }

        const timer = setInterval(() => {
            setExpireCountdown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);

    }, [expireCountdown]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);

        const secs = seconds % 60;

        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // INPUT OTP
    const handleChange = (index, e) => {
        const value = e.target.value;

        if (isNaN(value)) return;

        const digit = value.slice(-1);

        const newOtp = [...otp];

        newOtp[index] = digit;

        setOtp(newOtp);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // BACKSPACE
    const handleKeyDown = (index, e) => {
        if (
            e.key === 'Backspace' &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // PASTE OTP
    const handlePaste = (e) => {
        e.preventDefault();

        const pasted = e.clipboardData
            .getData('text')
            .trim();

        const numbers = pasted.replace(/\D/g, '');

        if (numbers.length === 6) {

            const otpArray = numbers.split('');

            setOtp(otpArray);

            inputRefs.current[5]?.focus();
        }
    };

    // VERIFY
    const handleVerify = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        if (expireCountdown <= 0) {
            return setError(
                'Mã OTP đã hết hạn.'
            );
        }

        const otpString = otp.join('');

        if (otpString.length < 6) {
            return setError(
                'Vui lòng nhập đủ 6 số OTP.'
            );
        }

        setIsLoading(true);

        try {

            await AuthService.verifyOtp(
                email,
                otpString
            );

            setSuccess(
                'Xác thực thành công!'
            );

            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {

            setError(
                err.message ||
                'OTP không hợp lệ hoặc đã hết hạn.'
            );

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="verify-page">

            <main className="verify-main">

                <div className="verify-card">

                    {/* LEFT */}
                    <div className="verify-sidebar">

                        <img
                            className="verify-image"
                            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop"
                            alt="Verify"
                        />

                        <div className="sidebar-overlay"></div>

                        <div className="sidebar-text-container">

                            <h1 className="sidebar-title">
                                Xác thực tài khoản
                            </h1>

                            <p className="sidebar-desc">
                                Hoàn tất xác minh email
                                để kích hoạt tài khoản.
                            </p>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="verify-form-container">

                        {/* HEADER */}
                        <div className="brand-header">

                            <div className="brand-title">
                                The Curated Sanctuary
                            </div>

                            <div className="brand-divider"></div>

                        </div>

                        {/* TITLE */}
                        <div className="instructions">

                            <h2 className="instructions-title">
                                Nhập mã OTP
                            </h2>

                            <p className="instructions-text">
                                Mã OTP gồm 6 số đã được gửi tới
                            </p>

                            <p className="verify-email">
                                {email}
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
                            className="verify-form"
                            onSubmit={handleVerify}
                        >

                            {/* OTP */}
                            <div className="field-group">

                                <label>Mã OTP</label>

                                <div className="otp-container">

                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) =>
                                                (inputRefs.current[index] = el)
                                            }
                                            className="otp-input"
                                            type="text"
                                            maxLength="1"
                                            value={digit}
                                            onChange={(e) =>
                                                handleChange(index, e)
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(index, e)
                                            }
                                            onPaste={handlePaste}
                                            disabled={
                                                isLoading ||
                                                expireCountdown <= 0
                                            }
                                        />
                                    ))}

                                </div>

                            </div>

                            {/* BUTTON */}
                            <div className="actions-container">

                                <button
                                    className="btn-submit"
                                    type="submit"
                                    disabled={
                                        isLoading ||
                                        expireCountdown <= 0
                                    }
                                >
                                    {
                                        isLoading
                                            ? 'Đang xác thực...'
                                            : 'Xác thực tài khoản'
                                    }
                                </button>

                            </div>

                        </form>

                        {/* OTP EXPIRE */}
                        <div className="expire-box">

                            <span>
                                Mã OTP hết hạn sau
                            </span>

                            <span className="expire-time">
                                {formatTime(expireCountdown)}
                            </span>

                        </div>

                        {/* HELP */}
                        <div className="help-section">

                            <p className="help-text">

                                Cần hỗ trợ?

                                <Link
                                    className="help-link"
                                    to="/contact"
                                >
                                    Liên hệ
                                </Link>

                            </p>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}