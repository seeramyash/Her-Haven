import React, { useState, useEffect } from 'react';
import { getTrends } from '../services/api';

const Trends = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const response = await getTrends();
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load trends');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load trends';
      setError(errorMsg);
      console.error('Failed to load trends:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="sub-header">Trends & Analytics</h1>
        <div className="spinner"></div>
        <p style={{ textAlign: 'center' }}>Loading trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="sub-header">Trends & Analytics</h1>
        <div className="alert alert-info">
          {error.includes('Need at least 3 entries') 
            ? '📊 Need at least 3 entries to show trends. Keep logging your data!'
            : error}
        </div>
      </div>
    );
  }

  const renderCorrelationMatrix = (correlations) => {
    if (!correlations) return null;
    
    const metrics = Object.keys(correlations);
    
    return (
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ color: '#314456' }}>📊 Health Metric Correlations</h3>
        <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>
          Correlation measures how strongly two metrics are related (ranges from -1 to +1)
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#f9d5d1', color: '#314456' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Metric</th>
                {metrics.map(metric => (
                  <th key={metric} style={{ padding: '10px', textAlign: 'center', minWidth: '80px' }}>
                    {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, idx) => (
                <tr key={metric} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>
                    {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </td>
                  {metrics.map(otherMetric => {
                    const value = correlations[metric][otherMetric];
                    const absValue = Math.abs(value);
                    let bgColor = '#fff';
                    if (absValue > 0.7) bgColor = '#e8f5e9';
                    else if (absValue > 0.4) bgColor = '#fff3e0';
                    else if (absValue > 0.1) bgColor = '#fff9c4';
                    else bgColor = '#f5f5f5';
                    
                    return (
                      <td 
                        key={otherMetric} 
                        style={{ 
                          padding: '10px', 
                          textAlign: 'center',
                          backgroundColor: bgColor
                        }}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInsights = (correlations) => {
    if (!correlations || !correlations.wellness_score) return null;
    
    const insights = [];
    const wellnessCorr = correlations.wellness_score;
    
    // Find strongest correlations with wellness
    const sorted = Object.entries(wellnessCorr)
      .filter(([key]) => key !== 'wellness_score')
      .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a));
    
    if (sorted.length > 0) {
      const [metric, value] = sorted[0];
      const metricName = metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (Math.abs(value) > 0.3) {
        insights.push({
          type: value > 0 ? 'positive' : 'negative',
          message: value > 0 
            ? `📈 ${metricName} has a strong positive correlation with wellness!`
            : `📉 ${metricName} negatively impacts wellness.`
        });
      }
    }
    
    if (insights.length === 0) return null;
    
    return (
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ color: '#314456' }}>💡 Key Insights</h3>
        {insights.map((insight, idx) => (
          <div 
            key={idx}
            style={{
              backgroundColor: insight.type === 'positive' ? '#27AE6022' : '#E74C3C22',
              borderLeft: `5px solid ${insight.type === 'positive' ? '#27AE60' : '#E74C3C'}`,
              padding: '15px',
              margin: '10px 0',
              borderRadius: '5px'
            }}
          >
            {insight.message}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="sub-header">Trends & Analytics</h1>
      <div className="card">
        {data && data.correlations && (
          <>
            {renderCorrelationMatrix(data.correlations)}
            {renderInsights(data.correlations)}
          </>
        )}
        {data && !data.correlations && (
          <p style={{ color: '#666' }}>No correlation data available yet. Keep logging your data!</p>
        )}
      </div>
    </div>
  );
};

export default Trends;

