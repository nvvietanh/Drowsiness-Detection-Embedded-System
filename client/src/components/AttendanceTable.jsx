import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AttendanceTable.css';

const AttendanceTable = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/attendances`);
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

  // Xử lý khi click vào một dòng
  const handleRowClick = (attendance) => {
    navigate('/attendance-detail', {
      state: {
        driver_id: attendance.driver_id,
        vehicle_id: attendance.vehicle_id,
        date: attendance.date
      }
    });
  };

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
                <tr
                  key={index}
                  onClick={() => handleRowClick(attendance)}
                  style={{ cursor: 'pointer' }}
                >
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