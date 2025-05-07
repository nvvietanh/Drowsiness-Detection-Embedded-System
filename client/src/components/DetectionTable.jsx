import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./DetectionTable.css"; // Tạo file CSS để định dạng
import xe_tai from "../assets/images/xe-tai-jac-n680-may-duc_aba34ae2403e4f608ba75c7cef339f5d_master.webp"; // Hình ảnh xe tải

const DetectionTable = ({ setCurrentView }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleClick = (vehicle) => {
    navigate(`/vehicle/${vehicle.vehicle_id}`, { state: vehicle }); // Điều hướng đến trang chi tiết xe
    // setCurrentView("Quản lý xe"); // Cập nhật view hiện tại
  };

  // Dữ liệu mẫu cho bảng
  // useEffect(() => {
    
  // }, []);

  // Gọi API để lấy dữ liệu từ server
  useEffect(() => {
    const fetchVehicles = async () => {

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`);
        if (response.ok) {
          // throw new Error("Không thể lấy dữ liệu từ server");
          const data = await response.json();
          setVehicles(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const sampleData = [
      {
        vehicle_id: 1,
        license_plate: "29A-123.45",
        vehicle_ip: "http://26.254.107.153:5000"
      },
      {
        vehicle_id: 2,
        license_plate: "30B-678.90",
        // image_url: "https://via.placeholder.com/150",
        vehicle_ip: "http://26.254.107.153:5000"
      },
      // Thêm dữ liệu mẫu khác nếu cần
    ];
    setVehicles([...sampleData, ...vehicles]);

    fetchVehicles();
  }, []);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="vehicle-grid">
      {vehicles.map((vehicle) => (
        <div 
          key={vehicle.vehicle_id} 
          className="vehicle-card" 
          onClick={() => handleClick(vehicle)}>
          <img
            src={vehicle.image_url || xe_tai}
            alt={`Vehicle ${vehicle.vehicle_id}`}
            className="vehicle-image"
            
          />
          <div className="vehicle-info">
            <p><strong>ID Xe:</strong> {vehicle.vehicle_id}</p>
            <p><strong>Biển số:</strong> {vehicle.license_plate}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetectionTable;