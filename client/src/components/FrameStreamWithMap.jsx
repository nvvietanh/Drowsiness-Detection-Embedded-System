import React, { useEffect, useRef } from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Tọa độ ví dụ: Sài Gòn
const position = [10.762622, 106.660172];

const imageUrls = [
  "http://localhost:5000/video_feed",
  "https://via.placeholder.com/400x250?text=Frame+2",
  "https://via.placeholder.com/400x250?text=Frame+3",
];

// Hook này giúp gọi invalidateSize để bản đồ load đúng
const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const FrameStreamWithLeaflet = () => {

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
    <Box p={2} sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Giám sát bằng Camera & Bản đồ (Leaflet)
      </Typography>

      <Grid container spacing={2} sx={{ width: "100%" }}>
        {/* Luồng hình ảnh */}
        <Grid item xs={12} md={6} sx={{ width: "40%" }}>
          <Paper sx={{ height: "100%", p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Luồng hình ảnh
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
          </Paper>
        </Grid>

        {/* Bản đồ Leaflet */}
        <Grid item xs={12} md={6} sx={{ width: "50%" }}>
          <Paper sx={{ height: "100%", p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vị trí trên bản đồ
            </Typography>
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: "600px", width: "100%", borderRadius: "8px" }}
            >
              <ResizeMap />
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>Vị trí đang giám sát</Popup>
              </Marker>
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FrameStreamWithLeaflet;
