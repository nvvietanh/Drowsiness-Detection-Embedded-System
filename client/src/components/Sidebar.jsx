import React from 'react';
import { NavLink } from 'react-router-dom'; 
import './Sidebar.css';
import { Button, Typography } from '@mui/material';

export default function Sidebar({ onButtonClick, currentView }) {

  const urls = [
    { label: 'Giám sát', path: '/' },
    { label: 'Chấm công', path: '/attendance' },
    { label: 'Quản lý vị trí', path: '/location-management' },
    { label: 'Quản lý trạng thái xe', path: '/driver-state' },
    { label: 'Quản lý tài xế', path: '/driver' },
    { label: 'Quản lý xe', path: '/vehicle' },
  ];

  return (
    <div className="sidebar">
      {/* <button className={`btn ${currentView === 'Giám sát' ? 'cyan' : 'pink'}`} onClick={() => onButtonClick('Giám sát')}>
        Giám sát
      </button>
      <button className={`btn ${currentView === 'Chấm công' ? 'cyan' : 'pink'}`} onClick={() => onButtonClick('Chấm công')}>
        Chấm công
      </button>
      <button className={`btn ${currentView === 'Quản lý vị trí' ? 'cyan' : 'pink'}`} onClick={() => onButtonClick('Quản lý vị trí')}>
        Quản lý vị trí
      </button>
      <button className={`btn ${currentView === 'Quản lý trạng thái xe' ? 'cyan' : 'pink'}`} onClick={() => onButtonClick('Quản lý trạng thái xe')}>
        Quản lý trạng thái xe
      </button>
      <button className={`btn ${currentView === 'Quản lý tài xế' ? 'cyan' : 'pink'}`} onClick={() => onButtonClick('Quản lý tài xế')}>
        Quản lý tài xế
      </button>
      <button className={`btn ${currentView === 'Quản lý xe' ? 'cyan' : 'pink'}`} onClick={() => onButtonClick('Quản lý xe')}>
        Quản lý xe
      </button> */}
      {urls.map((url) => (
        // <Button
        //   key={url.label}
        //   component={NavLink}
        //   to={url.path}
        //   className={`btn ${currentView === url.label ? 'cyan' : 'pink'}`}
        //   onClick={() => onButtonClick(url.label)}
        //   sx={{ width: '100%', marginBottom: '10px', textTransform: 'none' }}
        // >
        //   {url.label}
        // </Button>
        <NavLink
          key={url.path}
          to={url.path}
          className={
            ({ isActive }) => `btn ${isActive ? 'cyan' : 'pink'}`
          }
        >
          {url.label}
        </NavLink>

    ))}

    </div>
  );
}