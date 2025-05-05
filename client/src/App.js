import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import logo from './logo.svg';
import './App.css';
import FrameStreamWithMap from './components/FrameStreamWithMap';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AttendanceTable from './components/AttendanceTable';
import DriverStateTable from './components/DriverStateTable';
import DriverTable from './components/DriverTable';
import VehicleTable from './components/VehicleTable';
import DetectionTable from './components/DetectionTable';
import LocationTable from './components/LocationTable';
import LocationWithLeaflet from './components/LocationWithMap';

function App() {
  const [currentView, setCurrentView] = useState('FrameStreamWithMap');

  const renderContent = () => {
    switch (currentView) {
      case 'Giám sát':
        return <DetectionTable />;

      case 'Chấm công':
        return <AttendanceTable />;
      case 'Quản lý trạng thái xe':
        return <DriverStateTable />;
      case 'Quản lý tài xế':
        return <DriverTable />;
      case 'Quản lý xe':
        return <VehicleTable />;
      default:
        return <FrameStreamWithMap />;
    }
  };

  return (
    <Router>
      <div>
        <Navbar />
        <div className="main-layout">
          {/* <Sidebar onButtonClick={(button) => setCurrentView(button)} currentView={currentView} /> */}
          <Sidebar />
          {/* <div className="content">{renderContent()}</div> */}
          <div className="content" >
            {/* <Router> */}
              <Routes>
                <Route path="/" element={<DetectionTable />} />
                <Route path="/frame-stream" element={<FrameStreamWithMap />} />
                <Route path="/attendance" element={<AttendanceTable />} />
                <Route path="/location-management" element={<LocationTable />} />
                <Route path="/driver-state" element={<DriverStateTable />} />
                <Route path="/driver" element={<DriverTable />} />
                <Route path="/vehicle" element={<VehicleTable />} />
                <Route path="/vehicle/:vehicleId/location" element={<LocationWithLeaflet />} />
                <Route path="/vehicle/:vehicleId" element={<FrameStreamWithMap />} />
                {/* <Route path="/detection" element={<DetectionTable />} /> */}
              </Routes>
            {/* </Router> */}
          </div>
        </div>
      </div>
    </Router>
    
  );
}

export default App;