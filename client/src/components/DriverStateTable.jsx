import React, { useState, useEffect } from 'react';
import './DriverStateTable.css';

const DriverStateTable = () => {
  const [driverStates, setDriverStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm lấy base64 của hình ảnh từ image_url
  const fetchBase64Image = async (imageUrl) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/get_image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: imageUrl }),
      });
      if (!response.ok) throw new Error('Failed to fetch image');
      const data = await response.json();
      if (!data.image_base64) throw new Error('Invalid image data');
      return `data:image/jpeg;base64,${data.image_base64}`;
    } catch (err) {
      console.error('Error fetching base64 image:', err);
      return null;
    }
  };

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchDriverStates = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/driver_states`);
        if (!response.ok) throw new Error('Failed to fetch driver states');
        const data = await response.json();

        // Lấy base64 cho tất cả hình ảnh của driver states
        const statesWithBase64 = await Promise.all(
          data.map(async (state) => {
            if (state.image_url) {
              const base64 = await fetchBase64Image(state.image_url);
              return { ...state, image_base64: base64 };
            }
            return state;
          })
        );
        setDriverStates(statesWithBase64);
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
              <th>Hình ảnh</th>
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
                  <td>
                    {state.image_base64 ? (
                      <img src={state.image_base64} alt="Driver State" style={{ height: '100px', width: 'auto' }} />
                    ) : (
                      'No image'
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

export default DriverStateTable;