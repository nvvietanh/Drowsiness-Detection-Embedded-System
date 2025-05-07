import React, { useState, useEffect } from 'react';
import './DriverTable.css';

const DriverTable = () => {
  const [drivers, setDrivers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [formData, setFormData] = useState({
    driver_id: '',
    name: '',
    address: '',
    image_url: '',
    image_emb: [],
    phone_number: '',
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/drivers`);
        if (!response.ok) throw new Error('Failed to fetch drivers');
        const data = await response.json();
        // Lấy base64 cho tất cả ảnh của drivers
        const driversWithBase64 = await Promise.all(
          data.map(async (driver) => {
            if (driver.image_url) {
              const base64 = await fetchBase64Image(driver.image_url);
              return { ...driver, image_base64: base64 };
            }
            return driver;
          })
        );
        setDrivers(driversWithBase64);
      } catch (err) {
        setDrivers([]);
        setError('Không có dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const fetchBase64Image = async (imageUrl) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: imageUrl }),
      });
      if (!response.ok) throw new Error('Failed to fetch image');
      const data = await response.json();
      if (!data.image_base64) throw new Error('Invalid image data');
      // Thêm tiền tố để sử dụng trong thẻ img
      return `data:image/jpeg;base64,${data.image_base64}`;
    } catch (err) {
      console.error('Error fetching base64 image:', err);
      return null;
    }
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      driver_id: '',
      name: '',
      address: '',
      image_url: '',
      image_emb: [],
      phone_number: '',
      image: null,
    });
  };

  const handleEditClick = (driver) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentDriver(driver);
    setFormData({ ...driver, image: null });
  };

  const handleDeleteClick = async (driver_id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/drivers/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driver_id: driver_id }),
        });
        if (!response.ok) throw new Error('Failed to delete driver');
        setDrivers(drivers.filter((driver) => driver.driver_id !== driver_id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone_number', formData.phone_number);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (isEditMode) {
        formDataToSend.append('driver_id', formData.driver_id);
      }

      const url = isEditMode
        ? `${process.env.REACT_APP_API_URL}/drivers/update`
        : `${process.env.REACT_APP_API_URL}/drivers/add`;

      const response = await fetch(url, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Failed to process driver');
      }

      let updatedDriver = { ...formData, driver_id: result.driver_id || formData.driver_id };
      if (result.image_url) {
        updatedDriver.image_base64 = await fetchBase64Image(result.image_url);
        updatedDriver.image_url = result.image_url;
      }

      if (isEditMode) {
        setDrivers(
          drivers.map((driver) =>
            driver.driver_id === currentDriver.driver_id
              ? { ...driver, ...updatedDriver }
              : driver
          )
        );
      } else {
        setDrivers([...drivers, updatedDriver]);
      }

      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (loading) return <div className="table-container">Đang tải...</div>;

  return (
    <div className="table-container">
      <h2 className="table-title">DANH SÁCH TÀI XẾ</h2>
      <button className="add-btn" onClick={handleAddClick}>
        Thêm
      </button>
      {error && <div className="error-message">{error}</div>}
      <div className="table-wrapper">
        <table className="driver-table">
          <thead>
            <tr>
              <th>Mã tài xế</th>
              <th>Tên tài xế</th>
              <th>Địa chỉ</th>
              <th>Ảnh</th>
              <th>Số điện thoại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 && error ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  {error}
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.driver_id}>
                  <td>{driver.driver_id}</td>
                  <td>{driver.name}</td>
                  <td>{driver.address}</td>
                  <td>
                    {driver.image_base64 ? (
                      <img src={driver.image_base64} alt="Driver" style={{ height: '100px', width:'auto'}} />
                    ) : (
                      'No image'
                    )}
                  </td>
                  <td>{driver.phone_number}</td>
                  <td>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditClick(driver)}
                    >
                      Sửa
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteClick(driver.driver_id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isEditMode ? 'Sửa tài xế' : 'Thêm tài xế'}</h3>
            <form onSubmit={handleFormSubmit}>
              {isEditMode && (
                <div className="form-group">
                  <label>Mã tài xế</label>
                  <input
                    type="text"
                    name="driver_id"
                    value={formData.driver_id}
                    disabled
                  />
                </div>
              )}
              <div className="form-group">
                <label>Tên tài xế</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ảnh</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFormChange}
                  required={!isEditMode}
                />
                {isEditMode && currentDriver?.image_base64 && (
                  <img src={currentDriver.image_base64} alt="Current" style={{ width: '100px', height: '100px' }} />
                )}
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditMode ? 'Cập nhật' : 'Thêm'}
                </button>
                <button type="button" className="cancel-btn" onClick={handleModalClose}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTable;