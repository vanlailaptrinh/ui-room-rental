import React from 'react';
import '../../pages/Packet/Packet.css'

function PacketCard({ pkg, onSelect }) {
    // Kiểm tra xem có phải gói PRO không
    const isPro = pkg.tier?.value === 'PRO';

    return (
        <div className={`nexus-pricing-card ${isPro ? 'nexus-pricing-pro-card' : ''}`}>
            {isPro && <div className="nexus-pricing-popular-badge">Chuyên nghiệp</div>}

            <div className="nexus-pricing-card-header">
                <h3>{pkg.name} {isPro ? 'PRO' : 'Cơ bản'}</h3>
                <p>{isPro ? 'Tối ưu hiệu quả hiển thị.' : 'Phù hợp với nhu cầu cơ bản.'}</p>
            </div>

            <div className="nexus-pricing-card-price-box">
                <div className="nexus-pricing-price">{pkg.price?.toLocaleString('vi-VN')}đ</div>
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
            </ul>

            <button
                className={isPro ? 'nexus-pricing-btn-primary' : 'nexus-pricing-btn-outline'}
                onClick={() => onSelect(pkg)}
            >
                Chọn gói này
            </button>
        </div>
    );
}

export default PacketCard;