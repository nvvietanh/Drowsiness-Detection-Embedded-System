import React, { useState } from 'react';
import './VehicleTable.css';

const VehicleTable = () => {
  const [vehicles, setVehicles] = useState([
    { vehicle_id: 1, license_plate: '29A-12345', vehicle_type: 'Xe tải' },
    { vehicle_id: 2, license_plate: '51H-67890', vehicle_type: 'Xe khách' },
    { vehicle_id: 3, license_plate: '30F-45678', vehicle_type: 'Xe container' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    license_plate: '',
    vehicle_type: '',
  });

  const handleAddClick = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({ vehicle_id: '', license_plate: '', vehicle_type: '' });
  };

  const handleEditClick = (vehicle) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentVehicle(vehicle);
    setFormData(vehicle);
  };

  const handleDeleteClick = (vehicle_id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      setVehicles(vehicles.filter((vehicle) => vehicle.vehicle_id !== vehicle_id));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.vehicle_id === currentVehicle.vehicle_id ? { ...formData } : vehicle
        )
      );
    } else {
      setVehicles([...vehicles, { ...formData, vehicle_id: vehicles.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="table-container">
      <h2 className="table-title">DANH SÁCH XE</h2>
      <button className="add-btn" onClick={handleAddClick}>
        Thêm
      </button>
      <div className="table-wrapper">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Mã xe</th>
              <th>Biển số</th>
              <th>Loại xe</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.vehicle_id}>
                <td>{vehicle.vehicle_id}</td>
                <td>{vehicle.license_plate}</td>
                <td>{vehicle.vehicle_type}</td>
                <td>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditClick(vehicle)}
                  >
                    Sửa
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteClick(vehicle.vehicle_id)}
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
            <h3>{isEditMode ? 'Sửa xe' : 'Thêm xe'}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Biển số</label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại xe</label>
                <input
                  type="text"
                  name="vehicle_type"
                  value={formData.vehicle_type}
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

export default VehicleTable;