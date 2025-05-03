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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/drivers');
        if (!response.ok) throw new Error('Failed to fetch drivers');
        const data = await response.json();
        setDrivers(data);
      } catch (err) {
        setDrivers([]);
        setError('Không có dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const handleAddClick = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({ driver_id: '', name: '', address: '', image_url: '', image_emb: [], phone_number: '' });
  };

  const handleEditClick = (driver) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentDriver(driver);
    setFormData(driver);
  };

  const handleDeleteClick = async (driver_id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/drivers/${driver_id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete driver');
        setDrivers(drivers.filter((driver) => driver.driver_id !== driver_id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const response = await fetch(`http://localhost:5000/api/drivers/${currentDriver.driver_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to update driver');
        const updatedDriver = await response.json();
        setDrivers(drivers.map((driver) => (driver.driver_id === currentDriver.driver_id ? updatedDriver : driver)));
      } else {
        const response = await fetch('http://localhost:5000/api/drivers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to add driver');
        const newDriver = await response.json();
        setDrivers([...drivers, newDriver]);
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
      <div className="table-wrapper">
        <table className="driver-table">
          <thead>
            <tr>
              <th>Mã tài xế</th>
              <th>Tên tài xế</th>
              <th>Địa chỉ</th>
              <th>URL hình ảnh</th>
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
                  <td>{driver.image_url}</td>
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
                <label>URL hình ảnh</label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleFormChange}
                />
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