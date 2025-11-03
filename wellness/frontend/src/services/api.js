import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const healthCheck = () => api.get('/health');

// Entries
export const getEntries = () => api.get('/entries');
export const getRecentEntries = (limit = 30) => api.get(`/entries/recent?limit=${limit}`);
export const getEntryByDate = (date) => api.get(`/entries/${date}`);
export const createEntry = (entryData) => api.post('/entries', entryData);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardCharts = () => api.get('/dashboard/charts');

// Reports
export const getWeeklyReport = () => api.get('/reports/weekly');
export const getMonthlyReport = () => api.get('/reports/monthly');

// Recommendations
export const getRecommendations = () => api.get('/recommendations');

// Cycle
export const getCyclePrediction = () => api.get('/cycle/predict');
export const getSymptomPredictions = () => api.get('/cycle/symptoms');

// Analytics
export const getTrends = () => api.get('/analytics/trends');
export const getComparativeAnalytics = () => api.get('/analytics/comparative');

// Export
export const exportCSV = () => api.get('/export/csv', { responseType: 'blob' });
export const exportJSON = () => api.get('/export/json', { responseType: 'blob' });
export const exportSummary = () => api.get('/export/summary', { responseType: 'blob' });

// ML
export const predictWellness = (entryData) => api.post('/ml/predict', entryData);
export const getMLStatus = () => api.get('/ml/status');

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (profileData) => api.put('/profile', profileData);

export default api;

