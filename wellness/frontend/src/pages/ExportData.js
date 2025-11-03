import React from 'react';
import { exportCSV, exportJSON, exportSummary } from '../services/api';

const ExportData = () => {
  const handleExport = async (type) => {
    try {
      let blob, filename;
      
      switch (type) {
        case 'csv':
          const csvRes = await exportCSV();
          blob = csvRes.data;
          filename = `wellness_data_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'json':
          const jsonRes = await exportJSON();
          blob = jsonRes.data;
          filename = `wellness_data_${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'summary':
          const summaryRes = await exportSummary();
          blob = summaryRes.data;
          filename = `wellness_summary_${new Date().toISOString().split('T')[0]}.txt`;
          break;
        default:
          return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div>
      <h1 className="sub-header">Export Your Wellness Data</h1>
      
      <div className="grid grid-2">
        <div className="card">
          <h2>📄 CSV Export</h2>
          <p>Download your data in spreadsheet format.</p>
          <button className="btn btn-primary" onClick={() => handleExport('csv')}>
            ⬇️ Download CSV
          </button>
        </div>

        <div className="card">
          <h2>📋 JSON Export</h2>
          <p>Download your data in JSON format.</p>
          <button className="btn btn-primary" onClick={() => handleExport('json')}>
            ⬇️ Download JSON
          </button>
        </div>
      </div>

      <div className="card">
        <h2>📊 Summary Report</h2>
        <p>Generate a text-based summary of your wellness journey.</p>
        <button className="btn btn-primary" onClick={() => handleExport('summary')}>
          ⬇️ Download Summary
        </button>
      </div>

      <div className="alert alert-info">
        🔒 Privacy Note: Your data is stored locally and never transmitted to external servers.
      </div>
    </div>
  );
};

export default ExportData;

