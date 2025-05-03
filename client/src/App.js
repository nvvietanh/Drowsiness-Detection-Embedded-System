import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import FrameStreamWithMap from './components/FrameStreamWithMap';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AttendanceTable from './components/AttendanceTable';
import DriverStateTable from './components/DriverStateTable';
import DriverTable from './components/DriverTable';
import VehicleTable from './components/VehicleTable';

function App() {
  const [currentView, setCurrentView] = useState('FrameStreamWithMap');

  const renderContent = () => {
    switch (currentView) {
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
    <div>
      <Navbar />
      <div className="main-layout">
        <Sidebar onButtonClick={(button) => setCurrentView(button)} currentView={currentView} />
        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;