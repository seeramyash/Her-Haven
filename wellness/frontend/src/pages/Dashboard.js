import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getDashboardCharts } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, chartsResponse] = await Promise.all([
        getDashboardStats(),
        getDashboardCharts(),
      ]);
      
      setStats(statsResponse.data.data);
      setChartData(chartsResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="spinner"></div>
        <p style={{ textAlign: 'center' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!stats || stats.total_entries === 0) {
    return (
      <div className="dashboard">
        <h1 className="sub-header">Your Wellness Dashboard</h1>
        <div className="alert alert-info">
          📝 No data yet. Start by adding your first daily entry!
        </div>
      </div>
    );
  }

  // Show entry count and requirements
  const entryCount = stats.total_entries || 0;
  const needsMoreForTrends = entryCount < 3;
  const needsMoreForReports = entryCount < 3;

  return (
    <div className="dashboard">
      <h1 className="sub-header">Your Wellness Dashboard</h1>

      {/* Entry Count Info */}
      {entryCount > 0 && (
        <div className={`alert ${needsMoreForTrends ? 'alert-info' : 'alert-success'}`} style={{ marginBottom: '20px' }}>
          <strong>📊 Data Status:</strong> You have {entryCount} {entryCount === 1 ? 'entry' : 'entries'} saved.
          {needsMoreForTrends && (
            <span>
              <br />
              <small>
                💡 You need {3 - entryCount} more {3 - entryCount === 1 ? 'entry' : 'entries'} (for different dates) to see Trends, Reports, and Cycle Forecasts. 
                Saving for the same date updates your entry - save entries for different dates to build your history!
              </small>
            </span>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-4">
        <div className="metric-card">
          <div className="metric-label">Avg Wellness Score (7d)</div>
          <div className="metric-value">{stats.avg_wellness.toFixed(1)}/100</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Sleep (7d)</div>
          <div className="metric-value">{stats.avg_sleep.toFixed(1)}h</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Exercise (7d)</div>
          <div className="metric-value">{stats.avg_exercise.toFixed(0)}min</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Stress (7d)</div>
          <div className="metric-value">{stats.avg_stress.toFixed(1)}/10</div>
        </div>
      </div>

      {/* Charts */}
      {chartData && (
        <>
          <div className="card">
            <h2>🌟 Wellness Score Progression</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData.wellness_scores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#dfa7a1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h2>😰 Stress Levels</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData.stress_levels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="morning" stroke="#314456" strokeWidth={2} />
                  <Line type="monotone" dataKey="afternoon" stroke="#dfa7a1" strokeWidth={2} />
                  <Line type="monotone" dataKey="night" stroke="#5b7288" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2>😴 Sleep Quality & Duration</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData.sleep_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" domain={[0, 12]} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" domain={[1, 10]} orientation="right" label={{ value: 'Quality', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="hours" fill="#b3c2cf" />
                  <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#dfa7a1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h2>💪 Exercise Activity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.exercise_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#94b3a0" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2>💧 Hydration Tracking</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.water_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="intake" fill="#a7c6de" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

