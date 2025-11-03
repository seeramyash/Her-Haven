import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { getWeeklyReport } from '../services/api';

const WeeklyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const response = await getWeeklyReport();
      setReport(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load report';
      setReport({ success: false, error: errorMsg });
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  if (!report || !report.success) {
    const errorMsg = report?.error || 'Need at least 3 entries to generate a weekly report.';
    return (
      <div>
        <h1 className="sub-header">Weekly Report</h1>
        <div className="alert alert-info">
          {errorMsg.includes('Need at least 3 entries')
            ? '📋 Need at least 3 entries to generate a weekly report. Keep tracking your wellness!'
            : errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="sub-header">Weekly Wellness Report</h1>
      <div className="card">
        {report.html && <div>{parse(report.html)}</div>}
      </div>
    </div>
  );
};

export default WeeklyReport;

