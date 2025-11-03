import React, { useState } from 'react';
import { createEntry } from '../services/api';
import './DailyEntry.css';

const DailyEntry = () => {
  // Get today's date as default
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Get next day's date
  const getNextDate = (currentDate) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  const [entryDate, setEntryDate] = useState(getTodayDate());
  const [autoIncrementDate, setAutoIncrementDate] = useState(false);
  
  const [formData, setFormData] = useState({
    morning_meal: '',
    afternoon_meal: '',
    night_meal: '',
    morning_stress: 5,
    afternoon_stress: 5,
    night_stress: 5,
    exercise_minutes: 30,
    water_intake: 2000,
    sleep_hours: 7,
    sleep_quality: 7,
    on_period: false,
    symptoms: {
      headache: false,
      heavy_flow: false,
      light_flow: false,
      cramping: false,
      bloating: false,
      mood_swings: false,
      fatigue: false,
      nausea: false,
      back_pain: false,
      breast_tenderness: false,
    },
    additional_notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [mlStatus, setMLStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('symptom_')) {
      const symptomName = name.replace('symptom_', '');
      setFormData((prev) => ({
        ...prev,
        symptoms: {
          ...prev.symptoms,
          [symptomName]: checked,
        },
      }));
    } else {
      // Handle different input types
      let processedValue = value;
      if (type === 'checkbox') {
        processedValue = checked;
      } else if (type === 'number' || type === 'range') {
        // Range inputs return strings, convert to number
        processedValue = parseFloat(value) || 0;
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Submitting form data:', formData);
      
      // Add the selected date to form data
      const entryDataWithDate = {
        ...formData,
        date: entryDate
      };
      
      const response = await createEntry(entryDataWithDate);
      console.log('Save response:', response.data);
      
      if (response.data.success) {
        setSuccess(true);
        setMLStatus(response.data.ml_trained);
        
        // If auto-increment is enabled, move to next day
        if (autoIncrementDate) {
          const nextDate = getNextDate(entryDate);
          setEntryDate(nextDate);
        }
        
        // Reset form except symptoms
        setFormData((prev) => ({
          ...prev,
          morning_meal: '',
          afternoon_meal: '',
          night_meal: '',
          additional_notes: '',
          symptoms: {
            headache: false,
            heavy_flow: false,
            light_flow: false,
            cramping: false,
            bloating: false,
            mood_swings: false,
            fatigue: false,
            nausea: false,
            back_pain: false,
            breast_tenderness: false,
          },
        }));

        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(response.data.error || 'Failed to save entry');
      }
    } catch (err) {
      console.error('Error saving entry:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to save entry. Please try again.';
      setError(errorMessage);
      console.error('Full error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="daily-entry">
      <h1 className="sub-header">Daily Wellness Entry</h1>
      <p>Track your daily health metrics for personalized insights</p>

      {success && (
        <div className="alert alert-success">
          ✅ Entry saved successfully! Your wellness data has been recorded.
          {autoIncrementDate && (
            <div style={{ marginTop: '8px' }}>
              📅 Date automatically advanced to: <strong>{entryDate}</strong>
            </div>
          )}
          <br />
          <small style={{ fontSize: '0.9em', opacity: 0.8 }}>
            💡 {autoIncrementDate 
              ? 'Keep filling and saving to build your wellness history quickly!'
              : 'Tip: Enable "Auto-advance to next day" to easily create multiple entries.'}
          </small>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ❌ {error}
        </div>
      )}

      {mlStatus && (
        <div className="alert alert-info">
          🤖 ML Model Status: {mlStatus.xgboost ? '✅ XGBoost Active' : '📊 XGBoost: Training...'} |{' '}
          {mlStatus.lstm ? '✅ LSTM Active' : '📈 LSTM: Training...'}
        </div>
      )}

      {/* Date Selection and Auto-Increment Option */}
      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div className="form-group">
          <label className="form-label" style={{ fontWeight: '600', marginBottom: '10px', display: 'block' }}>
            📅 Entry Date
          </label>
          <input
            type="date"
            className="form-input"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            max={getTodayDate()} // Can't select future dates
            style={{ marginBottom: '15px', padding: '8px', fontSize: '16px', width: '100%', maxWidth: '300px' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
            <input
              type="checkbox"
              checked={autoIncrementDate}
              onChange={(e) => setAutoIncrementDate(e.target.checked)}
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <span style={{ fontSize: '0.95em' }}>
              🔄 Auto-advance to next day after saving
            </span>
          </label>
          <small style={{ display: 'block', marginTop: '8px', color: '#666', fontSize: '0.85em' }}>
            {autoIncrementDate 
              ? '✓ When enabled, after saving, the date will automatically move to the next day so you can quickly create multiple entries.'
              : 'Enable this to automatically move to the next day after each save, making it easy to build multiple entries.'}
          </small>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="entry-form">
        <div className="grid grid-2">
          {/* Nutrition Section */}
          <div className="card">
            <h2>🍽️ Nutrition</h2>
            <div className="form-group">
              <label className="form-label">Morning Meal</label>
              <textarea
                className="form-textarea"
                name="morning_meal"
                value={formData.morning_meal}
                onChange={handleChange}
                placeholder="e.g., Oatmeal with berries, green tea"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Afternoon Meal</label>
              <textarea
                className="form-textarea"
                name="afternoon_meal"
                value={formData.afternoon_meal}
                onChange={handleChange}
                placeholder="e.g., Grilled chicken salad, quinoa"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Night Meal</label>
              <textarea
                className="form-textarea"
                name="night_meal"
                value={formData.night_meal}
                onChange={handleChange}
                placeholder="e.g., Salmon, vegetables, brown rice"
                rows="3"
              />
            </div>

            <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>💧 Hydration & Sleep</h3>
            <div className="form-group">
              <label className="form-label">
                Water Intake: {formData.water_intake} ml
              </label>
              <input
                type="range"
                className="form-slider"
                name="water_intake"
                min="0"
                max="5000"
                step="100"
                value={formData.water_intake}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Sleep Duration: {formData.sleep_hours} hours
              </label>
              <input
                type="range"
                className="form-slider"
                name="sleep_hours"
                min="0"
                max="12"
                step="0.5"
                value={formData.sleep_hours}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Sleep Quality: {formData.sleep_quality}/10
              </label>
              <input
                type="range"
                className="form-slider"
                name="sleep_quality"
                min="1"
                max="10"
                value={formData.sleep_quality}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Stress & Activity Section */}
          <div className="card">
            <h2>😌 Stress & Activity</h2>
            <div className="form-group">
              <label className="form-label">
                Morning Stress: {formData.morning_stress}/10
              </label>
              <input
                type="range"
                className="form-slider"
                name="morning_stress"
                min="1"
                max="10"
                value={formData.morning_stress}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Afternoon Stress: {formData.afternoon_stress}/10
              </label>
              <input
                type="range"
                className="form-slider"
                name="afternoon_stress"
                min="1"
                max="10"
                value={formData.afternoon_stress}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Night Stress: {formData.night_stress}/10
              </label>
              <input
                type="range"
                className="form-slider"
                name="night_stress"
                min="1"
                max="10"
                value={formData.night_stress}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Exercise Duration (minutes)</label>
              <input
                type="number"
                className="form-input"
                name="exercise_minutes"
                min="0"
                max="300"
                value={formData.exercise_minutes}
                onChange={handleChange}
              />
            </div>

            <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>🩸 Menstrual Cycle Tracking</h3>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  name="on_period"
                  checked={formData.on_period}
                  onChange={handleChange}
                />
                Currently Menstruating
              </label>
            </div>

            {formData.on_period && (
              <div className="symptoms-section">
                <p style={{ marginBottom: '10px', fontWeight: '600' }}>
                  Select any symptoms you're experiencing:
                </p>
                <div className="symptoms-grid">
                  {Object.keys(formData.symptoms).map((symptom) => (
                    <label key={symptom} className="symptom-checkbox">
                      <input
                        type="checkbox"
                        name={`symptom_${symptom}`}
                        checked={formData.symptoms[symptom]}
                        onChange={handleChange}
                      />
                      {symptom.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="card">
          <h2>📝 Additional Notes</h2>
          <div className="form-group">
            <textarea
              className="form-textarea"
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              placeholder="Share any thoughts, feelings, or observations about your day..."
              rows="4"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Today\'s Entry'}
        </button>
      </form>
    </div>
  );
};

export default DailyEntry;

