import React, { useEffect, useState } from 'react';
import OrderService from '../../../services/orderService';
import UserService from '../../../services/userService';
import PackageService from '../../../services/packageService';
import VoucherService from '../../../services/voucherService';
import FinanceService from '../../../services/financeService';
import './FinanceManagement.css';

const FinanceManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('MONTH');
  const [chartData, setChartData] = useState([]);
  
  // States cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [stats, setStats] = useState({
    totalRevenue: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0
  });

  useEffect(() => {
    fetchComprehensiveData();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [filterType]);

  const fetchChartData = async () => {
    try {
      let response;
      if (filterType === 'MONTH') {
        response = await FinanceService.getFinanceStatsByMonth();
      } else if (filterType === 'QUARTER') {
        response = await FinanceService.getFinanceStatsByQuarter();
      } else if (filterType === 'YEAR') {
        response = await FinanceService.getFinanceStatsByYear();
      }

      const rawData = response?.data || response || [];
      const maxRevenue = Math.max(...rawData.map(item => item.revenue), 0);

      const formattedChartData = rawData.map((item, index) => {
        const isActive = index === rawData.length - 1;
        const computedHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 90 + 10 : 10;

        return {
          label: item.label,
          height: computedHeight,
          tooltip: item.revenue >= 1000000 
            ? `${(item.revenue / 1000000).toFixed(1)}M` 
            : `${item.revenue.toLocaleString('vi-VN')}đ`,
          active: isActive
        };
      });

      setChartData(formattedChartData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu biểu đồ tài chính:", error);
    }
  };

  const fetchComprehensiveData = async () => {
    try {
      setLoading(true);
      const orderRes = await OrderService.getOrders();
      const rawOrders = orderRes.data || orderRes;

      const enrichedOrders = await Promise.all(
        rawOrders.map(async (order) => {
          let userDetail = null;
          let packageDetail = null;
          let voucherDetail = null;

          if (order.userId) {
            try {
              const uRes = await UserService.getUserById(order.userId);
              userDetail = uRes.data || uRes;
            } catch (e) { console.error("Lỗi lấy thông tin khách hàng:", e); }
          }

          if (order.packageId) {
            try {
              const pRes = await PackageService.getPackageById(order.packageId);
              packageDetail = pRes.data || pRes;
            } catch (e) { console.error("Lỗi lấy thông tin gói dịch vụ:", e); }
          }

          if (order.voucherId) {
            try {
              const vRes = await VoucherService.getVoucherById(order.voucherId);
              voucherDetail = vRes.data || vRes;
            } catch (e) { console.error("Lỗi lấy thông tin mã giảm giá:", e); }
          }

          return {
            ...order,
            user: userDetail,
            package: packageDetail,
            voucher: voucherDetail
          };
        })
      );

      let revenue = 0;
      let success = 0;
      let pending = 0;
      let failed = 0;

      enrichedOrders.forEach(o => {
        if (o.status === 'SUCCESS') {
          revenue += o.totalPrice || 0;
          success++;
        } else if (o.status === 'PENDING') {
          pending++;
        } else if (o.status === 'FAILED') {
          failed++;
        }
      });

      setOrders(enrichedOrders);
      setStats({ totalRevenue: revenue, successCount: success, pendingCount: pending, failedCount: failed });
    } catch (error) {
      console.error("Lỗi hệ thống khi tải dữ liệu tài chính:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic Xử lý Phân trang Ngắn gọn
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu tài chính hệ thống...</div>;
  }

  return (
      <div className="content-canvas">
        
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Quản lý Tài chính</h2>
            <p className="page-desc">Theo dõi dòng tiền thu được từ Landlord, phân tích tăng trưởng và kiểm soát giao dịch VNPay.</p>
          </div>
        </div>

        {/* Thống kê dạng Bento Grid */}
        <div className="health-grid">
          <div className="health-card">
            <div className="h-icon bg-green">
              <span className="material-symbols-outlined icon-filled">payments</span>
            </div>
            <div className="h-info">
              <p className="h-label">Tổng doanh thu thực tế</p>
              <p className="h-val">{stats.totalRevenue.toLocaleString('vi-VN')} đ</p>
            </div>
          </div>
          
          <div className="health-card">
            <div className="h-icon bg-blue">
              <span className="material-symbols-outlined icon-filled">check_circle</span>
            </div>
            <div className="h-info">
              <p className="h-label">Đơn thành công</p>
              <p className="h-val">{stats.successCount} đơn</p>
            </div>
          </div>

          <div className="health-card">
            <div className="h-icon bg-orange">
              <span className="material-symbols-outlined icon-filled">hourglass_empty</span>
            </div>
            <div className="h-info">
              <p className="h-label">Đơn chờ thanh toán</p>
              <p className="h-val">{stats.pendingCount} đơn</p>
            </div>
          </div>

          <div className="health-card">
            <div className="h-icon bg-purple">
              <span className="material-symbols-outlined icon-filled">cancel</span>
            </div>
            <div className="h-info">
              <p className="h-label">Đơn thất bại/Hết hạn</p>
              <p className="h-val">{stats.failedCount} đơn</p>
            </div>
          </div>
        </div>

        {/* Biểu đồ Doanh thu */}
        <section className="chart-section">
          <div className="section-header">
            <div>
              <h3 className="section-title">Biểu đồ phân tích tài chính</h3>
              <p className="section-subtitle">Tổng quan trực quan xu hướng dòng tiền tích lũy thực tế</p>
            </div>
            <div className="chart-filters">
              <button 
                className={`filter-btn ${filterType === 'MONTH' ? 'active' : ''}`}
                onClick={() => { setFilterType('MONTH'); setCurrentPage(1); }}
              >
                Tháng
              </button>
              <button 
                className={`filter-btn ${filterType === 'QUARTER' ? 'active' : ''}`}
                onClick={() => { setFilterType('QUARTER'); setCurrentPage(1); }}
              >
                Quý
              </button>
              <button 
                className={`filter-btn ${filterType === 'YEAR' ? 'active' : ''}`}
                onClick={() => { setFilterType('YEAR'); setCurrentPage(1); }}
              >
                Năm
              </button>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-grid-lines">
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
            </div>
            
            <div className="chart-bars">
              {chartData.map((data, index) => (
                <div className="bar-group" key={index}>
                  <div className="bar-wrapper">
                    <div 
                      className={`bar ${data.active ? 'active' : ''}`} 
                      style={{ height: `${data.height}%` }} 
                      data-tooltip={data.tooltip}
                    ></div>
                  </div>
                  <span className={`bar-label ${data.active ? 'active' : ''}`}>
                    {data.label}
                  </span>
                </div>
              ))}

              {chartData.length === 0 && (
                <div className="no-chart-data" style={{ paddingBottom: '40px', color: '#718096', fontSize: '13px' }}>
                  Chưa có dữ liệu thống kê giao dịch thành công cho chu kỳ này.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bảng lịch sử giao dịch */}
        <div className="card">
          <div className="card-header-flex" style={{ marginBottom: '20px' }}>
            <div>
              <h3 className="card-title">Lịch sử giao dịch toàn hệ thống</h3>
              <p className="page-desc" style={{ marginTop: '4px' }}>
                Hiển thị dữ liệu đồng bộ thời gian thực đan xen chi tiết phân loại gói và thông tin khách hàng.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Mã Đơn Hàng</th>
                  <th>Khách hàng</th>
                  <th>Gói dịch vụ</th>
                  <th>Mã giao dịch VNPay</th>
                  <th>Tổng tiền</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-id-badge">
                        {order.id ? `#${order.id.substring(0, 8).toUpperCase()}` : '#N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-meta-flex">
                          {order.user?.avatar && (
                            <img src={order.user.avatar} alt="Avatar" className="user-inline-avatar" />
                          )}
                          <div>
                            <p className="user-name">{order.user?.username || 'N/A'}</p>
                            <p className="user-email">{order.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                        {order.user?.phone && <span className="user-phone-text">SĐT: {order.user.phone}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="package-info-cell">
                        <p className="pkg-name">{order.package?.name || 'Gói đã xóa'}</p>
                        <div className="pkg-tags-flex">
                          {order.package?.type?.value && (
                            <span className="pkg-type-badge">{order.package.type.value}</span>
                          )}
                          {order.package?.tier?.value && (
                            <span className="pkg-tier-badge">{order.package.tier.value}</span>
                          )}
                        </div>
                        {order.voucher?.voucherCode && order.voucher.voucherCode !== 'Không dùng' && (
                          <span className="voucher-tag">Mã giảm: {order.voucher.voucherCode}</span>
                        )}
                      </div>
                    </td>
                    <td><code>{order.vnpTxnRef || 'Chưa tạo'}</code></td>
                    <td className="table-amount">{(order.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
                    <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <span className={`status-badge ${order.status?.toLowerCase()}`}>
                        {order.status === 'SUCCESS' ? 'Thành công' : order.status === 'PENDING' ? 'Chờ xử lý' : 'Thất bại'}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                      Chưa ghi nhận dữ liệu giao dịch nào trên hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Thanh phân trang thông minh hiển thị khi tổng đơn hàng lớn hơn itemsPerPage */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <span className="pagination-info">
                Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, orders.length)} trên tổng số {orders.length} đơn hàng
              </span>
              <div className="pagination-buttons">
                <button 
                  className="page-btn nav-btn" 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </button>
                <button 
                  className="page-btn nav-btn" 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  className="page-btn nav-btn" 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
                <button 
                  className="page-btn nav-btn" 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
  );
};

export default FinanceManagement;