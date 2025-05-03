import React, { useState } from 'react';
import './DriverTable.css';

const DriverTable = () => {
  const [drivers, setDrivers] = useState([
    { driver_id: 1, name: 'Nguyễn Văn A', address: '123 Đường Láng, Hà Nội', image_url: 'url1', image_emb: [], phone_number: '0123456789' },
    { driver_id: 2, name: 'Trần Thị B', address: '456 Nguyễn Trãi, TP.HCM', image_url: 'url2', image_emb: [], phone_number: '0987654321' },
    { driver_id: 3, name: 'Lê Văn C', address: '789 Lê Lợi, Đà Nẵng', image_url: 'url3', image_emb: [], phone_number: '0912345678' },
  ]);

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

  const handleDeleteClick = (driver_id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài xế này?')) {
      setDrivers(drivers.filter((driver) => driver.driver_id !== driver_id));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      setDrivers(
        drivers.map((driver) =>
          driver.driver_id === currentDriver.driver_id ? { ...formData } : driver
        )
      );
    } else {
      setDrivers([...drivers, { ...formData, driver_id: drivers.length + 1, image_emb: [] }]);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

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
            {drivers.map((driver) => (
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
            ))}
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