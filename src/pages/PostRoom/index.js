import React, { useState, useEffect } from 'react';
import PostService from '../../services/postService';
import AmenityService from '../../services/amenityService';
import roomService from '../../services/roomService';
import InventoryService from '../../services/inventoryService';
import packageService from '../../services/packageService';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import {
    FiHome, FiGrid, FiFileText, FiCamera, FiMapPin,
    FiCompass, FiZap, FiX, FiUpload, FiPackage, FiSearch
} from 'react-icons/fi';
import './PostRoom.css';

// Vá lỗi không hiển thị được Icon Marker mặc định của Leaflet trong React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hợp phần bổ trợ: Tự động di chuyển tâm bản đồ khi tọa độ thay đổi
function ChangeMapCenter({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

const ROOM_TYPE_MAP = {
    "Phòng Studio": "STUDIO",
    "Phòng đơn": "SINGLE_ROOM",
    "Phòng ở ghép": "SHARED_ROOM",
    "Căn hộ": "APARTMENT",
    "Nhà nguyên căn": "WHOLE_HOUSE",
    "Ký túc xá": "DORMITORY",
};

function PostRoom() {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        address: '',
        price: '',
        area: '',
        latitude: '',
        longitude: '',
        roomType: '',
        postingTier: '',
        boostingTier: ''
    });

    const [roomTypes, setRoomTypes] = useState([]);
    const [availableAmenities, setAvailableAmenities] = useState([]);
    const [displayPostingPackages, setDisplayPostingPackages] = useState([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [myBoostingPackages, setMyBoostingPackages] = useState([]);

    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [isSearchingAddress, setIsSearchingAddress] = useState(false);

    const DEFAULT_LAT = 10.762622;
    const DEFAULT_LNG = 106.660172;

    const mapLat = formData.latitude && !isNaN(parseFloat(formData.latitude)) ? parseFloat(formData.latitude) : DEFAULT_LAT;
    const mapLng = formData.longitude && !isNaN(parseFloat(formData.longitude)) ? parseFloat(formData.longitude) : DEFAULT_LNG;
    const currentPosition = [mapLat, mapLng];

    const handleSearchAddressOnMap = async () => {
        if (!formData.address || !formData.address.trim()) {
            alert("Vui lòng nhập địa chỉ trước khi tìm vị trí!");
            return;
        }
        if (isSearchingAddress) return;

        try {
            setIsSearchingAddress(true);

            let searchKeyword = formData.address.trim();

            // 💡 THUẬT TOÁN TỰ ĐỘNG LÀM SẠCH ĐỊA CHỈ:
            // Nếu địa chỉ có dấu phẩy (thường chia dạng: Số nhà, Đường, Phường, Quận...)
            // Chúng ta sẽ bỏ phần đầu tiên (thường là số nhà/ngõ hẻm khó tìm) để lấy phần diện rộng hơn.
            const addressParts = searchKeyword.split(',');
            if (addressParts.length > 2) {
                // Bỏ phần tử đầu tiên nếu nó chứa số (ví dụ: 123/45 hoặc Kiệt 20)
                if (/\d/.test(addressParts[0]) || addressParts[0].toLowerCase().includes('ngõ') || addressParts[0].toLowerCase().includes('hẻm')) {
                    searchKeyword = addressParts.slice(1).join(',').trim();
                }
            }

            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchKeyword)}&countrycodes=vn&limit=1`;

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'RoomRentalApplication/1.0 (contact@yourdomain.com)'
                }
            });

            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setFormData(prev => ({
                    ...prev,
                    latitude: parseFloat(lat).toFixed(6),
                    longitude: parseFloat(lon).toFixed(6)
                }));
            } else {
                // 💡 PHƯƠNG ÁN DỰ PHÒNG CUỐI CÙNG: Nếu cắt rồi vẫn không ra, tìm theo Quận/Huyện + Tỉnh Thành
                if (addressParts.length >= 2) {
                    const broadSearch = addressParts.slice(-2).join(',').trim(); // Lấy 2 vế cuối cùng (VD: Quận 9, Hồ Chí Minh)
                    const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(broadSearch)}&countrycodes=vn&limit=1`;

                    const fallbackRes = await fetch(fallbackUrl, { headers: { 'User-Agent': 'RoomRentalApplication/1.0' } });
                    const fallbackData = await fallbackRes.json();

                    if (fallbackData && fallbackData.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            latitude: parseFloat(fallbackData[0].lat).toFixed(6),
                            longitude: parseFloat(fallbackData[0].lon).toFixed(6)
                        }));
                        return;
                    }
                }

                alert("Hệ thống không tìm thấy con đường này. Bản đồ đã được đưa về khu vực lân cận, bạn hãy click chuột trực tiếp lên bản đồ để ghim vị trí chính xác nhé!");
            }
        } catch (error) {
            console.error("Lỗi định vị:", error);
            alert("Không thể kết nối dịch vụ bản đồ.");
        } finally {
            setIsSearchingAddress(false);
        }
    };

    function MapClickHandler() {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setFormData(prev => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6)
                }));
            },
        });
        return null;
    }

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingPackages(true);

                const roomData = await roomService.getRoomTypes();
                const typesList = roomData.result || roomData.data || roomData;

                if (Array.isArray(typesList) && typesList.length > 0) {
                    setRoomTypes(typesList);
                    // 💡 ĐÃ FIX: Thiết lập giá trị khởi tạo chuẩn Enum thay vì String
                    const firstType = typesList[0];
                    const initialRoomVal = typeof firstType === 'string'
                        ? (ROOM_TYPE_MAP[firstType] || firstType)
                        : (firstType.code || firstType.id);
                    setFormData(prev => ({ ...prev, roomType: initialRoomVal }));
                }

                const amenityData = await AmenityService.getAmenities();
                const amenitiesList = amenityData.result || amenityData.data || amenityData;
                if (Array.isArray(amenitiesList)) setAvailableAmenities(amenitiesList);

                const packageRes = await packageService.getPackages();
                const allPackages = packageRes.data || packageRes.result || packageRes || [];

                const inventoryRes = await InventoryService.getMyInventories();
                const inventoryList = inventoryRes.data || inventoryRes.result || inventoryRes || [];

                const safeInventory = Array.isArray(inventoryList) ? inventoryList : [];
                const safePackages = Array.isArray(allPackages) ? allPackages : [];

                const postingPackagesMapped = safeInventory
                    .filter(inv => inv && String(inv.type || '').toUpperCase() === 'POSTING' && inv.balance > 0)
                    .map(inv => {
                        const basePkg = safePackages.find(p =>
                            (inv.packageId && String(p.id) === String(inv.packageId)) ||
                            (inv.package?.id && String(p.id) === String(inv.package.id)) ||
                            (String(p.tier || '').toUpperCase() === String(inv.tier || '').toUpperCase())
                        );

                        return {
                            id: inv.id || inv.tier,
                            packageId: basePkg ? basePkg.id : inv.packageId,
                            tier: inv.tier,
                            name: (basePkg && basePkg.name) ? basePkg.name : `Gói Đăng ${inv.tier}`,
                            activeDays: (basePkg && basePkg.activeDays) ? basePkg.activeDays : 30,
                            userBalance: inv.balance
                        };
                    });
                setDisplayPostingPackages(postingPackagesMapped);

                const boostingPackagesMapped = safeInventory
                    .filter(inv => inv && String(inv.type || '').toUpperCase() === 'BOOSTING' && inv.balance > 0)
                    .map(inv => {
                        const basePkg = safePackages.find(p =>
                            (inv.packageId && String(p.id) === String(inv.packageId)) ||
                            (inv.package?.id && String(p.id) === String(inv.package.id)) ||
                            (String(p.tier || '').toUpperCase() === String(inv.tier || '').toUpperCase())
                        );

                        return {
                            id: inv.id || inv.tier,
                            packageId: basePkg ? basePkg.id : inv.packageId,
                            tier: inv.tier,
                            name: (basePkg && basePkg.name) ? basePkg.name : `Gói Đẩy ${inv.tier}`,
                            activeDays: (basePkg && basePkg.activeDays) ? basePkg.activeDays : 1,
                            userBalance: inv.balance
                        };
                    });
                setMyBoostingPackages(boostingPackagesMapped);

                if (postingPackagesMapped.length > 0) {
                    setFormData(prev => ({ ...prev, postingTier: postingPackagesMapped[0].tier }));
                }

            } catch (error) {
                console.error("Lỗi khi tải và đồng bộ dữ liệu:", error);
            } finally {
                setLoadingPackages(false);
            }
        };
        loadInitialData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAmenityChange = (id) => {
        if (selectedAmenities.includes(id)) {
            setSelectedAmenities(selectedAmenities.filter(item => item !== id));
        } else {
            setSelectedAmenities([...selectedAmenities, id]);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        if (imageFiles.length + files.length > 8) {
            alert("Bạn chỉ được chọn tối đa 8 hình ảnh!");
            return;
        }
        setImageFiles([...imageFiles, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const handleRemoveImage = (index) => {
        const updatedFiles = [...imageFiles];
        const updatedPreviews = [...imagePreviews];
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedFiles.splice(index, 1);
        updatedPreviews.splice(index, 1);
        setImageFiles(updatedFiles);
        setImagePreviews(updatedPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Kiểm tra các điều kiện bắt buộc cơ bản
        if (!formData.postingTier) {
            alert("Bạn không thể đăng bài vì chưa sở hữu hoặc chưa chọn gói tin đăng nào còn lượt!");
            return;
        }
        if (!formData.title || !formData.price || !formData.address) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }
        if (!formData.roomType || formData.roomType === "undefined") {
            alert("Vui lòng chọn Loại phòng (Room Type) trước khi đăng tin!");
            return;
        }

        try {
            const dataToSend = new FormData();

            // Đóng gói chuỗi văn bản
            dataToSend.append('title', formData.title.trim());
            dataToSend.append('content', formData.content ? formData.content.trim() : '');
            dataToSend.append('address', formData.address.trim());

            const finalRoomType = ROOM_TYPE_MAP[formData.roomType] || formData.roomType;
            dataToSend.append('roomType', finalRoomType);

            // 2. Ép kiểu số an toàn (Tránh gửi NaN lên Backend)
            const parsedPrice = parseFloat(formData.price);
            dataToSend.append('price', !isNaN(parsedPrice) ? parsedPrice : 0);

            if (formData.area && String(formData.area).trim() !== "") {
                const parsedArea = parseFloat(formData.area);
                if (!isNaN(parsedArea)) {
                    dataToSend.append('area', parsedArea);
                }
            }

            // Tọa độ an toàn: Nếu chuỗi rỗng hoặc ép kiểu lỗi (NaN), trả về tọa độ mặc định
            const latParsed = parseFloat(formData.latitude);
            const lngParsed = parseFloat(formData.longitude);
            const finalLat = (!isNaN(latParsed)) ? latParsed : 10.762622;
            const finalLng = (!isNaN(lngParsed)) ? lngParsed : 106.660172;

            dataToSend.append('latitude', finalLat);
            dataToSend.append('longitude', finalLng);

            // 3. Xử lý Gói dịch vụ
            dataToSend.append('postingTier', formData.postingTier);
            const selectedPostingPkg = displayPostingPackages.find(p => p.tier === formData.postingTier);
            if (selectedPostingPkg) {
                if (selectedPostingPkg.packageId) dataToSend.append('packageId', selectedPostingPkg.packageId);
                if (selectedPostingPkg.id) dataToSend.append('inventoryId', selectedPostingPkg.id);
            }

            if (formData.boostingTier && String(formData.boostingTier).trim() !== "") {
                dataToSend.append('boostingTier', formData.boostingTier);
            }

            // 4. 🔥 SỬA CHÍ MẠNG: Chỉ dùng 1 cấu trúc key duy nhất cho mảng để Spring Boot tự nhận diện
            if (selectedAmenities && selectedAmenities.length > 0) {
                selectedAmenities.forEach(id => {
                    dataToSend.append('amenities', id);
                });
            }

            // 5. Đính kèm File hình ảnh
            if (imageFiles.length > 0) {
                imageFiles.forEach(file => dataToSend.append('images', file));
            }

            // 6. Gửi dữ liệu tới Service
            const response = await PostService.createPost(dataToSend);

            // Chấp nhận cả trường hợp response trả về trực tiếp data hoặc bọc qua thuộc tính định danh khác
            if (response && (response.code === 200 || response.status === 200 || response.success === true || response.data)) {
                alert("Đăng bài thành công, chờ Admin phê duyệt!");
                // Bạn có thể bổ sung logic chuyển trang hoặc reset trạng thái form ở đây
            } else {
                // Đề phòng trường hợp API trả về 200 nhưng cấu trúc báo lỗi logic bên trong
                alert("Có lỗi xảy ra trong quá trình xử lý, vui lòng thử lại.");
            }

        } catch (error) {
            console.error("Log lỗi chi tiết Front-end:", error);
            if (error.response && error.response.data) {
                // Tìm kiếm câu thông báo lỗi cụ thể do backend cấu trúc trả về
                const backendMsg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                alert(`Backend từ chối (Lỗi 400): ${backendMsg}`);
            } else {
                alert("Đăng bài thất bại. Hãy kiểm tra lại kết nối mạng hoặc dữ liệu nhập vào.");
            }
        }
    };

    return (
        <main className="post-room-container">
            <form className="post-room-layout" onSubmit={handleSubmit}>

                {/* ================= CỘT TRÁI: THÔNG TIN BÀI ĐĂNG ================= */}
                <div className="main-column">

                    {/* Section 1: Thông tin cơ bản */}
                    <section className="form-section">
                        <div className="section-header">
                            <FiHome className="icon-primary" />
                            <h2>Thông tin cơ bản</h2>
                        </div>
                        <div className="input-grid">
                            <div className="col-full">
                                <label>Tiêu đề tin đăng <span className="required">*</span></label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ví dụ: Cho Thuê VINHOMES GRAND PARK Thủ Đức" />
                            </div>
                            <div>
                                <label>Loại phòng <span className="required">*</span></label>
                                <select name="roomType" value={formData.roomType} onChange={handleInputChange} className="form-input select-input">
                                    {roomTypes.map((type, index) => {
                                        if (typeof type === 'string') {
                                            const mappedEnumVal = ROOM_TYPE_MAP[type] || "UNKNOWN";
                                            return <option key={index} value={mappedEnumVal}>{type}</option>;
                                        }
                                        const enumValue = type.code || type.id;
                                        return <option key={type.id || index} value={enumValue}>{type.name}</option>;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label>Diện tích (m²)</label>
                                <input type="number" name="area" value={formData.area} onChange={handleInputChange} placeholder="Ví dụ: 40" className="form-input" />
                            </div>
                            <div className="col-full">
                                <label>Giá cho thuê (VND/tháng) <span className="required">*</span></label>
                                <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Ví dụ: 5000000" className="form-input" />
                            </div>

                            <div className="col-full">
                                <label>Địa chỉ chi tiết <span className="required">*</span></label>
                                <div className="input-with-button">
                                    <div className="input-wrapper">
                                        <FiMapPin className="icon-inside" />
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            /* 💡 ĐÃ BỎ ONBLUR GÂY XUNG ĐỘT PHÍM BẤM */
                                            placeholder="Ví dụ: Vinhomes Grand Park, Long Bình, Quận 9, Hồ Chí Minh"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSearchAddressOnMap}
                                        disabled={isSearchingAddress}
                                        className="btn-search-map"
                                    >
                                        <FiSearch size={16} />
                                        {isSearchingAddress ? "Đang tìm..." : "Tìm trên bản đồ"}
                                    </button>
                                </div>
                            </div>

                            <div className="col-full map-container-wrapper">
                                <div className="map-header">
                                    <label>🗺️ Vị trí trên bản đồ:</label>
                                    {formData.latitude && formData.longitude && (
                                        <span className="map-coords">(Tọa độ: {formData.latitude}, {formData.longitude})</span>
                                    )}
                                </div>
                                <div className="map-canvas">
                                    <MapContainer center={currentPosition} zoom={15} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Marker position={currentPosition} />
                                        <ChangeMapCenter center={currentPosition} />
                                        <MapClickHandler />
                                    </MapContainer>
                                </div>
                                <p className="map-hint">💡 Mẹo: Kéo thả hoặc click trực tiếp trên bản đồ để ghim chọn vị trí chính xác nhất.</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Tiện ích */}
                    <section className="form-section">
                        <div className="section-header">
                            <FiZap className="icon-primary" />
                            <h2>Tiện ích có sẵn</h2>
                        </div>
                        <div className="amenities-grid">
                            {availableAmenities.map(amenity => (
                                <label key={amenity.id} className={`amenity-item ${selectedAmenities.includes(amenity.id) ? 'active' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedAmenities.includes(amenity.id)}
                                        onChange={() => handleAmenityChange(amenity.id)}
                                    />
                                    <span>{amenity.name}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Hình ảnh */}
                    <section className="form-section">
                        <div className="section-header">
                            <FiCamera className="icon-primary" />
                            <h2>Hình ảnh ({imageFiles.length}/8) <span className="required">*</span></h2>
                        </div>
                        <div className="upload-wrapper">
                            <label className="btn-upload">
                                <FiUpload size={18} /> Chọn ảnh tải lên
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
                            </label>

                            {imagePreviews.length > 0 && (
                                <div className="image-preview-grid">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="preview-box">
                                            <img src={preview} alt={`preview-${index}`} />
                                            <button type="button" onClick={() => handleRemoveImage(index)} className="btn-remove-img">
                                                <FiX size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section 4: Mô tả */}
                    <section className="form-section">
                        <div className="section-header">
                            <FiFileText className="icon-primary" />
                            <h2>Mô tả chi tiết</h2>
                        </div>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleInputChange}
                            placeholder="Mô tả chi tiết về phòng trọ của bạn (điện nước, giờ giấc, nội thất...)"
                            rows="6"
                            className="form-textarea"
                        />
                    </section>
                </div>

                {/* ================= CỘT PHẢI: GÓI DỊCH VỤ & NÚT SUBMIT ================= */}
                <div className="sidebar-column">
                    <div className="sticky-sidebar">

                        <section className="form-section package-section">
                            <div className="section-header">
                                <FiPackage className="icon-success" />
                                <h2>Gói Dịch Vụ</h2>
                            </div>
                            <p className="section-subtitle">Vui lòng chọn Gói đăng tin (bắt buộc) và Gói đẩy tin (tùy chọn).</p>

                            {loadingPackages ? (
                                <p className="loading-text">🔄 Đang đồng bộ thông tin gói cước...</p>
                            ) : (
                                <div className="package-groups">

                                    {/* Gói Đăng Tin */}
                                    <div className="package-group">
                                        <h3>1. Chọn Gói Đăng <span className="required">*</span></h3>
                                        {displayPostingPackages.length > 0 ? (
                                            <div className="package-list">
                                                {displayPostingPackages.map((pkg, index) => {
                                                    const isSelected = formData.postingTier === pkg.tier;
                                                    const hasAvailableSlots = pkg.userBalance > 0;
                                                    return (
                                                        <div
                                                            key={pkg.id || `post-${index}`}
                                                            onClick={() => hasAvailableSlots ? setFormData(prev => ({ ...prev, postingTier: pkg.tier })) : alert(`Gói đăng tin ${pkg.tier} đã hết. Vui lòng mua thêm!`)}
                                                            className={`package-card ${isSelected ? 'selected' : ''} ${!hasAvailableSlots ? 'disabled' : ''}`}
                                                        >
                                                            {isSelected && <span className="badge-selected">Đang chọn</span>}
                                                            <h4>{pkg.name || pkg.tier}</h4>
                                                            <p>Hiển thị: <strong>{pkg.activeDays || 30} ngày</strong></p>
                                                            <div className="package-footer">
                                                                <span>Kho của bạn:</span>
                                                                <span className={`status-badge ${hasAvailableSlots ? 'success' : 'danger'}`}>
                                                            {hasAvailableSlots ? `Còn ${pkg.userBalance} lượt` : 'Hết lượt'}
                                                        </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="alert-box danger">⚠️ Không có Gói Đăng Tin nào.</div>
                                        )}
                                    </div>

                                    {/* Gói Đẩy Tin */}
                                    <div className="package-group">
                                        <h3>2. Chọn Gói Đẩy (Tùy chọn)</h3>
                                        {myBoostingPackages.length > 0 ? (
                                            <div className="package-list">
                                                {myBoostingPackages.map((pkg, index) => {
                                                    const isSelected = formData.boostingTier === pkg.tier;
                                                    const hasAvailableSlots = pkg.userBalance > 0;
                                                    return (
                                                        <div
                                                            key={pkg.id || `boost-${index}`}
                                                            onClick={() => hasAvailableSlots ? setFormData(prev => ({ ...prev, boostingTier: isSelected ? '' : pkg.tier })) : alert(`Gói đẩy tin ${pkg.tier} đã hết. Vui lòng mua thêm!`)}
                                                            className={`package-card boost-card ${isSelected ? 'selected-boost' : ''} ${!hasAvailableSlots ? 'disabled' : ''}`}
                                                        >
                                                            {isSelected && <span className="badge-selected boost">Đang đẩy</span>}
                                                            <h4>{pkg.name || pkg.tier}</h4>
                                                            <p>Hiệu lực: <strong>{pkg.activeDays || 1} ngày</strong></p>
                                                            <div className="package-footer">
                                                                <span>Kho của bạn:</span>
                                                                <span className={`status-badge ${hasAvailableSlots ? 'boost' : 'danger'}`}>
                                                            {hasAvailableSlots ? `Còn ${pkg.userBalance} lượt` : 'Hết lượt'}
                                                        </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="alert-box warning">💡 Bạn không có gói đẩy tin nào trong kho.</div>
                                        )}
                                    </div>

                                </div>
                            )}
                        </section>
                    </div>
                </div>
                <div className="postr-form-actions">
                    <button type="submit" className="btn-submit-post">
                        HOÀN TẤT & ĐĂNG TIN
                    </button>
                </div>
            </form>
        </main>
    );
}

export default PostRoom;