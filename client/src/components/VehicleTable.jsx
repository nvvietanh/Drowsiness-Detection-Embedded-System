import React, { useState, useEffect } from 'react';
import './VehicleTable.css';

const VehicleTable = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_id: '',
    license_plate: '',
    vehicle_type: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vehicles');
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        setVehicles(data);
      } catch (err) {
        setVehicles([]);
        setError('Không có dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

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

  const handleDeleteClick = async (vehicle_id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/vehicles/${vehicle_id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete vehicle');
        setVehicles(vehicles.filter((vehicle) => vehicle.vehicle_id !== vehicle_id));
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
        const response = await fetch(`http://localhost:5000/api/vehicles/${currentVehicle.vehicle_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to update vehicle');
        const updatedVehicle = await response.json();
        setVehicles(vehicles.map((vehicle) => (vehicle.vehicle_id === currentVehicle.vehicle_id ? updatedVehicle : vehicle)));
      } else {
        const response = await fetch('http://localhost:5000/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error('Failed to add vehicle');
        const newVehicle = await response.json();
        setVehicles([...vehicles, newVehicle]);
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
            {vehicles.length === 0 && error ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  {error}
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
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
              ))
            )}
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