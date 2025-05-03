import React from 'react';
import './DriverStateTable.css';

const DriverStateTable = () => {
  const driverStates = [
    { driver_id: 1, vehicle_id: 101, timestamp: '2025-05-03 08:00', status: 'Hoạt động', note: 'Đang giao hàng' },
    { driver_id: 2, vehicle_id: 102, timestamp: '2025-05-03 08:15', status: 'Nghỉ', note: 'Tạm nghỉ 30 phút' },
    { driver_id: 3, vehicle_id: 103, timestamp: '2025-05-03 07:45', status: 'Không hoạt động', note: 'Xe bảo trì' },
  ];

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
            {driverStates.map((state, index) => (
              <tr key={index}>
                <td>{state.driver_id}</td>
                <td>{state.vehicle_id}</td>
                <td>{state.timestamp}</td>
                <td>{state.status}</td>
                <td>{state.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverStateTable;