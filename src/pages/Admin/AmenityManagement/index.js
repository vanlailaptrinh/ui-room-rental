import React, { useEffect, useState } from 'react';
import AmenityService from '../../../services/amenityService';
import './AmenityManagement.css';

const AmenityManagement = () => {
  const [amenities, setAmenities] = useState([]);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  // States quản lý Tìm kiếm & Phân trang (Tối đa 6 dòng/trang)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // States quản lý Form (Dùng chung cho cả Thêm và Sửa)
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [amenityName, setAmenityName] = useState('');

  useEffect(() => {
    loadAmenitiesData();
  }, []);

  useEffect(() => {
    applySearch();
  }, [amenities, searchKeyword]);

  // 1. READ: Tải danh sách từ API Backend
  const loadAmenitiesData = async () => {
    try {
      setLoading(true);
      const res = await AmenityService.getAmenities();
      const rawData = res.data || [];
      setAmenities(rawData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tiện nghi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý bộ lọc tìm kiếm
  const applySearch = () => {
    let result = [...amenities];
    if (searchKeyword.trim() !== '') {
      result = result.filter(item => 
        item.name?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    setFilteredAmenities(result);
    setCurrentPage(1);
  };

  // Hàm tự động nhận diện tên để trả về icon sinh động
  const getDynamicIcon = (name) => {
    const text = name ? name.toLowerCase() : '';
    if (text.includes('wifi') || text.includes('mạng_internet')) return 'wifi';
    if (text.includes('điều hòa') || text.includes('máy lạnh') || text.includes('ac')) return 'ac_unit';
    if (text.includes('máy giặt')) return 'local_laundry_service';
    if (text.includes('tủ lạnh')) return 'kitchen';
    if (text.includes('xe') || text.includes('đỗ xe') || text.includes('gác')) return 'local_parking';
    if (text.includes('bếp') || text.includes('nấu ăn')) return 'cooking';
    if (text.includes('giường') || text.includes('nệm')) return 'bed';
    if (text.includes('wc') || text.includes('vệ sinh') || text.includes('tắm')) return 'bathtub';
    if (text.includes('an ninh') || text.includes('camera') || text.includes('khóa')) return 'shield';
    if (text.includes('tự do') || text.includes('giờ giấc')) return 'schedule';
    return 'widgets'; // Icon mặc định nếu không khớp từ khóa
  };

  // Mở modal để Thêm mới
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setAmenityName('');
    setSelectedId(null);
    setShowFormModal(true);
  };

  // Mở modal để Chỉnh sửa
  const handleOpenEdit = (amenity) => {
    setIsEditMode(true);
    setSelectedId(amenity.id);
    setAmenityName(amenity.name);
    setShowFormModal(true);
  };

  // 2. CREATE & UPDATE: Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amenityName.trim()) {
      alert("Tên tiện nghi không được để trống!");
      return;
    }

    const requestBody = { name: amenityName.trim() };

    try {
      if (isEditMode) {
        const res = await AmenityService.updateAmenity(selectedId, requestBody);
        if (res.code === 200) alert("Cập nhật tiện nghi thành công!");
      } else {
        const res = await AmenityService.createAmenity(requestBody);
        if (res.code === 200) alert("Thêm tiện nghi mới thành công!");
      }
      setShowFormModal(false);
      loadAmenitiesData();
    } catch (error) {
      alert("Thao tác thất bại, vui lòng kiểm tra lại quyền Admin hoặc hệ thống.");
    }
  };

  // 3. DELETE: Xóa tiện nghi
  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA tiện nghi "${name}" này không?`)) {
      try {
        const res = await AmenityService.deleteAmenity(id);
        if (res.code === 200) {
          alert("Xóa tiện nghi thành công!");
          loadAmenitiesData();
        }
      } catch (error) {
        alert("Không thể xóa! Tiện nghi này có thể đang được sử dụng ở các bài đăng phòng trọ.");
      }
    }
  };

  // Định dạng ngày tháng hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredAmenities.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAmenities.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return <div className="amenity-loading-canvas">Đang đồng bộ danh mục tiện nghi hệ thống...</div>;
  }

  return (
    <main className="amenity-main-wrapper">
      <div className="amenity-content-canvas">
        
        {/* Page Header */}
        <div className="amenity-flex-between">
          <div>
            <h1 className="amenity-page-title">Quản lý Tiện nghi</h1>
            <p className="amenity-page-desc">Cấu hình danh mục các tiện ích phòng trọ (Wifi, Điều hòa, Máy giặt...) phục vụ chủ trọ đăng bài.</p>
          </div>
          <div className="amenity-header-actions-group">
            <div className="amenity-search-box-wrapper">
              <input 
                type="text" 
                placeholder="Tìm tên tiện nghi..." 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="amenity-search-input"
              />
            </div>
            <button className="amenity-btn-primary-add" onClick={handleOpenCreate}>
              <span className="material-symbols-outlined">add</span> Thêm tiện nghi
            </button>
          </div>
        </div>

        {/* BENTO STATS GRID */}
        <div className="amenity-stats-grid">
          <div className="amenity-stat-card card-gradient-purple">
            <div className="amenity-icon-box bg-purple-light"><span className="material-symbols-outlined">widgets</span></div>
            <div>
              <p className="amenity-card-title">TỔNG TIỆN NGHI</p>
              <h3 className="amenity-card-number">{amenities.length.toLocaleString()}</h3>
            </div>
            <p className="amenity-card-trend text-purple"><span className="material-symbols-outlined">verified</span> Danh mục khả dụng</p>
          </div>
          <div className="amenity-stat-card card-gradient-blue">
            <div className="amenity-icon-box bg-blue-light"><span className="material-symbols-outlined">manage_search</span></div>
            <div>
              <p className="amenity-card-title">KẾT QUẢ TÌM THẤY</p>
              <h3 className="amenity-card-number">{filteredAmenities.length.toLocaleString()}</h3>
            </div>
            <p className="amenity-card-trend text-blue"><span className="material-symbols-outlined">filter_list</span> Khớp bộ lọc hiện tại</p>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="amenity-table-container">
          <div className="amenity-table-filters">
            <div className="amenity-filter-info-text">
              <span>Hiển thị <strong>{filteredAmenities.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredAmenities.length)}</strong> trên <strong>{filteredAmenities.length}</strong> dữ liệu hệ thống</span>
            </div>
            
            <div className="amenity-filter-actions">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <table className="amenity-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>MÃ ID TIỆN NGHI</th>
                <th style={{ width: '35%' }}>TÊN TIỆN NGHI</th>
                <th style={{ width: '20%' }}>NGÀY TẠO HỆ THỐNG</th>
                <th style={{ width: '15%' }} className="text-right">THAO TÁC QUẢN TRỊ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="amenity-id-code">{item.id}</span>
                  </td>
                  <td>
                    <div className="amenity-name-cell">
                      <div className="amenity-avatar-icon-wrapper">
                        <span className="material-symbols-outlined amenity-cell-icon">
                          {getDynamicIcon(item.name)}
                        </span>
                      </div>
                      <span className="amenity-text-name">{item.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="amenity-date">{formatDate(item.createdAt)}</span>
                  </td>
                  <td className="amenity-actions-cell text-right">
                    <button className="amenity-icon-btn amenity-edit-btn" title="Chỉnh sửa tiện nghi" onClick={() => handleOpenEdit(item)}>
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="amenity-icon-btn amenity-delete-btn" title="Xóa tiện nghi" onClick={() => handleDelete(item.id, item.name)}>
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredAmenities.length === 0 && (
                <tr>
                  <td colSpan="4" className="amenity-empty-table-state">
                    <span className="material-symbols-outlined empty-icon">search_off</span>
                    <p>Không tìm thấy danh mục tiện nghi nào khớp với từ khóa tìm kiếm.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* THANH PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="amenity-pagination">
              <div className="amenity-page-size">
                <span>Hiển thị tối đa: <strong>{itemsPerPage} hàng/trang</strong></span>
              </div>
              <div className="amenity-page-numbers">
                <button 
                  className="amenity-nav-arrow" 
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
                      className={currentPage === p ? "amenity-active" : ""}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  );
                })}

                <button 
                  className="amenity-nav-arrow" 
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

      {/* MODAL DIALOG: THÊM / SỬA TIỆN NGHI */}
      {showFormModal && (
        <div className="amenity-modal-overlay" onClick={() => setShowFormModal(false)}>
          <form className="amenity-modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <div className="amenity-modal-header">
              <h2>{isEditMode ? 'Cập Nhật Tiện Nghi' : 'Thêm Tiện Nghi Mới'}</h2>
              <button type="button" className="amenity-close-btn" onClick={() => setShowFormModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="amenity-modal-body">
              <div className="amenity-form-group-block">
                <label className="amenity-form-label">Tên Tiện Nghi <span className="amenity-required-star">*</span></label>
                <div className="amenity-input-icon-wrapper">
                  <span className="material-symbols-outlined amenity-input-inner-icon">auto_awesome</span>
                  <input 
                    type="text" 
                    className="amenity-form-input-text"
                    placeholder="Ví dụ: Điều hòa, Máy giặt, Wifi tốc độ cao..."
                    value={amenityName}
                    onChange={(e) => setAmenityName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <p className="amenity-form-input-tip">💡 Hệ thống sẽ tự nhận diện tên để hiển thị biểu tượng minh họa sinh động ngoài danh sách phòng trọ.</p>
              </div>
            </div>

            <div className="amenity-modal-footer">
              <button type="button" className="amenity-btn-secondary" onClick={() => setShowFormModal(false)}>Hủy bỏ</button>
              <button type="submit" className="amenity-btn-submit-save">
                <span className="material-symbols-outlined">save</span> Lưu lại
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default AmenityManagement;