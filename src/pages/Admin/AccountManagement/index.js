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
        } else if (u.role === 'USER' || u.role !== 'ADMIN') { 
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
    return <div className="account-loading-canvas">Đang đồng bộ dữ liệu tài khoản hệ thống...</div>;
  }

  return (
    <main className="account-main-wrapper">
      <div className="account-content-canvas">
        
        {/* Page Header */}
        <div className="account-flex-between">
          <div>
            <h1 className="account-page-title">Quản lý Tài khoản</h1>
            <p className="account-page-desc">Giám sát số lượng phân quyền thành viên, trạng thái hoạt động và thực thi kỷ luật hệ thống.</p>
          </div>
          <div className="account-search-box-wrapper">
            <span className="material-symbols-outlined account-search-icon">search</span>
            <input 
              type="text" 
              placeholder="Tìm tên, email, sđt..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="account-search-input"
            />
          </div>
        </div>

        {/* BENTO STATS GRID */}
        <div className="account-stats-grid">
          {/* 1. Tổng tài khoản */}
          <div className="account-stat-card">
            <div className="account-icon-box account-blue"><span className="material-symbols-outlined">group</span></div>
            <div>
              <p className="account-card-title">TỔNG TÀI KHOẢN</p>
              <h3>{stats.total.toLocaleString()}</h3>
            </div>
            <p className="account-trend account-positive"><span className="material-symbols-outlined">analytics</span> Mọi vai trò hệ thống</p>
          </div>
          
          {/* 2. Tài khoản Người Thuê */}
          <div className="account-stat-card">
            <div className="account-icon-box account-teal"><span className="material-symbols-outlined">school</span></div>
            <div>
              <p className="account-card-title account-font-bold">TÀI KHOẢN NGƯỜI THUÊ</p>
              <h3>{stats.tenants.toLocaleString()}</h3>
            </div>
            <div className="account-progress-bar">
              <div 
                className="account-fill account-teal" 
                style={{ width: `${stats.total > 0 ? (stats.tenants / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* 3. Tài khoản Chủ Trọ */}
          <div className="account-stat-card">
            <div className="account-icon-box account-orange"><span className="material-symbols-outlined">real_estate_agent</span></div>
            <div>
              <p className="account-card-title account-font-bold">TÀI KHOẢN CHỦ TRỌ</p>
              <h3>{stats.landlords.toLocaleString()}</h3>
            </div>
            <div className="account-progress-bar">
              <div 
                className="account-fill account-orange" 
                style={{ width: `${stats.total > 0 ? (stats.landlords / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* 4. Tài khoản Bị Khóa */}
          <div className="account-stat-card">
            <div className="account-icon-box account-red"><span className="material-symbols-outlined">lock</span></div>
            <div>
              <p className="account-card-title account-font-bold">TÀI KHOẢN BỊ KHÓA</p>
              <h3>{stats.locked.toLocaleString()}</h3>
            </div>
            <div className="account-progress-bar">
              <div 
                className="account-fill account-red-bar" 
                style={{ width: `${stats.total > 0 ? (stats.locked / stats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU & BỘ LỌC */}
        <div className="account-table-container">
          <div className="account-table-filters">
            <div className="account-filter-group">
              <div className="account-filter-item">
                <label>TRẠNG THÁI HOẠT ĐỘNG</label>
                <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="LOCKED">Đã khóa</option>
                </select>
              </div>
            </div>
            
            <div className="account-filter-actions">
              <span>Hiển thị {filteredUsers.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredUsers.length)} trên {filteredUsers.length} kết quả</span>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <table className="account-table">
            <thead>
              <tr>
                <th>NGƯỜI DÙNG</th>
                <th>VAI TRÒ</th>
                <th>TRẠNG THÁI HOẠT ĐỘNG</th>
                <th>ĐÁNH GIÁ (RATING)</th>
                <th className="account-text-right">THAO TÁC QUẢN TRỊ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user) => {
                const isLocked = user.isActive === false;
                const isLandlord = user.role === 'LANDLORD';
                
                return (
                  <tr key={user.id} className={isLocked ? "account-locked-row" : ""}>
                    <td>
                      <div className="account-user-cell">
                        <div className="account-avatar-wrapper">
                          <img 
                            src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"} 
                            alt={user.username} 
                            className={isLocked ? "account-grayscale" : ""} 
                          />
                          <span className={`account-status-dot ${isLocked ? "account-offline" : "account-online"}`}></span>
                        </div>
                        <div className="account-user-info">
                          <p className="account-name">
                            {user.username || 'Không tên'} 
                            {isLocked && <span className="account-locked-badge">Đã khóa</span>}
                          </p>
                          <p className="account-email">{user.email}</p>
                          {user.phone && <p className="account-phone-sub">SĐT: {user.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`account-role-badge ${user.role === 'ADMIN' ? 'account-red' : isLandlord ? 'account-orange' : 'account-teal'}`}>
                        {user.role === 'ADMIN' ? 'Admin' : isLandlord ? 'Chủ nhà' : 'Sinh viên/Người dùng'}
                      </span>
                    </td>
                    <td>
                      <span className={`account-status-tag ${!isLocked ? 'account-active' : 'account-locked'}`}>
                        {!isLocked ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td>
                      {isLandlord ? (
                        <div className="account-rating-cell-flex">
                          <span className="material-symbols-outlined account-star-icon">star</span>
                          <span>{user.rating ? user.rating.toFixed(1) : '5.0'}</span>
                        </div>
                      ) : (
                        <span className="account-not-applicable">—</span>
                      )}
                    </td>
                    <td className="account-actions-cell">
                      <button className="account-icon-btn" title="Xem hồ sơ chi tiết" onClick={() => handleOpenDetails(user)}>
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button 
                        className={`account-icon-btn ${isLocked ? 'account-unlock' : 'account-block'}`} 
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
                  <td colSpan="5" className="account-empty-table-state">
                    Không tìm thấy tài khoản người dùng nào khớp với tiêu chuẩn bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="account-pagination">
              <div className="account-page-size">
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
              <div className="account-page-numbers">
                <button 
                  className="account-nav-arrow" 
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
                      className={currentPage === p ? "account-active" : ""}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}

                <button 
                  className="account-nav-arrow" 
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
        <div className="account-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="account-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <h2>Chi Tiết Tài Khoản</h2>
              <button className="account-close-btn" onClick={() => setShowDetailModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="account-modal-body">
              <div className="account-user-profile-summary">
                <img 
                  src={selectedUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"} 
                  alt={selectedUser.username} 
                  className="account-large-avatar"
                />
                <h3>{selectedUser.username || 'Chưa thiết lập tên'}</h3>
                <span className={`account-role-badge ${selectedUser.role === 'ADMIN' ? 'account-red' : selectedUser.role === 'LANDLORD' ? 'account-orange' : 'account-teal'}`}>
                  {selectedUser.role === 'ADMIN' ? 'Quản trị viên' : selectedUser.role === 'LANDLORD' ? 'Chủ nhà trọ' : 'Sinh viên / Người thuê'}
                </span>
              </div>

              <div className="account-info-details-grid">
                <div className="account-detail-item">
                  <span className="account-label">Mã ID hệ thống:</span>
                  <span className="account-value account-code">{selectedUser.id}</span>
                </div>
                <div className="account-detail-item">
                  <span className="account-label">Địa chỉ Email:</span>
                  <span className="account-value">{selectedUser.email || 'Chưa liên kết'}</span>
                </div>
                <div className="account-detail-item">
                  <span className="account-label">Số điện thoại:</span>
                  <span className="account-value">{selectedUser.phone || 'Chưa cập nhật'}</span>
                </div>
                
                {selectedUser.role === 'LANDLORD' && (
                  <div className="account-detail-item">
                    <span className="account-label">Điểm số uy tín:</span>
                    <span className="account-value account-rating-style">
                      <span className="material-symbols-outlined">star</span>
                      {selectedUser.rating ? selectedUser.rating.toFixed(1) : '5.0'} / 5.0
                    </span>
                  </div>
                )}

                <div className="account-detail-item">
                  <span className="account-label">Trạng thái hoạt động:</span>
                  <span className={`account-value account-status-tag ${selectedUser.isActive ? 'account-active' : 'account-locked'}`}>
                    {selectedUser.isActive ? 'Đang hoạt động' : 'Đang bị khóa'}
                  </span>
                </div>
              </div>
            </div>

            <div className="account-modal-footer">
              <button 
                className={`account-action-toggle-btn ${selectedUser.isActive ? 'account-btn-danger' : 'account-btn-success'}`}
                onClick={() => handleToggleStatus(selectedUser.id, selectedUser.isActive)}
              >
                {selectedUser.isActive ? 'Khóa tài khoản này' : 'Kích hoạt tài khoản'}
              </button>
              <button className="account-btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountManagement;