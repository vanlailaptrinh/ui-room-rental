import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../../services/authService';
import './Register.css';

export default function Register() {
    const navigate = useNavigate();

    // State quản lý role (Chuyển đổi: 'student' -> 'USER', 'landlord' -> 'HOST' khi gọi API)
    const [role, setRole] = useState('student');

    // State quản lý dữ liệu form
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        university: '',
        password: '',
        confirmPassword: ''
    });

    // State quản lý trạng thái xử lý
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Hàm cập nhật state khi gõ input
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

        // 1. Validate: Kiểm tra mật khẩu xác nhận
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match! (Mật khẩu không khớp)');
        }

        setIsLoading(true);

        try {
            // 2. Chuẩn bị dữ liệu gửi lên Backend (Khớp với Postman của bạn)
            const payload = {
                username: formData.fullName, // Dùng Full Name làm username (hoặc bạn có thể tạo ô nhập username riêng)
                email: formData.email,
                password: formData.password,
                role: role === 'student' ? 'USER' : 'HOST' // Chuyển đổi role cho đúng chuẩn Backend
            };

            // 3. Gọi API
            const data = await registerApi(payload);

            setSuccess('Registration successful! Redirecting to login...'); // Đăng ký thành công

            // 4. Đợi 2 giây để người dùng đọc thông báo rồi chuyển về trang Login
            setTimeout(() => {
                navigate('/verify');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Registration failed. Please try again!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <main className="register-main">
                {/* Cột trái: Giá trị cốt lõi & Thương hiệu */}
                <section className="register-sidebar">
                    <div className="sidebar-bg-wrapper">
                        <img
                            className="sidebar-bg-image"
                            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                            alt="Luxury Student Living Room"
                        />
                        <div className="sidebar-gradient-overlay"></div>
                    </div>

                    <div className="sidebar-content">
                        <div className="sidebar-brand">
                            <span className="brand-icon">
                                <span className="material-symbols-outlined">domain</span>
                            </span>
                            <span className="brand-text">The Curated Sanctuary</span>
                        </div>

                        <div className="sidebar-hero">
                            <h1 className="hero-title">Elevate Your Living Experience.</h1>
                            <p className="hero-desc">Join an exclusive community of students and premium landlords dedicated to refined living and academic excellence.</p>

                            <div className="feature-cards">
                                <div className="glass-card">
                                    <span className="material-symbols-outlined card-icon">verified_user</span>
                                    <h3 className="card-title">Phòng đã xác thực</h3>
                                    <p className="card-desc">Mọi bất động sản đều được kiểm định chất lượng thủ công.</p>
                                </div>
                                <div className="glass-card">
                                    <span className="material-symbols-outlined card-icon">electric_bolt</span>
                                    <h3 className="card-title">Kết nối thông minh</h3>
                                    <p className="card-desc">Tìm kiếm phong cách sống phù hợp với mục tiêu của bạn.</p>
                                </div>
                            </div>
                        </div>

                        <div className="sidebar-social-proof">
                            <div className="avatar-group">
                                <div className="avatar dummy-avatar-1"></div>
                                <div className="avatar dummy-avatar-2"></div>
                            </div>
                            <span>Hơn 5,000+ sinh viên đã tham gia trong học kỳ này</span>
                        </div>
                    </div>
                </section>

                {/* Cột phải: Form đăng ký */}
                <section className="register-form-section">
                    <div className="form-wrapper">
                        <div className="form-header">
                            <h2 className="form-title">Tạo tài khoản mới</h2>
                            <p className="form-subtitle">Bắt đầu hành trình tìm kiếm không gian sống mơ ước ngay hôm nay.</p>
                        </div>

                        {/* HIỂN THỊ THÔNG BÁO LỖI / THÀNH CÔNG */}
                        {error && (
                            <div style={{ color: '#dc3545', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ color: '#198754', backgroundColor: '#d1e7dd', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>
                                {success}
                            </div>
                        )}

                        <form className="register-form" onSubmit={handleSubmit}>
                            {/* Lựa chọn vai trò người dùng */}
                            <div className="role-toggle">
                                <button
                                    type="button"
                                    className={`toggle-btn ${role === 'student' ? 'active' : ''}`}
                                    onClick={() => setRole('student')}
                                >
                                    Sinh viên
                                </button>
                                <button
                                    type="button"
                                    className={`toggle-btn ${role === 'landlord' ? 'active' : ''}`}
                                    onClick={() => setRole('landlord')}
                                >
                                    Chủ nhà
                                </button>
                            </div>

                            <div className="form-grid">
                                {/* Họ và Tên */}
                                <div className="input-group">
                                    <label className="input-label">Full Name</label>
                                    <input
                                        className="text-input"
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Alex Morgan"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="input-group">
                                    <label className="input-label">Email Address</label>
                                    <input
                                        className="text-input"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="alex@university.edu"
                                        required
                                    />
                                </div>

                                <div className="input-row">
                                    {/* Phone (Lưu ý: Nếu Backend chưa có trường Phone, dữ liệu này chỉ hiển thị trên UI) */}
                                    <div className="input-group">
                                        <label className="input-label">Phone</label>
                                        <input
                                            className="text-input"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    {/* University */}
                                    <div className="input-group">
                                        <label className="input-label">Trường đại học</label>
                                        <div className="select-wrapper">
                                            <select
                                                className="text-input select-input"
                                                name="university"
                                                value={formData.university}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="" disabled>Select University</option>
                                                <option value="oxford">Oxford University</option>
                                                <option value="stanford">Stanford University</option>
                                                <option value="mit">MIT</option>
                                                <option value="lse">LSE</option>
                                            </select>
                                            <span className="material-symbols-outlined select-icon">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mật khẩu */}
                                <div className="input-group">
                                    <label className="input-label">Password</label>
                                    <input
                                        className="text-input"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {/* Xác nhận mật khẩu */}
                                <div className="input-group">
                                    <label className="input-label">Confirm Password</label>
                                    <input
                                        className="text-input"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Điều khoản */}
                            <div className="checkbox-group">
                                <input type="checkbox" id="terms" className="checkbox-input" required />
                                <label htmlFor="terms" className="checkbox-label">
                                    Tôi đồng ý với các <a href="#!" className="link">Điều khoản dịch vụ</a> và <a href="#!" className="link">Chính sách bảo mật</a>.
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isLoading}
                                style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                            >
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>

                            <p className="login-prompt">
                                Bạn đã có tài khoản? <Link to="/login" className="link font-bold">Đăng nhập ngay</Link>
                            </p>
                        </form>
                    </div>
                </section>
            </main>

            {/* Chân trang */}
            <footer className="footer-container">
                {/* ... (Giữ nguyên) ... */}
            </footer>
        </div>
    );
}