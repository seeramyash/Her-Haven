import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { getMonthlyReport } from '../services/api';

const MonthlyReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const response = await getMonthlyReport();
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
    const errorMsg = report?.error || 'Need at least 7 entries to generate a monthly report.';
    return (
      <div>
        <h1 className="sub-header">Monthly Report</h1>
        <div className="alert alert-info">
          {errorMsg.includes('Need at least 7 entries')
            ? '📅 Need at least 7 entries to generate a comprehensive monthly report. Keep tracking your wellness!'
            : errorMsg}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="sub-header">Monthly Wellness Report</h1>
      <div className="card">
        {report.html && <div>{parse(report.html)}</div>}
      </div>
    </div>
  );
};

export default MonthlyReport;

