import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../../services/authService';
import { useAuth } from '../../context/authContext';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin } from '@react-oauth/google';
import config from '../../config';
import './Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { login, loginWithGoogle } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Hàm điều hướng dùng chung sau khi Token xử lý thành công
    const handleRedirectByRole = (accessToken) => {
        const decoded = jwtDecode(accessToken);
        const role = decoded.role;

        switch (role) {
            case 'ADMIN':
                navigate(config.routes.adminDashboard);
                break;
            case 'LANDLORD':
                navigate(config.routes.landlordDashboard);
                break;
            default:
                navigate(config.routes.home);
        }
    };

    // Luồng xử lý Đăng nhập thường
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const responseData = await AuthService.login(username, password);
            const authInfo = responseData.data;
            if (!authInfo || !authInfo.accessToken) {
                throw new Error('Không nhận được token từ server');
            }
            await login(authInfo);
            handleRedirectByRole(authInfo.accessToken);
        } catch (err) {
            const errorMessage = err.message || '';
            if (errorMessage.toLowerCase().includes('xác thực') || errorMessage.toLowerCase().includes('verified')) {
                navigate(config.routes.verify, { state: { email: username } });
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
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                setIsLoading(true);
                                setError('');
                                try {
                                    const idTokenFromGoogle = credentialResponse.credential; 
                                    const authInfo = await loginWithGoogle(idTokenFromGoogle);
                                    handleRedirectByRole(authInfo.accessToken);
                                } catch (err) {
                                    setError(err.message || 'Đăng nhập bằng Google thất bại!');
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                            onError={() => {
                                console.error('Google Sign In Failed');
                                setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
                            }}
                            theme="outline"
                            size="large"
                            text="signin_with"
                            shape="rectangular"
                            width="100%"
                        />
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
                </div>
            </section>
        </main>
    );
}