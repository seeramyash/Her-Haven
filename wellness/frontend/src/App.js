import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DailyEntry from './pages/DailyEntry';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import CycleForecast from './pages/CycleForecast';
import WeeklyReport from './pages/WeeklyReport';
import MonthlyReport from './pages/MonthlyReport';
import Recommendations from './pages/Recommendations';
import ExportData from './pages/ExportData';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/entry" element={<DailyEntry />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/cycle" element={<CycleForecast />} />
            <Route path="/weekly-report" element={<WeeklyReport />} />
            <Route path="/monthly-report" element={<MonthlyReport />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/export" element={<ExportData />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

