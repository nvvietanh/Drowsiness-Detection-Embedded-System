import React from 'react';
import './AttendanceTable.css';

const AttendanceTable = () => {
  const attendances = [
    { driver_id: 1, vehicle_id: 101, date: '2025-05-03', checkin_time: '08:00', checkout_time: '17:00', note: 'On time' },
    { driver_id: 2, vehicle_id: 102, date: '2025-05-03', checkin_time: '08:15', checkout_time: '17:30', note: 'Late 15min' },
    { driver_id: 3, vehicle_id: 103, date: '2025-05-03', checkin_time: '07:45', checkout_time: '16:45', note: 'Early leave' },
  ];

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
            {attendances.map((attendance, index) => (
              <tr key={index}>
                <td>{attendance.driver_id}</td>
                <td>{attendance.vehicle_id}</td>
                <td>{attendance.date}</td>
                <td>{attendance.checkin_time}</td>
                <td>{attendance.checkout_time}</td>
                <td>{attendance.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;