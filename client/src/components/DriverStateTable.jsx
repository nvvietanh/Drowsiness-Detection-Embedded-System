import React, { useState, useEffect } from 'react';
import './DriverStateTable.css';

const DriverStateTable = () => {
  const [driverStates, setDriverStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchDriverStates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/driver-states');
        if (!response.ok) throw new Error('Failed to fetch driver states');
        const data = await response.json();
        setDriverStates(data);
      } catch (err) {
        setDriverStates([]);
        setError('Không có dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchDriverStates();
  }, []);

  if (loading) return <div className="table-container">Đang tải...</div>;

  return (
    <div className="table-container">
      <h2 className="table-title">DANH SÁCH TRẠNG THÁI TÀI XẾ</h2>
      <div className="table-wrapper">
        <table className="driver-state-table">
          <thead>
            <tr>
              <th>Mã tài xế</th>
              <th>Mã xe</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {driverStates.length === 0 && error ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  {error}
                </td>
              </tr>
            ) : (
              driverStates.map((state, index) => (
                <tr key={index}>
                  <td>{state.driver_id}</td>
                  <td>{state.vehicle_id}</td>
                  <td>{state.timestamp}</td>
                  <td>{state.status}</td>
                  <td>{state.note}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverStateTable;