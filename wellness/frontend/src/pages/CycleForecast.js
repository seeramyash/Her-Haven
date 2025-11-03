import React, { useState, useEffect } from 'react';
import { getCyclePrediction, getSymptomPredictions } from '../services/api';

const CycleForecast = () => {
  const [prediction, setPrediction] = useState(null);
  const [symptoms, setSymptoms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      const [cycleRes, symptomsRes] = await Promise.all([
        getCyclePrediction().catch((err) => ({ 
          data: { 
            success: false, 
            error: err.response?.data?.error || 'Failed to load cycle prediction' 
          } 
        })),
        getSymptomPredictions().catch(() => ({ data: { success: false } })),
      ]);
      
      if (cycleRes.data.success) {
        setPrediction(cycleRes.data.data);
      }
      if (symptomsRes.data.success) {
        setSymptoms(symptomsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  if (!prediction) {
    return (
      <div>
        <h1 className="sub-header">Cycle Forecast</h1>
        <div className="alert alert-info">
          Need at least 2 menstrual cycles tracked to generate predictions.
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence) => {
    if (confidence === 'High') return '#27AE60';
    if (confidence === 'Medium') return '#F39C12';
    return '#E74C3C';
  };

  const getCategoryColor = (category) => {
    if (category === 'Very Likely') return '#E74C3C';
    if (category === 'Likely') return '#F39C12';
    if (category === 'Possible') return '#3498DB';
    return '#95A5A6';
  };

  const formatSymptomName = (name) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div>
      <h1 className="sub-header">Cycle Forecast</h1>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)',
          padding: '20px',
          borderRadius: '10px',
          color: '#314456',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 10px 0' }}>📅 Predicted Next Period</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div style={{
            backgroundColor: '#f9d5d133',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Date</p>
            <h3 style={{ margin: '5px 0', color: '#314456' }}>
              {new Date(prediction.predicted_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
          </div>
          
          <div style={{
            backgroundColor: '#f9d5d133',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Days Until</p>
            <h3 style={{ margin: '5px 0', color: '#314456' }}>{prediction.days_until}</h3>
          </div>
          
          <div style={{
            backgroundColor: '#f9d5d133',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Confidence</p>
            <h3 style={{ 
              margin: '5px 0', 
              color: getConfidenceColor(prediction.confidence)
            }}>
              {prediction.confidence}
            </h3>
          </div>
          
          <div style={{
            backgroundColor: '#f9d5d133',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>Cycle Length</p>
            <h3 style={{ margin: '5px 0', color: '#314456' }}>
              {prediction.avg_cycle_length} days
            </h3>
          </div>
        </div>
      </div>

      {symptoms && (
        <div className="card">
          <h2 style={{ color: '#314456', marginBottom: '20px' }}>🩺 Symptom Predictions</h2>
          <p style={{ color: '#666', fontSize: '0.9em', marginBottom: '20px' }}>
            Based on your historical patterns, here are the symptoms you might experience:
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            {Object.entries(symptoms).map(([symptom, data]) => (
              <div
                key={symptom}
                style={{
                  border: `2px solid ${getCategoryColor(data.category)}`,
                  borderRadius: '10px',
                  padding: '15px',
                  backgroundColor: `${getCategoryColor(data.category)}22`
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                  {formatSymptomName(symptom)}
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    backgroundColor: getCategoryColor(data.category),
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8em',
                    fontWeight: 'bold'
                  }}>
                    {data.category}
                  </span>
                </div>
                
                <div style={{ 
                  width: '100%', 
                  backgroundColor: '#ddd', 
                  borderRadius: '10px',
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${data.percentage}%`,
                    backgroundColor: getCategoryColor(data.category),
                    height: '100%',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                <div style={{ 
                  fontSize: '0.9em', 
                  color: '#666', 
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {data.percentage}% chance
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleForecast;

