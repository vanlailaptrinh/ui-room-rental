import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../../services/authService';
import { useAuth } from '../../context/authContext';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const responseData = await AuthService.login(username, password);
            console.log('Đăng nhập thành công:', responseData);
            const authInfo = responseData.data; 
            
            // Kiểm tra xem có nhận được token không
            if (!authInfo || !authInfo.accessToken) {
                throw new Error('Không nhận được token từ server');
            }
            login(authInfo);
            navigate("/");
        } catch (err) {
            const errorMessage = err.message || '';

            if (errorMessage.toLowerCase().includes('xác thực') || errorMessage.toLowerCase().includes('verified')) {
                navigate('/verify-otp', { state: { email: username } });
            } else {
                setError(errorMessage || 'Sai tài khoản hoặc mật khẩu!');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="login-container">
            {/* Left Side: Editorial Lifestyle Imagery */}
            <section className="login-sidebar">
                <img
                    alt="Student lifestyle"
                    className="sidebar-bg-image"
                    data-alt="Interior of a modern, sunlit student studio apartment"
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop"
                />
                <div className="sidebar-gradient-overlay"></div>

                {/* Branding Content */}
                <div className="sidebar-content">
                    <div className="brand-header">
                        <span className="brand-logo">The Editorial Marketplace</span>
                    </div>
                    <div className="brand-text">
                        <span className="badge">NEW STANDARD</span>
                        <h1 className="hero-title">Nơi bắt đầu hành trình sinh viên của bạn.</h1>
                        <p className="hero-description">Không chỉ là nơi ở, đây là cộng đồng được tuyển chọn dành riêng cho những người trẻ khao khát một không gian sống đầy cảm hứng.</p>
                    </div>
                    <div className="stats-container">
                        <div className="stat-item">
                            <span className="stat-number">2,500+</span>
                            <span className="stat-label">Phòng đã xác thực</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">150+</span>
                            <span className="stat-label">Chủ nhà uy tín</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Side: Login Form */}
            <section className="login-form-section">
                <div className="form-wrapper">
                    {/* Header */}
                    <div className="form-header">
                        <h2 className="title">Chào mừng trở lại</h2>
                        <p className="subtitle">Vui lòng đăng nhập để tiếp tục khám phá các lựa chọn tốt nhất.</p>
                    </div>

                    {/* Khu vực hiển thị thông báo lỗi */}
                    {error && (
                        <div style={{ color: '#dc3545', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* Credentials Form */}
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="input-label">Tên đăng nhập / Email</label>
                            <input
                                className="input-field"
                                placeholder="Nhập tên đăng nhập..."
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <div className="input-header">
                                <label className="input-label">Mật khẩu</label>
                                <Link className="forgot-link" to="/forgot-password">Quên mật khẩu?</Link>
                            </div>
                            <input
                                className="input-field"
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="checkbox-group">
                            <input className="checkbox-input" id="remember" type="checkbox" />
                            <label className="checkbox-label" htmlFor="remember">Ghi nhớ đăng nhập</label>
                        </div>

                        {/* Nút đăng nhập */}
                        <button
                            className="btn-submit"
                            type="submit"
                            disabled={isLoading}
                            style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="divider-container">
                        <div className="divider-line-wrapper">
                            <div className="divider-line"></div>
                        </div>
                        <span className="divider-text">Hoặc bằng tài khoản</span>
                    </div>

                                        {/* Social Logins */}
                    <div className="social-logins">
                        <button type="button" className="btn-social">
                            <svg className="social-icon" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            Google
                        </button>
                    </div>

                    <div className="form-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <p className="footer-text">
                            Chưa xác thực tài khoản?
                            <Link className="register-link" to="/verify" style={{ marginLeft: '5px' }}>Xác thực ngay</Link>
                        </p>
                        <p className="footer-text">
                            Chưa có tài khoản?
                            <Link className="register-link" to="/register" style={{ marginLeft: '5px' }}>Đăng ký</Link>
                        </p>
                    </div>

                    {/* Trust Badge */}
                    <div className="trust-badges" style={{ marginTop: '30px' }}>
                        <div className="badge-item">
                            <span className="material-symbols-outlined badge-icon">verified_user</span>
                            <span className="badge-text">Secure Login</span>
                        </div>
                        <div className="badge-item">
                            <span className="material-symbols-outlined badge-icon">encrypted</span>
                            <span className="badge-text">SSL Encrypted</span>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}