import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentService from '../../services/paymentService';
import './PaymentCallback.css';

const PaymentCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Đang xác thực giao dịch...');
    const isCalled = useRef(false);

    useEffect(() => {
        const verify = async () => {
            const queryParams = Object.fromEntries(new URLSearchParams(location.search));
            if (!queryParams.vnp_ResponseCode) {
                setStatus('error');
                return;
            }

            if (isCalled.current) return;
            isCalled.current = true;

            try {
                const response = await PaymentService.verifyPayment(queryParams);
                if (response.code === 200 && response.data === true) {
                    setStatus('success');
                    setMessage(response.message);
                } else {
                    setStatus('error');
                    setMessage(response.message);
                }
            } catch (error) {
                setStatus('error');
                setMessage('Lỗi kết nối hệ thống.');
            }
        };
        verify();
    }, [location]);

    return (
        <div className="payment-callback-wrapper">
            <div className="payment-callback-card">
                {status === 'processing' && (
                    <>
                        <div className="payment-callback-spinner"></div>
                        <h2 className="payment-callback-title">Đang xác thực</h2>
                        <p className="payment-callback-desc">Hệ thống đang kiểm tra kết quả giao dịch từ VNPay...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <span className="payment-callback-icon payment-callback-icon-success">✔</span>
                        <h2 className="payment-callback-title">Thành công!</h2>
                        <p className="payment-callback-desc">{message}</p>
                        <div className="payment-callback-btn-group">
                            <button className="payment-callback-btn payment-callback-btn-primary"
                                    onClick={() => navigate('/manage-orders')}>
                                Đơn hàng của tôi
                            </button>
                            <button className="payment-callback-btn payment-callback-btn-outline"
                                    onClick={() => navigate('/')}>
                                Trang chủ
                            </button>
                        </div>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <span className="payment-callback-icon payment-callback-icon-error">✘</span>
                        <h2 className="payment-callback-title">Thanh toán thất bại</h2>
                        <p className="payment-callback-desc">{message}</p>
                        <div className="payment-callback-btn-group">
                            <button className="payment-callback-btn payment-callback-btn-primary"
                                    onClick={() => navigate('/pricing')}>
                                Thử lại
                            </button>
                            <button className="payment-callback-btn payment-callback-btn-outline"
                                    onClick={() => navigate('/')}>
                                Trang chủ
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;