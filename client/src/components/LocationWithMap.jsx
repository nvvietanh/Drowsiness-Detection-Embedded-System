import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Box, Grid, Typography, Paper, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { useSocket } from "../context/SocketContext"; // Import hook từ context
import { io } from "socket.io-client";
import { Polyline } from "react-leaflet/Polyline"; // Import Polyline từ react-leaflet

// Tọa độ ví dụ: Sài Gòn
const position = [10.762622, 106.660172];

const UpdateMapView = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom()); // Di chuyển bản đồ đến vị trí mới
    }
  }, [coords, map]);

  return null;
};

// Hook này giúp gọi invalidateSize để bản đồ load đúng
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const LocationWithLeaflet = () => {

  const location = useLocation(); // Lấy dữ liệu từ state
  const { vehicleId } = useParams(); // Lấy vehicleId từ URL
  const vehicle = location.state; // Dữ liệu xe được truyền qua state

  const socket = useSocket(); // Sử dụng hook để lấy socket từ context
  const [coords, setCoords] = useState(position);
  const [path, setPath] = useState([]); // Lưu danh sách tọa độ

  // useEffect(() => {
  //   if (!socket) {
  //     console.log("Socket is not initialized");
  //     return;
  //   }
  
  //   console.log("Listening for coord events");

  //   // const socket = io("http://127.0.0.1:5000", {
  //   //       transports: ["websocket", "polling"],
  //   //     }); // Thay URL bằng địa chỉ server của bạn

  //   // Lắng nghe sự kiện "coord"
  //   socket.on("coord", (newCoords) => {
  //     console.log("Received coords:", newCoords);
  //     setCoords(newCoords); // Cập nhật vị trí
  //   });

  //   return () => {
  //     console.log("Cleaning up coord listener");
  //     socket.off("coord"); // Dọn dẹp sự kiện khi component unmount
  //   };
  // }, [socket]);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/vehicle/${vehicle.vehicle_id}/coordinates/?quantity=20`);
        const newCoords = response.data; // Response trả về mảng [{ lat, lng, time,... }, ...]
        
        setPath((prevPath) => {
          const updatedPath = [...prevPath, ...newCoords]; // Thêm tọa độ mới vào danh sách
          if (updatedPath.length > 20) {
            return updatedPath.slice(-20); // Giữ lại 20 phần tử cuối cùng
          }
          return updatedPath;
        });

        // Cập nhật tọa độ hiện tại (tọa độ cuối cùng trong danh sách)
        if (newCoords.length > 0) {
          setCoords([newCoords[newCoords.length - 1].lat, newCoords[newCoords.length - 1].lng]);
        }
      } catch (error) {
        console.error("Error fetching coords:", error);
      }
    };

    // Gửi request mỗi 2 giây
    const intervalId = setInterval(fetchCoords, 2000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Khắc phục lỗi icon bị mất khi tải lại trang
    const customIcon = new L.Icon({
      iconUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f8/PinS.png", // URL của icon tùy chỉnh
      iconSize: [32, 32], // Kích thước của icon
      iconAnchor: [16, 32], // Điểm neo của icon (giúp marker chính xác hơn)
      popupAnchor: [0, -32], // Định vị vị trí popup so với marker
    });
    
    // Đảm bảo icon được áp dụng đúng cách
    L.Marker.prototype.options.icon = customIcon;

    return () => {
      // Dọn dẹp khi component bị unmount
      L.Marker.prototype.options.icon = undefined;
    };
  }, []);

  return (
    <Box p={2} sx={{ width: "100%", height: "50vh" }}>
      <Typography variant="h6">
        Biển số: {vehicle.license_plate}
      </Typography>

      <Grid container spacing={2} sx={{ width: "100%"}}>
        {/* Luồng hình ảnh */}
        <Grid item xs={12} md={6} sx={{ width: "40%", height: "100%" }}>
          <Paper sx={{ height: "100%", p: 2 }}>
            {/* <Typography variant="h6" gutterBottom>
              Camera
            </Typography> */}
            {/* {imageUrls.map((url, index) => (
              <Box key={index} mb={2}>
                <img
                  src={url}
                  alt={`Frame ${index + 1}`}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </Box>
            ))} */}

            {/* <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  title="Phát hiện buồn ngủ sử dụng MediaPipe"
                  onClick={() => {
                    axios.get("http://127.0.0.1:5000/change_mode/1")
                    .then((response) => {
                      console.log("Response:", response.data);
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                    });
                    
                    }}
                  sx={{ width: "100%" }}
                >Sử dụng MediaPipe</Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  title="Phát hiện buồn ngủ sử dụng Dlib"
                  onClick={() => {
                    axios.get("http://127.0.0.1:5000/change_mode/2")
                    .then((response) => {
                      console.log("Response:", response.data);
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                    });
                    
                    }}
                  sx={{ width: "100%" }}
                >Sử dụng Dlib</Button>
              </Grid>
            </Grid> */}

            {/* Danh sách vị trí */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Danh sách tọa độ
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Vĩ độ</strong></TableCell>
                    <TableCell><strong>Kinh độ</strong></TableCell>
                    <TableCell><strong>Thời gian</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {path.map((coord, index) => (
                    <TableRow key={index}>
                      <TableCell>{coord.lat}</TableCell>
                      <TableCell>{coord.lng}</TableCell>
                      <TableCell>{coord.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

          </Paper>
        </Grid>

        {/* Bản đồ Leaflet */}
        <Grid item xs={12} md={6} sx={{ width: "50%", height: "100%" }}>
          <Paper sx={{ height: "100%", p: 2}}>
            <Typography variant="h6" gutterBottom>
              Vị trí trên bản đồ
            </Typography>
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: "60vh", width: "100%", borderRadius: "8px" }}
              // height="100px"
            >
              <ResizeMap />
              <UpdateMapView coords={coords} />
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                height="100px"
              />
              <Marker position={coords}>
                <Popup>Vị trí đang giám sát</Popup>
              </Marker>
              <Polyline positions={path} color="blue" />
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationWithLeaflet;
