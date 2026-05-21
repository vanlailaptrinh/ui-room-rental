import React, { useEffect, useState } from 'react';
import UserService from '../../../services/userService';
import './AccountManagement.css';

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // States quản lý Bộ lọc & Tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // States quản lý phân trang - Giữ nguyên tối đa 6 người/trang theo yêu cầu
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // State quản lý Modal xem chi tiết người dùng
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // State lưu trữ dữ liệu thống kê chi tiết theo vai trò và trạng thái
  const [stats, setStats] = useState({
    total: 0,
    tenants: 0,   // Số lượng người thuê (Sinh viên)
    landlords: 0, // Số lượng chủ trọ
    locked: 0     // Số lượng tài khoản bị khóa
  });

  useEffect(() => {
    loadUsersData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [users, searchKeyword, activeFilter]);

  // Tải dữ liệu và phân tích số liệu thống kê chi tiết
  const loadUsersData = async () => {
    try {
      setLoading(true);
      const res = await UserService.getAllUsers();
      const rawUsers = res.data || res || [];
      setUsers(rawUsers);

      let tenantCount = 0;
      let landlordCount = 0;
      let lockedCount = 0;

      rawUsers.forEach(u => {
        // Tính toán tài khoản bị khóa
        if (u.isActive === false) {
          lockedCount++;
        }
        
        // Phân loại đếm theo vai trò (Role)
        if (u.role === 'LANDLORD') {
          landlordCount++;
        } else if (u.role === 'STUDENT' || u.role === 'USER' || u.role !== 'ADMIN') { 
          // Mặc định các tài khoản không phải Admin/Chủ trọ sẽ tính là Người thuê (Sinh viên)
          tenantCount++;
        }
      });

      setStats({
        total: rawUsers.length,
        tenants: tenantCount,
        landlords: landlordCount,
        locked: lockedCount
      });
    } catch (error) {
      console.error("Lỗi khi kết nối hệ thống dữ liệu người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Bộ lọc liên hoàn: Tìm kiếm + Trạng thái hoạt động
  const applyFiltersAndSearch = () => {
    let result = [...users];

    // 1. Tìm kiếm theo Tên, Email hoặc Số điện thoại
    if (searchKeyword.trim() !== '') {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(u => 
        u.username?.toLowerCase().includes(keyword) || 
        u.email?.toLowerCase().includes(keyword) ||
        u.phone?.includes(keyword)
      );
    }

    // 2. Lọc theo trạng thái Hoạt động
    if (activeFilter !== 'ALL') {
      const target = activeFilter === 'ACTIVE';
      result = result.filter(u => u.isActive === target);
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset về trang đầu khi áp dụng bộ lọc mới
  };

  // Thay đổi trạng thái khóa/mở tài khoản trực tiếp
  const handleToggleStatus = async (userId, currentActiveStatus) => {
    const confirmMsg = currentActiveStatus 
      ? "Bạn có chắc chắn muốn KHÓA tài khoản này không?" 
      : "Bạn có chắc chắn muốn MỞ KHÓA tài khoản này không?";
    
    if (window.confirm(confirmMsg)) {
      try {
        await UserService.toggleUserStatus(userId, !currentActiveStatus);
        alert("Cập nhật trạng thái thành công!");
        loadUsersData(); 
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, isActive: !currentActiveStatus });
        }
      } catch (error) {
        alert("Lỗi thao tác, vui lòng kiểm tra lại hệ thống.");
      }
    }
  };

  // Kích hoạt Modal xem chi tiết người dùng
  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Điều hướng chuyển trang an toàn
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Xử lý Phân trang (Tính toán hiển thị tối đa 6 dòng)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return <div className="loading-canvas">Đang đồng bộ dữ liệu tài khoản hệ thống...</div>;
  }

  return (
    <main className="main-wrapper">
      <div className="content-canvas">
        
        {/* Page Header */}
        <div className="flex-between">
          <div>
            <h1 className="page-title">Quản lý Tài khoản</h1>
            <p className="page-desc">Giám sát số lượng phân quyền thành viên, trạng thái hoạt động và thực thi kỷ luật hệ thống.</p>
          </div>
          <div className="search-box-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              type="text" 
              placeholder="Tìm tên, email, sđt..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* BENTO STATS GRID (Cập nhật hiển thị chi tiết theo yêu cầu) */}
        <div className="am-stats-grid">
          {/* 1. Tổng tài khoản */}
          <div className="am-stat-card">
            <div className="icon-box blue"><span className="material-symbols-outlined">group</span></div>
            <div>
              <p className="title">TỔNG TÀI KHOẢN</p>
              <h3>{stats.total.toLocaleString()}</h3>
            </div>
            <p className="trend positive"><span className="material-symbols-outlined">analytics</span> Mọi vai trò hệ thống</p>
          </div>
          
          {/* 2. Tài khoản Người Thuê */}
          <div className="am-stat-card">
            <div className="icon-box teal"><span className="material-symbols-outlined">school</span></div>
            <div>
              <p className="title font-bold">TÀI KHOẢN NGƯỜI THUÊ</p>
              <h3>{stats.tenants.toLocaleString()}</h3>
            </div>
            <div className="progress-bar">
              <div 
                className="fill teal" 
                style={{ width: `${stats.total > 0 ? (stats.tenants / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* 3. Tài khoản Chủ Trọ */}
          <div className="am-stat-card">
            <div className="icon-box orange"><span className="material-symbols-outlined">real_estate_agent</span></div>
            <div>
              <p className="title font-bold">TÀI KHOẢN CHỦ TRỌ</p>
              <h3>{stats.landlords.toLocaleString()}</h3>
            </div>
            <div className="progress-bar">
              <div 
                className="fill orange" 
                style={{ width: `${stats.total > 0 ? (stats.landlords / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* 4. Tài khoản Bị Khóa */}
          <div className="am-stat-card">
            <div className="icon-box red"><span className="material-symbols-outlined">lock</span></div>
            <div>
              <p className="title font-bold">TÀI KHOẢN BỊ KHÓA</p>
              <h3>{stats.locked.toLocaleString()}</h3>
            </div>
            <div className="progress-bar">
              <div 
                className="fill red-bar" 
                style={{ width: `${stats.total > 0 ? (stats.locked / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU & BỘ LỌC */}
        <div className="am-table-container">
          <div className="am-table-filters">
            <div className="filter-group">
              <div className="filter-item">
                <label>TRẠNG THÁI HOẠT ĐỘNG</label>
                <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="LOCKED">Đã khóa</option>
                </select>
              </div>
            </div>
            
            <div className="filter-actions">
              <span>Hiển thị {filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredUsers.length)} trên {filteredUsers.length} kết quả</span>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <table className="am-table">
            <thead>
              <tr>
                <th>NGƯỜI DÙNG</th>
                <th>VAI TRÒ</th>
                <th>TRẠNG THÁI HOẠT ĐỘNG</th>
                <th>ĐÁNH GIÁ (RATING)</th>
                <th className="text-right">THAO TÁC QUẢN TRỊ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user) => {
                const isLocked = user.isActive === false;
                const isLandlord = user.role === 'LANDLORD';
                
                return (
                  <tr key={user.id} className={isLocked ? "locked-row" : ""}>
                    <td>
                      <div className="am-user-cell">
                        <div className="avatar-wrapper">
                          <img 
                            src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"} 
                            alt={user.username} 
                            className={isLocked ? "grayscale" : ""} 
                          />
                          <span className={`status-dot ${isLocked ? "offline" : "online"}`}></span>
                        </div>
                        <div className="user-info">
                          <p className="name">
                            {user.username || 'Không tên'} 
                            {isLocked && <span className="locked-badge">Đã khóa</span>}
                          </p>
                          <p className="email">{user.email}</p>
                          {user.phone && <p className="phone-sub">SĐT: {user.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role === 'ADMIN' ? 'red' : isLandlord ? 'orange' : 'teal'}`}>
                        {user.role === 'ADMIN' ? 'Admin' : isLandlord ? 'Chủ nhà' : 'Sinh viên'}
                      </span>
                    </td>
                    <td>
                      <span className={`am-status-tag ${!isLocked ? 'active' : 'locked'}`}>
                        {!isLocked ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      {isLandlord ? (
                        <div className="rating-cell-flex">
                          <span className="material-symbols-outlined star-icon">star</span>
                          <span>{user.rating ? user.rating.toFixed(1) : '5.0'}</span>
                        </div>
                      ) : (
                        <span className="not-applicable">—</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button className="icon-btn" title="Xem hồ sơ chi tiết" onClick={() => handleOpenDetails(user)}>
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button 
                        className={`icon-btn ${isLocked ? 'unlock' : 'block'}`} 
                        title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        onClick={() => handleToggleStatus(user.id, !isLocked)}
                      >
                        <span className="material-symbols-outlined">
                          {isLocked ? 'lock_open' : 'block'}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table-state">
                    Không tìm thấy tài khoản người dùng nào khớp với tiêu chuẩn bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="am-pagination">
              <div className="page-size">
                <span>Số hàng hiển thị:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option value={6}>6 hàng</option>
                  <option value={12}>12 hàng</option>
                  <option value={24}>24 hàng</option>
                </select>
              </div>
              <div className="page-numbers">
                <button 
                  className="nav-arrow" 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                >
                  &lt;&lt;
                </button>
                
                {[...Array(totalPages)].map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button 
                      key={p} 
                      className={currentPage === p ? "active" : ""}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}

                <button 
                  className="nav-arrow" 
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

      {/* MODAL XEM CHI TIẾT NGƯỜI DÙNG */}
      {showDetailModal && selectedUser && (
        <div className="am-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="am-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="am-modal-header">
              <h2>Chi Tiết Tài Khoản</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="am-modal-body">
              <div className="user-profile-summary">
                <img 
                  src={selectedUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"} 
                  alt={selectedUser.username} 
                  className="large-avatar"
                />
                <h3>{selectedUser.username || 'Chưa thiết lập tên'}</h3>
                <span className={`role-badge ${selectedUser.role === 'ADMIN' ? 'red' : selectedUser.role === 'LANDLORD' ? 'orange' : 'teal'}`}>
                  {selectedUser.role === 'ADMIN' ? 'Quản trị viên' : selectedUser.role === 'LANDLORD' ? 'Chủ nhà trọ' : 'Sinh viên / Người thuê'}
                </span>
              </div>

              <div className="info-details-grid">
                <div className="detail-item">
                  <span className="label">Mã ID hệ thống:</span>
                  <span className="value code">{selectedUser.id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Địa chỉ Email:</span>
                  <span className="value">{selectedUser.email || 'Chưa liên kết'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedUser.phone || 'Chưa cập nhật'}</span>
                </div>
                
                {selectedUser.role === 'LANDLORD' && (
                  <div className="detail-item">
                    <span className="label">Điểm số uy tín:</span>
                    <span className="value rating-style">
                      <span className="material-symbols-outlined">star</span>
                      {selectedUser.rating ? selectedUser.rating.toFixed(1) : '5.0'} / 5.0
                    </span>
                  </div>
                )}

                <div className="detail-item">
                  <span className="label">Trạng thái hoạt động:</span>
                  <span className={`value am-status-tag ${selectedUser.isActive ? 'active' : 'locked'}`}>
                    {selectedUser.isActive ? 'Đang hoạt động' : 'Đang bị khóa'}
                  </span>
                </div>
              </div>
            </div>

            <div className="am-modal-footer">
              <button 
                className={`action-toggle-btn ${selectedUser.isActive ? 'btn-danger' : 'btn-success'}`}
                onClick={() => handleToggleStatus(selectedUser.id, selectedUser.isActive)}
              >
                {selectedUser.isActive ? 'Khóa tài khoản này' : 'Kích hoạt tài khoản'}
              </button>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountManagement;