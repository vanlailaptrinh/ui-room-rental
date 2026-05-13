import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import './Register.css';

export default function Register() {
    const navigate = useNavigate();
    const [role, setRole] = useState('USER');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (formData.password !== formData.confirmPassword) {
            return setError('Mật khẩu xác nhận không khớp!');
        }
        setIsLoading(true);
        try {
            const payload = {
                username: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: role // USER hoặc LANDLORD
            };
            await AuthService.register(payload);
            setSuccess('Đăng ký thành công!');
            setTimeout(() => {
                navigate('/verify');
            }, 1500);
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            {/* LEFT SIDE */}
            <div className="register-left">
                <div className="overlay"></div>
                <div className="left-content">
                    {/* BRAND */}
                    <div className="brand">
                        <div className="brand-logo">
                            <span className="material-symbols-outlined">domain</span>
                        </div>
                        <h2>The Curated Sanctuary</h2>
                    </div>

                    {/* HERO */}
                    <div className="hero-content">
                        <h1> Nâng tầm trải nghiệm sống của bạn</h1>
                        <p>
                            Kết nối sinh viên với những không gian sống hiện đại,
                            an toàn và tiện nghi nhất.
                        </p>

                        {/* FEATURES */}
                        <div className="feature-list">
                            <div className="feature-card">
                                <span className="material-symbols-outlined">
                                    verified_user
                                </span>
                                <div>
                                    <h4>Phòng xác thực</h4>
                                    <p>Tất cả phòng đều được kiểm định chất lượng.</p>
                                </div>
                            </div>

                            <div className="feature-card">
                                <span className="material-symbols-outlined">
                                    bolt
                                </span>
                                <div>
                                    <h4>Kết nối nhanh</h4>
                                    <p>Tìm phòng phù hợp chỉ trong vài phút.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="register-right">
                <div className="form-container">
                    {/* HEADER */}
                    <div className="form-header">
                        <h2>Tạo tài khoản</h2>
                        <p>Bắt đầu hành trình của bạn ngay hôm nay.</p>
                    </div>
                    {/* ERROR */}
                    {error && (
                        <div className="alert error">{error}</div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="alert success">{success}</div>
                    )}

                    {/* FORM */}
                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >
                        {/* ROLE TOGGLE */}
                        <div className="role-toggle">
                            {/* USER */}
                            <button
                                type="button"
                                className={
                                    role === 'USER'
                                        ? 'active'
                                        : ''
                                }
                                onClick={() => setRole('USER')}
                            >
                                Sinh viên
                            </button>

                            {/* LANDLORD */}
                            <button
                                type="button"
                                className={
                                    role === 'LANDLORD'
                                        ? 'active'
                                        : ''
                                }
                                onClick={() => setRole('LANDLORD')}
                            >
                                Chủ trọ
                            </button>
                        </div>

                        {/* FULL NAME */}
                        <div className="input-group">
                            <label>Họ và tên</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Nguyễn Văn A"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* EMAIL */}
                        <div className="input-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="example@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* PHONE */}
                        <div className="input-group">
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="0123456789"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="input-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="input-group">
                            <label>Xác nhận mật khẩu</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* TERMS */}
                        <div className="checkbox-group">
                            <input type="checkbox" required/>
                            <span>
                                Tôi đồng ý với
                                <a href="#!">
                                    Điều khoản dịch vụ
                                </a>
                                và
                                <a href="#!">
                                    Chính sách bảo mật
                                </a>
                            </span>
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {
                                isLoading
                                    ? 'Đang xử lý...'
                                    : 'Tạo tài khoản'
                            }
                        </button>

                        {/* LOGIN */}
                        <p className="login-link">
                            Đã có tài khoản?
                            <Link to="/login">
                                Đăng nhập
                            </Link>
                        </p>

                    </form>
                </div>
            </div>
        </div>
    );
}