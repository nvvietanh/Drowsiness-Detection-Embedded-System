import React, { useState, useEffect } from 'react';
import './AttendanceTable.css';

const AttendanceTable = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/attendances');
        if (!response.ok) throw new Error('Failed to fetch attendances');
        const data = await response.json();
        setAttendances(data);
      } catch (err) {
        setAttendances([]);
        setError('Không có dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, []);

  if (loading) return <div className="table-container">Đang tải...</div>;

  return (
    <div className="table-container">
      <h2 className="table-title">DANH SÁCH CHẤM CÔNG</h2>
      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Mã tài xế</th>
              <th>Mã xe</th>
              <th>Ngày</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 && error ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  {error}
                </td>
              </tr>
            ) : (
              attendances.map((attendance, index) => (
                <tr key={index}>
                  <td>{attendance.driver_id}</td>
                  <td>{attendance.vehicle_id}</td>
                  <td>{attendance.date}</td>
                  <td>{attendance.checkin_time}</td>
                  <td>{attendance.checkout_time}</td>
                  <td>{attendance.note}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;