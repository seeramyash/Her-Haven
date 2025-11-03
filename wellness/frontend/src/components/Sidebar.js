import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/entry', icon: '📝', label: 'Daily Entry' },
    { path: '/trends', icon: '📈', label: 'Trends & Analytics' },
    { path: '/cycle', icon: '🔮', label: 'Cycle Forecast' },
    { path: '/weekly-report', icon: '📋', label: 'Weekly Report' },
    { path: '/monthly-report', icon: '📅', label: 'Monthly Report' },
    { path: '/recommendations', icon: '💡', label: 'Recommendations' },
    { path: '/export', icon: '📥', label: 'Export Data' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">🌸 Wellness Tracker</h1>
        <p className="sidebar-subtitle">Your AI-Powered Health Companion</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

