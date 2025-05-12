import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AttendanceDetailTable.css';

const AttendanceDetailTable = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { driver_id, date, folder_path } = location.state || {};
        if (!driver_id || !date || !folder_path) {
          throw new Error('Missing required parameters');
        }

        // Gọi API /get_images_by_path với folder_path
        const response = await fetch('http://26.162.56.36:5000/get_images_by_path', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            image_folder: folder_path
          })
        });

        if (!response.ok) throw new Error('Failed to fetch images');
        const data = await response.json();

        // Tạo dữ liệu hiển thị với driver_id và date từ state
        const formattedData = data.map(item => ({
          driver_id,
          date,
          time: item.time,
          image_base64: `data:image/jpeg;base64,${item.image_base64}`
        }));

        setAttendances(formattedData);
      } catch (err) {
        setAttendances([]);
        setError('Không có dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
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
              <th>Ngày</th>
              <th>Thời gian</th>
              <th>Hình ảnh</th>
            </tr>
          </thead>
          <tbody>
            {attendances.length === 0 && error ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  {error}
                </td>
              </tr>
            ) : (
              attendances.map((attendance, index) => (
                <tr key={index}>
                  <td>{attendance.driver_id}</td>
                  <td>{attendance.date}</td>
                  <td>{attendance.time}</td>
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