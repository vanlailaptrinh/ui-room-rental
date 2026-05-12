import React, { useState, useEffect } from 'react';
import packageService from '../../services/packageService';
import orderService from "../../services/orderService";
import paymentService from "../../services/paymentService"
import './Pricing.css';

function PricingPage() {
    const [packages, setPackages] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedPkg, setSelectedPkg] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [activeTab, setActiveTab] = useState('POSTING');
    const [activeFaq, setActiveFaq] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [pkgRes, voucherRes] = await Promise.all([
                    packageService.getPackages(),
                    packageService.getActiveVouchers()
                ]);

                if (pkgRes.code === 200) {
                    setPackages(pkgRes.data || []);
                }

                if (voucherRes && voucherRes.code === 200) {
                    // ĐẢM BẢO data TRẢ VỀ LÀ MẢNG
                    setVouchers(voucherRes.data || []);
                }
            } catch (err) {
                console.error("Lỗi fetch data:", err);
                setError("Không thể kết nối đến hệ thống.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSelectPlan = (pkg) => {
        setSelectedPkg(pkg);
        setSelectedVoucher(null);
        setShowModal(true);
    };

    const calculateFinalPrice = () => {
        if (!selectedPkg) return 0;
        let price = selectedPkg.price || 0;

        if (selectedVoucher) {
            // Tính số tiền giảm dựa trên %
            let discount = (price * (selectedVoucher.discountPercentage || 0)) / 100;

            // Nếu số tiền giảm vượt quá mức tối đa cho phép
            if (selectedVoucher.maxDiscountAmount && discount > selectedVoucher.maxDiscountAmount) {
                discount = selectedVoucher.maxDiscountAmount;
            }

            price = Math.max(0, price - discount);
        }
        return price;
    };

    const displayPackages = packages.filter(pkg => pkg.type?.value === activeTab);
    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const finalPrice = calculateFinalPrice();
            const orderPayload = {
                packageId: selectedPkg.id,
                voucherId: selectedVoucher ? selectedVoucher.id : null,
                totalPrice: finalPrice
            };

            const orderRes = await orderService.createOrder(orderPayload);
            const orderId = orderRes?.data?.id || orderRes?.id;

            if (orderId) {
                const resData = await paymentService.createPaymentUrl(orderId);

                if (resData && resData.code === 200) {
                    window.location.href = resData.data;
                } else {
                    alert(resData.message || 'Không lấy được URL thanh toán');
                }
            } else {
                alert(orderRes?.message || 'Khởi tạo đơn hàng thất bại, vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            alert(error.response?.data?.message || "Có lỗi xảy ra tại hệ thống thanh toán");
        } finally {
            setLoading(false);
        }
    };

    const faqs = [
        { q: "Tôi có thể thanh toán bằng những hình thức nào?", a: "Chúng hỗ trợ MoMo, VNPay, Chuyển khoản ngân hàng..." },
        { q: "Tin đăng của tôi sẽ hiển thị trong bao lâu?", a: "Tùy thuộc vào gói bạn chọn (5, 10, 15 hoặc 30 ngày)." }
    ];

    if (loading) return <div className="nexus-pricing-loading">Đang tải bảng giá...</div>;
    if (error) return <div className="nexus-pricing-error">{error}</div>;
    return (
        <main className="nexus-pricing-container">
            {showModal && selectedPkg && (
                <div className="nexus-modal-overlay">
                    <div className="nexus-confirm-modal">
                        <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>

                        <h2>Xác nhận gói dịch vụ</h2>

                        <div className="modal-pkg-info">
                            <div className="info-row">
                                <span>Gói đã chọn:</span>
                                <strong>{selectedPkg.name} ({selectedPkg.tier?.value})</strong>
                            </div>
                            <div className="info-row">
                                <span>Thời gian:</span>
                                <strong>{selectedPkg.activeDays} ngày</strong>
                            </div>
                            <div className="info-row">
                                <span>Giá gốc:</span>
                                <strong>{selectedPkg.price?.toLocaleString()}đ</strong>
                            </div>
                        </div>

                        <div className="voucher-section">
                            <h4>Chọn Voucher giảm giá</h4>
                            <select
                                className="voucher-select"
                                value={selectedVoucher?.id || ""}
                                onChange={(e) => {
                                    const v = vouchers.find(v => v.id === e.target.value);
                                    setSelectedVoucher(v || null);
                                }}
                            >
                                <option value="">-- Không sử dụng voucher --</option>
                                {vouchers && vouchers.length > 0 ? (
                                    vouchers.map(v => (
                                        <option key={v.id} value={v.id}>
                                            Mã: ...{v.id.slice(-6).toUpperCase()} (Giảm {v.discountPercentage}% - Tối đa {v.maxDiscountAmount?.toLocaleString()}đ)
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Không có mã giảm giá nào khả dụng</option>
                                )}
                            </select>
                        </div>

                        <div className="total-payment">
                            <div className="total-row">
                                <span>Số tiền được giảm:</span>
                                <span className="discount-text">
            {/* Tính toán hiển thị số tiền giảm thực tế */}
                                    -{selectedPkg && selectedVoucher
                                    ? Math.min((selectedPkg.price * selectedVoucher.discountPercentage) / 100, selectedVoucher.maxDiscountAmount).toLocaleString()
                                    : 0}đ
        </span>
                            </div>
                            <div className="total-row final">
                                <span>Tổng thanh toán:</span>
                                <span className="final-price">{calculateFinalPrice().toLocaleString()}đ</span>
                            </div>
                        </div>

                        <button className="btn-confirm-payment" onClick={handlePayment}>
                            Thanh toán ngay
                        </button>
                    </div>
                </div>
            )}
            {/* Hero & Toggle Section */}
            <header className="nexus-pricing-header">
                <h1>Bảng giá dịch vụ</h1>
                <p>Kết nối trực tiếp từ hệ thống Nexus Living.</p>

                <div className="nexus-pricing-toggle-wrapper">
                    <button
                        className={`nexus-pricing-toggle-btn ${activeTab === 'POSTING' ? 'active' : ''}`}
                        onClick={() => setActiveTab('POSTING')}
                    >
                        Đăng tin
                    </button>
                    <button
                        className={`nexus-pricing-toggle-btn ${activeTab === 'BOOSTING' ? 'active' : ''}`}
                        onClick={() => setActiveTab('BOOSTING')}
                    >
                        Đẩy tin
                    </button>
                </div>
            </header>

            <div className="nexus-pricing-grid">
                {displayPackages.map((pkg) => {
                    const isPro = pkg.tier.value === 'PRO';
                    return (
                        <div key={pkg.id} className={`nexus-pricing-card ${isPro ? 'nexus-pricing-pro-card' : ''}`}>
                            {isPro && <div className="nexus-pricing-popular-badge">Chuyên nghiệp</div>}

                            <div className="nexus-pricing-card-header">
                                <h3>{pkg.name} {isPro ? 'PRO' : 'Cơ bản'}</h3>
                                <p>{isPro ? 'Tối ưu hiệu quả hiển thị.' : 'Phù hợp với nhu cầu cơ bản.'}</p>
                            </div>

                            <div className="nexus-pricing-card-price-box">
                                <div className="nexus-pricing-price">{pkg.price.toLocaleString('vi-VN')}đ</div>
                                <div className="nexus-pricing-period">/{pkg.activeDays} ngày</div>
                            </div>

                            <ul className="nexus-pricing-card-features">
                                <li>
                                    <span className="material-symbols-outlined nexus-pricing-icon-success">check_circle</span>
                                    Giới hạn: <strong>{pkg.limitQuota} tin</strong>
                                </li>
                                <li>
                                    <span className="material-symbols-outlined nexus-pricing-icon-success">check_circle</span>
                                    Hiển thị: <strong>{pkg.activeDays} ngày</strong>
                                </li>
                                {/*{isPro ? (*/}
                                {/*    <>*/}
                                {/*        <li><span className="material-symbols-outlined nexus-pricing-icon-success">check_circle</span> Huy hiệu xác minh</li>*/}
                                {/*        <li><span className="material-symbols-outlined nexus-pricing-icon-success">check_circle</span> Ưu tiên tìm kiếm</li>*/}
                                {/*    </>*/}
                                {/*) : (*/}
                                {/*    <>*/}
                                {/*        <li className="nexus-pricing-disabled"><span className="material-symbols-outlined">cancel</span> Huy hiệu xác minh</li>*/}
                                {/*        <li className="nexus-pricing-disabled"><span className="material-symbols-outlined">cancel</span> Ưu tiên tìm kiếm</li>*/}
                                {/*    </>*/}
                                {/*)}*/}
                            </ul>

                            <button
                                className={isPro ? 'nexus-pricing-btn-primary' : 'nexus-pricing-btn-outline'}
                                onClick={() => handleSelectPlan(pkg)}
                            >
                                Chọn gói này
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Trust Section */}
            <section className="nexus-pricing-trust-section">
                <div className="nexus-pricing-trust-main">
                    <img className="nexus-pricing-trust-bg" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="background" />
                    <div className="nexus-pricing-trust-content">
                        <h2>Tại sao chọn Nexus Living?</h2>
                        <p>Chúng tôi không chỉ cung cấp nền tảng đăng tin, chúng tôi xây dựng cầu nối tin cậy giữa sinh viên và chủ nhà với hơn 500,000 người dùng hàng tháng.</p>
                        <div className="nexus-pricing-tags">
                            <span>#1 Student Choice</span>
                            <span>Dữ liệu minh bạch</span>
                        </div>
                    </div>
                </div>
                <div className="nexus-pricing-trust-stats">
                    <div className="nexus-pricing-stat-item">
                        <div className="nexus-pricing-icon-circle"><span className="material-symbols-outlined">verified_user</span></div>
                        <div>
                            <strong>98% Xác minh</strong>
                            <p>Tài khoản được kiểm duyệt</p>
                        </div>
                    </div>
                    <div className="nexus-pricing-stat-item">
                        <div className="nexus-pricing-icon-circle"><span className="material-symbols-outlined">speed</span></div>
                        <div>
                            <strong>7 Ngày trung bình</strong>
                            <p>Để tìm được khách thuê</p>
                        </div>
                    </div>
                    <div className="nexus-pricing-stat-item">
                        <div className="nexus-pricing-icon-circle"><span className="material-symbols-outlined">payments</span></div>
                        <div>
                            <strong>Hoàn tiền 100%</strong>
                            <p>Nếu tin bị lỗi hệ thống</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="nexus-pricing-faq-section">
                <h2>Câu hỏi thường gặp</h2>
                <div className="nexus-pricing-faq-list">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`nexus-pricing-faq-item ${activeFaq === index ? 'open' : ''}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <div className="nexus-pricing-faq-question">
                                <h4>{faq.q}</h4>
                                <span className="material-symbols-outlined">
                                    {activeFaq === index ? 'remove' : 'add'}
                                </span>
                            </div>
                            <div className="nexus-pricing-faq-answer">
                                <p>{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

export default PricingPage;