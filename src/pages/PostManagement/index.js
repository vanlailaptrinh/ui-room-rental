import React, { useState } from 'react';
import './PostManagement.css'; // Đảm bảo đường dẫn import đúng với file CSS

const PostManagement = () => {
  // Trạng thái (state) để bật/tắt modal Từ chối
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);

  // Dữ liệu mẫu (giúp code gọn hơn thay vì copy paste HTML nhiều lần)
  const listings = [
    {
      id: 1,
      title: "Căn hộ Studio cao cấp - Vinhome Grand Park",
      date: "12/10/2023",
      location: "Quận 9, TP. Hồ Chí Minh",
      price: "8.500.000đ",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuARUIDU0Tdj_7NyMfdvt81rXDt6q18Rz_jHMPnF-WoT1xrDTcbht-58wzMoEdDlCGSO7fouAbIW5rAbS73jZoS8obFTFV2ktFT4DgJAZM6wxNYhh8KMpJCgFsxF_WgEqWU_18uMfBvcIpnX1Vw7qS9z6ncKE_tTqVDLVRut0WI1Qcus8VtGR9_jeqXLbsCiGNhrrD9AE3lRCQ19pYLp4gvumDd-D3Dmv37KdrGvV-nEvy7iwwUXp8GIQShNwCOHqV3CTYLmImVf3ZM",
      tag: { type: 'new', label: 'Mới' },
      landlord: { name: "Nguyễn Văn A", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAg45UH4jbRZHPyAY7hGx09pAeLfhY3yHol9Qten-O0_ewSoIIBrNbD2n3d8ABjTddJuxbb8_dXvr5jJeIh-SH2R-nhVzbtYdQ03NQfXLvIpo0t1S7YzWzpQ5RBgMQ4zMO7u0qpzNJaxZSpYUWyhxJ2eltaaU0kF7vV0ZXb9Irolbukb4BettE2Kx96cD7DKn8XyMEb5gu0EJmMCUXemelCu6294X-xFRC7as7ia3Cw2VomdxnDM937LtamYiP5e7fsc9hqmQCdCZ8", badge: "Chủ nhà xác thực", badgeClass: "badge-verified" }
    },
    {
      id: 2,
      title: "Phòng trọ cao cấp cho SV Ngoại Thương",
      date: "11/10/2023",
      location: "Bình Thạnh, TP. Hồ Chí Minh",
      price: "4.200.000đ",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5DA2LCNTxsVQzEV4Ds1u7k0V0oo8MW459aarE-N9_8cAre9ykQBlc1J-LjDhQT39NMKQRg8FTnBkuiv8CQl6FwiBVlLpS5bbg05QxvqpXG7pA2WH_1FRbm9Um6ypliyI8iAMkaLvMEJC0itCuZYa7Ak2AtzvWYyo8O2QMDjqHq90TkRAsjHaLzgwaPgYAyY5tUZBHezmwIT_V6G5j444zitjAbqsrHDuCRbG8sZNdXvPQr0M1sstXWkN676rfB2FkkkJsSOV2AgA",
      tag: null,
      landlord: { name: "Lê Thị B", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-ajmHbv1hMlsajRJvOUOMFD5LQRZPXbUOxKzGyL6B7jFFVpshWCAxXwoqlxts5Rte91iXwATto5_htPWQ8gk-87gqzFtoeIceWMYDqIkhyfl8l0EeEbDvt1qnTqbC3dY3chcBPpfTj95CPryQWKbaaoXLBdwrfG_6fOTPJ-zGx2LTQpDrlMdjrMnNKY2ZXY0ha8LNiOzAVtAQnLrgYUcdigNNqShIW-85EynM-ixhRi9T2-XS0shf0LWBC4b9WEoXwR4vMt4GwR8", badge: "Thành viên mới", badgeClass: "badge-new" }
    },
    {
      id: 3,
      title: "Nhà nguyên căn đầy đủ nội thất - Gần ĐH Duy Tân",
      date: "11/10/2023",
      location: "Hải Châu, Đà Nẵng",
      price: "12.000.000đ",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQ_RClQxYzgtHAbfnms8SXFtn6HpxsD-zQl8EfLVHsH5xIcObgfGLtP6S5T5ITrPzibLPE3IuaUruHATcUIcI6czdVxQnGGm3vWFKY01eDeq2Klp-aE_rA9rfbPeYJLOWL_mIknYz9a0RFN2ijlK07Dn6MzgX-uB8SV-uTr0R-WWgYUemS6UwEXRCT1ENsNq2deTW5-J3Bgzh8tzfye6CIDT4dRSJyR2Msnmvjjld9bzCncVQi_kYDiiRKRjcXaHr1vTXS3yPcFNU",
      tag: { type: 'priority', label: 'Ưu tiên' },
      landlord: { name: "Trần Văn C", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3TL1DEkj3N5Oo2pll3vlW5pA5W-umzp6U-eGILR8kcrNRBUOP-ANEtVZQxNwAvLG60W0Q5NaIjpjJ5mzdG8olQkHQZEZGpuVI1LIPUhsFqa-rm14LqqkSFge2CwYaTtHGuI6o2jsrAwL4da2MFTQBngxsHDtmRkRnLdxipMB1KEEdAQBXZ0EMI7OsjxXiEOk7cEtXpb2644k8-rg4_uRxjxsxvh2pTDeSiNfyuekivwtPjXgCj8hPcjZKfOopgpWUShjXIiGRzMQ", badge: "Đối tác Kim Cương", badgeClass: "badge-diamond" }
    }
  ];

  return (
    <div className="app-container">
      {/* SideNavBar Shell */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>Editorial Admin</h1>
          <p>THE EDITORIAL MARKETPLACE</p>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">dashboard</span>
            Bảng điều khiển
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">confirmation_number</span>
            Quản lý Voucher
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">block</span>
            Quản lý Danh sách đen
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">group</span>
            Quản lý Người dùng
          </a>
          {/* ACTIVE TAB */}
          <a href="#" className="nav-item active">
            <span className="material-symbols-outlined">apartment</span>
            Quản lý Bài đăng
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">payments</span>
            Quản lý Tài chính
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">report</span>
            Quản lý Báo cáo
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">gavel</span>
            Xử lý tranh chấp
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">analytics</span>
            Thống kê hệ thống
          </a>
        </nav>

        <div className="sidebar-footer">
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
          <a href="#" className="nav-item">
            <span className="material-symbols-outlined">help</span>
            Support
          </a>
          
          <div className="user-profile">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCV5EBRpe1abnby-q68j5xhnN6EXKWOD6Nn5RkJA2vEKIuU3uDxrTed9c8lbVS7tW3PxeCWA1mR77FhuDikolkbFv2nvACZIJdBrPUoAnEyVNOs8wMQoVnJbQjm0NlZGhgs5C1Xs17PcrPe94_jPmFRUuU8UB-cCv46k1xNbHXY5MGXrjUUo3ewW8X5HSBZFri1tOktksNmbwFHrrvIVFz4irKtAX_LUpoDnmYuEgc6T4_NaWSn5F8v7XFiJwQzBJ_OdGOc52n7MXM" alt="Admin" className="user-avatar" />
            <div className="user-info">
              <p>Marketplace Manager</p>
              <p>Admin Profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* TopAppBar Shell */}
      <header className="top-header">
        <div className="header-left">
          <span className="header-title">The Editorial Marketplace</span>
          <div className="header-divider"></div>
          <h2 className="header-subtitle">Quản lý Bài đăng</h2>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" className="search-input" placeholder="Tìm kiếm bài đăng..." />
          </div>
          
          <div className="header-actions">
            <button className="icon-btn">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="icon-btn">
              <span className="material-symbols-outlined">mail</span>
            </button>
            <button className="icon-btn">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="main-content">
        {/* Title & Page Header */}
        <div className="page-header">
          <div>
            <p className="page-label">Hệ thống Quản trị</p>
            <h1 className="page-title">Kiểm duyệt Nội dung</h1>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary">
              <span className="material-symbols-outlined">download</span>
              Xuất Báo cáo
            </button>
            <button className="btn btn-primary">
              <span className="material-symbols-outlined">add</span>
              Bài đăng Mới
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button className="tab active">
            Chờ duyệt <span className="badge">12</span>
          </button>
          <button className="tab">
            Đã duyệt <span className="badge">142</span>
          </button>
          <button className="tab">
            Bị từ chối <span className="badge">8</span>
          </button>
        </div>

        {/* Content Grid */}
        <div className="listing-list">
          {listings.map((item) => (
            <div className="listing-card" key={item.id}>
              <div className="card-image-wrapper">
                <img src={item.image} alt={item.title} className="card-image" />
                {item.tag && (
                  <div className={`card-tag ${item.tag.type === 'new' ? 'tag-new' : 'tag-priority'}`}>
                    {item.tag.label}
                  </div>
                )}
              </div>
              
              <div className="card-content">
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{item.title}</h3>
                    <div className="card-meta">
                      <p className="meta-item">
                        <span className="material-symbols-outlined">calendar_today</span>
                        Đăng ngày: {item.date}
                      </p>
                      <p className="meta-item">
                        <span className="material-symbols-outlined">location_on</span>
                        {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="card-price-wrapper">
                    <p className="card-price">{item.price}</p>
                    <p className="card-unit">Mỗi tháng</p>
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="landlord-info">
                    <img src={item.landlord.avatar} alt={item.landlord.name} className="landlord-avatar" />
                    <span className="landlord-name">{item.landlord.name}</span>
                    <span className={`landlord-badge ${item.landlord.badgeClass}`}>
                      {item.landlord.badge}
                    </span>
                  </div>
                  
                  <div className="card-actions">
                    <button className="action-btn btn-view">
                      <span className="material-symbols-outlined">visibility</span>
                      Chi tiết
                    </button>
                    <button 
                      className="action-btn btn-reject"
                      onClick={() => setRejectModalOpen(true)}
                    >
                      <span className="material-symbols-outlined">close</span>
                      Từ chối
                    </button>
                    <button className="action-btn btn-approve">
                      <span className="material-symbols-outlined">check</span>
                      Phê duyệt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <p className="pagination-text">Hiển thị 1 - 3 trên tổng số 12 bài đăng chờ duyệt</p>
          <div className="pagination-controls">
            <button className="page-btn">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-dots">...</span>
            <button className="page-btn">10</button>
            <button className="page-btn">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </main>

      {/* Reject Dialog (Modal) */}
      {isRejectModalOpen && (
        <div className="modal-overlay" onClick={() => setRejectModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Lý do từ chối</h3>
            <p className="modal-desc">Vui lòng cung cấp lý do chi tiết để chủ nhà có thể chỉnh sửa lại bài đăng.</p>
            
            <div className="modal-options">
              <label className="radio-label">
                <input type="radio" name="reason" className="radio-input" />
                <span className="radio-text">Hình ảnh không chất lượng</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="reason" className="radio-input" />
                <span className="radio-text">Thông tin địa chỉ không chính xác</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="reason" className="radio-input" />
                <span className="radio-text">Giá cả không hợp lý/Nghi ngờ ảo</span>
              </label>
              <textarea 
                className="modal-textarea" 
                placeholder="Lý do khác..."
              ></textarea>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel"
                onClick={() => setRejectModalOpen(false)}
              >
                Hủy bỏ
              </button>
              <button className="btn-modal-submit">Gửi từ chối</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;