import React from 'react';
import './Sidebar.css';

export default function Sidebar({ onButtonClick, currentView }) {
  return (
    <div className="sidebar">
      <button className={`btn ${currentView === 'Giám sát' ? 'cyan' : 'pink'}`} onClick={() => onButtonClick('Giám sát')}>
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
      </button>
    </div>
  );
}