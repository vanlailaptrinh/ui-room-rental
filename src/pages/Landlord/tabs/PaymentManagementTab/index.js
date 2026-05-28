import React, { useState, useEffect, useMemo } from 'react';
import PackageService from '../../../../services/packageService';
import VoucherService from '../../../../services/voucherService';
import InventoryService from '../../../../services/inventoryService';
import OrderService from '../../../../services/orderService';
import PaymentService from '../../../../services/paymentService';
import PacketCard from '../../../../components/PacketCard';
import LandlordFilterBar from '../../components/LandlordFilterBar';
import './PaymentManagementTab.css'

const PaymentManagementTab = ({ activeTab }) => {
    const [subTab, setSubTab] = useState('current');
    const [packages, setPackages] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [myInventories, setMyInventories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingCurrentPkg, setLoadingCurrentPkg] = useState(false);
    const [error, setError] = useState(null);

    const [selectedPkg, setSelectedPkg] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Thêm các bộ lọc dành riêng cho danh sách "Gói của tôi"
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Cấu hình danh sách phân loại Loại gói dịch vụ (Tận dụng prop statusOptions của FilterBar)
    const statusOptions = [
        { value: 'ALL', label: 'Tất cả dịch vụ' },
        { value: 'POSTING', label: '📝 Gói đăng tin' },
        { value: 'BOOSTING', label: '🚀 Gói đẩy tin' },
    ];

    useEffect(() => {
        if (activeTab !== 'payments') return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [pkgRes, voucherRes] = await Promise.all([
                    PackageService.getPackages(),
                    VoucherService.getActiveVouchers()
                ]);
                if (pkgRes?.code === 200) setPackages(pkgRes.data || []);
                if (voucherRes?.code === 200) setVouchers(voucherRes.data || []);
            } catch (err) {
                setError("Không thể kết nối đến hệ thống.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    useEffect(() => {
        if (subTab === 'current') {
            setLoadingCurrentPkg(true);
            InventoryService.getMyInventories().then(res => {
                if (res?.code === 200) setMyInventories(res.data);
            }).finally(() => {
                setLoadingCurrentPkg(false);
            });
        }
    }, [subTab]);

    const handleSelectPacket = (pkg) => {
        setSelectedPkg(pkg);
        setSelectedVoucher(null);
        setShowModal(true);
    };

    const calculateFinalPrice = () => {
        if (!selectedPkg) return 0;
        let price = selectedPkg.price || 0;
        if (selectedVoucher) {
            let discount = (price * (selectedVoucher.discountPercentage || 0)) / 100;
            if (selectedVoucher.maxDiscountAmount && discount > selectedVoucher.maxDiscountAmount) {
                discount = selectedVoucher.maxDiscountAmount;
            }
            price = Math.max(0, price - discount);
        }
        return price;
    };

    const handlePayment = async () => {
        setLoading(true);
        try {
            const orderRes = await OrderService.createOrder({
                packageId: selectedPkg.id,
                voucherId: selectedVoucher?.id,
                totalPrice: calculateFinalPrice()
            });
            const orderId = orderRes?.data?.id || orderRes?.id;
            if (orderId) {
                const resData = await PaymentService.createPaymentUrl(orderId);
                if (resData?.code === 200) window.location.href = resData.data;
                else alert(resData.message || 'Lỗi URL thanh toán');
            } else alert('Khởi tạo đơn hàng thất bại!');
        } catch (error) {
            alert("Lỗi hệ thống thanh toán");
        } finally {
            setLoading(false);
        }
    };

    const postPackages = packages.filter(pkg => pkg.type?.value === 'POSTING');
    const pushPackages = packages.filter(pkg => pkg.type?.value === 'BOOSTING');

    // Kết hợp và tính toán danh sách gói gốc
    const myActivePackages = useMemo(() => {
        return myInventories.map(inv => {
            const pkgDetails = packages.find(p => p.type?.value === inv.type && p.tier?.value === inv.tier);
            return {
                ...pkgDetails,
                inventoryType: inv.type,
                inventoryTier: inv.tier,
                balance: inv.balance
            };
        }).filter(pkg => pkg.id);
    }, [myInventories, packages]);

    // Xử lý Lọc tìm kiếm động gói dịch vụ đang sở hữu
    const filteredMyPackages = useMemo(() => {
        return myActivePackages.filter((pkg) => {
            const matchStatus = filterStatus === 'ALL' || pkg.inventoryType === filterStatus;

            const name = (pkg.name || '').toLowerCase();
            const keyword = searchTerm.toLowerCase().trim();
            const matchKeyword = name.includes(keyword);

            return matchStatus && matchKeyword;
        });
    }, [myActivePackages, filterStatus, searchTerm]);

    return (
        <div className="landlord-fade-in landlord-payment-wrapper">
            {/* Modal thanh toán giữ nguyên */}
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

            <div className="landlord-custom-subtabs">
                <button
                    className={subTab === 'current' ? 'active' : ''}
                    onClick={() => setSubTab('current')}
                >
                    Gói của tôi
                </button>
                <button
                    className={subTab === 'buy' ? 'active' : ''}
                    onClick={() => setSubTab('buy')}
                >
                    Mua gói mới
                </button>
            </div>

            {subTab === 'current' ? (
                <div className="landlord-active-card inventory-unified-form">
                    <div className="landlord-card-header unified-form-header">
                        <div className="header-left">
                            <h3>Gói đang hoạt động</h3>
                            {myActivePackages.length > 0 && (
                                <span className="landlord-ld-count-badge">
                                    {filteredMyPackages.length} gói
                                </span>
                            )}
                        </div>
                        {myActivePackages.length > 0 && (
                            <span className="status-badge-active">● Đang chạy</span>
                        )}
                    </div>

                    {/* Khối thanh bộ lọc nhúng phẳng đồng bộ */}
                    {myActivePackages.length > 0 && (
                        <div className="unified-filter-wrapper">
                            <LandlordFilterBar
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                searchPlaceholder="🔍 Tìm kiếm theo tên gói dịch vụ..."
                                filterStatus={filterStatus}
                                setFilterStatus={setFilterStatus}
                                statusOptions={statusOptions}
                                sortBy="" /* Bỏ qua sắp xếp ở tab này */
                                sortOptions={[]}
                            />
                        </div>
                    )}

                    <div className="unified-list-container">
                        {loadingCurrentPkg ? (
                            <div className="inventory-loading-box">
                                <div className="landlord-ld-spinner" />
                                <p className="loading-text">Đang tải thông tin kho gói dịch vụ...</p>
                            </div>
                        ) : filteredMyPackages.length > 0 ? (
                            <div className="inventory-packages-list">
                                {filteredMyPackages.map((pkg, index) => (
                                    <div key={index} className={`landlord-current-pkg-item landlord-current-pkg-box type-${pkg.inventoryType?.toLowerCase()}`}>
                                        <div className="pkg-info">
                                            <h4 className="pkg-title-row">
                                                {pkg.inventoryType === 'POSTING' ? '📝' : '🚀'} {pkg.name || 'Gói dịch vụ'}
                                                {pkg.inventoryTier && (
                                                    <span className={`tier-badge ${pkg.inventoryTier?.toLowerCase()}`}>
                                                        {pkg.inventoryTier}
                                                    </span>
                                                )}
                                            </h4>

                                            <div className="info-stats-grid">
                                                <div className="stat-card-item">
                                                    <span>📅 Hạn tồn tại bài đăng</span>
                                                    <strong>{pkg.activeDays} ngày/ lượt</strong>
                                                </div>
                                                <div className="stat-card-item highlight-balance">
                                                    <span>📊 Lượt khả dụng còn lại</span>
                                                    <strong>{pkg.balance !== null ? pkg.balance : 0} lượt</strong>
                                                </div>
                                                <div className="stat-card-item">
                                                    <span>🏷️ Phân loại dịch vụ</span>
                                                    <strong>
                                                        {pkg.inventoryType === 'POSTING' ? 'Gói đăng tin' : pkg.inventoryType === 'BOOSTING' ? 'Gói đẩy tin' : pkg.inventoryType}
                                                    </strong>
                                                </div>
                                                <div className="stat-card-item">
                                                    <span>💰 Giá trị mua gốc</span>
                                                    <strong>{pkg.price?.toLocaleString()}đ</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="landlord-empty-pkg-state">
                                <div className="icon">📦</div>
                                <p>
                                    {myActivePackages.length === 0
                                        ? "Bạn hiện chưa có gói dịch vụ nào trong kho lưu trữ."
                                        : "Không tìm thấy gói dịch vụ nào khớp với bộ lọc."}
                                </p>
                                {myActivePackages.length === 0 && (
                                    <button className="btn-buy-now-trigger" onClick={() => setSubTab('buy')}>
                                        Mua gói dịch vụ ngay
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="landlord-pricing-container">
                    <div className="landlord-pricing-header">
                        <h2>Bảng giá dịch vụ hệ thống</h2>
                        <p>Lựa chọn gói dịch vụ phù hợp để tối ưu hiệu quả hiển thị phòng trọ</p>
                    </div>

                    <div className="landlord-pricing-section">
                        {postPackages.length > 0 && (
                            <>
                                <h3 className="pricing-section-title">Gói đăng tin</h3>
                                <div className="landlord-pricing-grid">
                                    {postPackages.map((pkg) => (
                                        <PacketCard key={pkg.id} pkg={pkg} onSelect={handleSelectPacket} />
                                    ))}
                                </div>
                            </>
                        )}

                        {pushPackages.length > 0 && (
                            <>
                                <h3 className="pricing-section-title pricing-section-title boost">Gói đẩy tin</h3>
                                <div className="landlord-pricing-grid">
                                    {pushPackages.map((pkg) => (
                                        <PacketCard key={pkg.id} pkg={pkg} onSelect={handleSelectPacket} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagementTab;