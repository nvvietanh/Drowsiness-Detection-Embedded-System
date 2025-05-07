import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AttendanceDetailTable.css';

const AttendanceDetailTable = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Hàm chuyển đổi URL hình ảnh thành base64
  const fetchBase64Image = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching image:', error);
      return '';
    }
  };

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const { driver_id, vehicle_id, date } = location.state || {};
        if (!driver_id || !vehicle_id || !date) {
          throw new Error('Missing required parameters');
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/attendances`);
        if (!response.ok) throw new Error('Failed to fetch attendances');
        const data = await response.json();

        // Lọc dữ liệu dựa trên driver_id, vehicle_id và date
        const filteredData = data.filter(
          (attendance) =>
            attendance.driver_id === driver_id &&
            attendance.vehicle_id === vehicle_id &&
            attendance.date === date
        );

        // Lấy base64 cho tất cả hình ảnh của driver states
        const statesWithBase64 = await Promise.all(
          filteredData.map(async (state) => {
            if (state.image_url) {
              const base64 = await fetchBase64Image(state.image_url);
              return { ...state, image_base64: base64 };
            }
            return state;
          })
        );
        setAttendances(statesWithBase64);
      } catch (err) {
        setAttendances([]);
        setError('Không có dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendances();
  }, [location.state]);

  if (loading) return <div className="table-container">Đang tải...</div>;

  return (
    <div className="table-container">
      <h2 className="table-title">CHI TIẾT CHẤM CÔNG</h2>
      <div className="table-wrapper">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Mã tài xế</th>
              <th>Mã xe</th>
              <th>Ngày</th>
              <th>Thời gian</th>
              <th>Hình ảnh</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 && error ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  {error}
                </td>
              </tr>
            ) : (
              attendances.map((attendance, index) => (
                <tr key={index}>
                  <td>{attendance.driver_id}</td>
                  <td>{attendance.vehicle_id}</td>
                  <td>{attendance.date}</td>
                  <td>{attendance.time || `${attendance.checkin_time} - ${attendance.checkout_time}`}</td>
                  <td>
                    {attendance.image_base64 ? (
                      <img
                        src={attendance.image_base64}
                        alt="Attendance"
                        style={{ width: '100px', height: 'auto' }}
                      />
                    ) : (
                      'Không có hình ảnh'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDetailTable;