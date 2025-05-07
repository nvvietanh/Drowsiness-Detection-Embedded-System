import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Box, Grid, Typography, Paper, Button } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { useSocket } from "../context/SocketContext"; // Import hook từ context
import { io } from "socket.io-client";
import { Polyline } from "react-leaflet/Polyline"; // Import Polyline từ react-leaflet

// Tọa độ ví dụ: Sài Gòn
const position = [10.762622, 106.660172];

const imageUrls = [
  "http://localhost:5000/video_feed",
  // "https://via.placeholder.com/400x250?text=Frame+2",
  // "https://via.placeholder.com/400x250?text=Frame+3",
];

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

const FrameStreamWithLeaflet = () => {

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
        const response = await axios.get("http://127.0.0.1:5000/coordinate");
        const { lat, lng } = response.data;
        console.log("Received coords:", { lat, lng });
        setCoords([lat, lng]); // Cập nhật vị trí
        setPath((prevPath) => {
          const updatedPath = [...prevPath, { lat, lng }];
          if (updatedPath.length > 20) {
            updatedPath.shift(); // Giới hạn danh sách ở 20 phần tử
          }
          return updatedPath;
        });
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
            <Typography variant="h6" gutterBottom>
              Camera
            </Typography>
            {imageUrls.map((url, index) => (
              <Box key={index} mb={2}>
                <img
                  src={url}
                  alt={`Frame ${index + 1}`}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </Box>
            ))}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  title="Phát hiện buồn ngủ sử dụng MediaPipe"
                  onClick={() => {
                    axios.get(`${vehicle.vehicle_ip}/change_mode/1`)
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
                    axios.get(`${vehicle.vehicle_ip}:5000/change_mode/2`)
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
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  title="Phát hiện buồn ngủ sử dụng Dlib"
                  onClick={() => {
                    axios.get(`${vehicle.vehicle_ip}:5000/change_mode/3`)
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
            </Grid>

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
              {/* Hiển thị tọa độ hiện tại bằng Marker */}
              <Marker position={coords}>
                <Popup>Vị trí hiện tại: Vĩ độ {coords[0]}, Kinh độ {coords[1]}</Popup>
              </Marker>

              {/* Hiển thị các tọa độ cũ bằng CircleMarker */}
              {path.map((coord, index) => (
                <CircleMarker
                  key={index}
                  center={[coord.lat, coord.lng]}
                  radius={2} // Kích thước dấu chấm
                  color="blue" // Màu viền
                  fillColor="blue" // Màu nền
                  fillOpacity={0.8} // Độ trong suốt
                >
                  <Popup >
                    Vĩ độ: {coord.lat}, Kinh độ: {coord.lng}
                  </Popup>
                </CircleMarker>
              ))}
              <Polyline
                positions={path.map(coord => [coord.lat, coord.lng])} // Chuyển đổi tọa độ thành định dạng [lat, lng]
                color="pink" // Màu đường vẽ
                weight={1} // Độ dày của đường vẽ
                opacity={0.8} // Độ trong suốt
              />
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FrameStreamWithLeaflet;
