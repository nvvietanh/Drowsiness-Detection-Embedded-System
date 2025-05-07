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
    vehicle_ip: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`);
        if (!response.ok) throw new Error('Failed to fetch vehicles');
        const data = await response.json();
        console.log('Vehicles from API:', data); // Debug dữ liệu từ backend
        const formattedData = data.map(vehicle => ({
          vehicle_id: vehicle.vehicle_id, // Sử dụng vehicle_id (số) thay vì _id
          license_plate: vehicle.license_plate,
          vehicle_type: vehicle.vehicle_type,
          vehicle_ip: vehicle.vehicle_ip || '',
        }));
        setVehicles(formattedData);
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
    setFormData({ vehicle_id: '', license_plate: '', vehicle_type: '', vehicle_ip: '' });
  };

  const handleEditClick = (vehicle) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentVehicle(vehicle);
    setFormData({ ...vehicle });
  };

  const handleDeleteClick = async (vehicle_id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicle_id: vehicle_id }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to delete vehicle');
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
      const payload = {
        license_plate: formData.license_plate,
        vehicle_type: formData.vehicle_type,
        vehicle_ip: formData.vehicle_ip,
      };

      if (isEditMode) {
        payload.vehicle_id = formData.vehicle_id;
      }

      const url = isEditMode
        ? `${process.env.REACT_APP_API_URL}/vehicles/update`
        : `${process.env.REACT_APP_API_URL}/vehicles/add`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('Response from add/update:', result); // Debug response
      if (!response.ok || result.error) {
        throw new Error(result.error || result.message || 'Failed to process vehicle');
      }

      let updatedVehicle = {
        vehicle_id: isEditMode ? formData.vehicle_id : result.vehicle_id, // Sử dụng vehicle_id từ response khi thêm
        license_plate: formData.license_plate,
        vehicle_type: formData.vehicle_type,
        vehicle_ip: formData.vehicle_ip,
      };

      if (isEditMode) {
        setVehicles(
          vehicles.map((vehicle) =>
            vehicle.vehicle_id === currentVehicle.vehicle_id ? { ...vehicle, ...updatedVehicle } : vehicle
          )
        );
      } else {
        setVehicles([...vehicles, updatedVehicle]);
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
      {error && <div className="error-message">{error}</div>}
      <div className="table-wrapper">
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Mã xe</th>
              <th>Biển số</th>
              <th>Loại xe</th>
              <th>Vehicle IP</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 && error ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  {error}
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.vehicle_id}>
                  <td>{vehicle.vehicle_id}</td>
                  <td>{vehicle.license_plate}</td>
                  <td>{vehicle.vehicle_type}</td>
                  <td>{vehicle.vehicle_ip || 'N/A'}</td>
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
              {isEditMode && (
                <div className="form-group">
                  <label>Mã xe</label>
                  <input
                    type="text"
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    disabled
                  />
                </div>
              )}
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
              <div className="form-group">
                <label>Vehicle IP</label>
                <input
                  type="text"
                  name="vehicle_ip"
                  value={formData.vehicle_ip}
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