# React Frontend Setup Guide

This project has been converted from Streamlit to a React frontend with Flask backend API.

## 🏗️ Architecture

- **Frontend**: React 18 with React Router
- **Backend**: Flask REST API
- **Database**: SQLite (same as before)
- **ML Models**: Same XGBoost, LSTM, and NLP models

## 📦 Quick Start

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the Flask API server
python start_backend.py
# Or directly:
python api_server.py
```

The API will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm start
```

The React app will run on `http://localhost:3000`

## 🚀 Running the Full Stack

### Terminal 1 (Backend):
```bash
python start_backend.py
```

### Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

## 📁 Project Structure

```
WomensWellnessReport/
├── api_server.py              # Flask REST API backend
├── start_backend.py           # Backend startup script
├── frontend/                  # React frontend application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js             # Main React app
│   │   ├── components/        # Reusable components
│   │   │   ├── Sidebar.js
│   │   │   └── ...
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.js
│   │   │   ├── DailyEntry.js
│   │   │   ├── Trends.js
│   │   │   └── ...
│   │   └── services/          # API service layer
│   │       └── api.js
│   └── package.json
├── database.py                # Database models (unchanged)
├── db_storage.py              # Database operations (unchanged)
├── ml_models.py               # ML models (unchanged)
└── ... (other backend files unchanged)
```

## 🔧 Configuration

### Backend API URL

The frontend is configured to connect to `http://localhost:5000` by default.

To change the API URL, set the environment variable:

```bash
# In frontend directory
REACT_APP_API_URL=http://localhost:5000 npm start
```

Or create a `.env` file in the `frontend` directory:

```
REACT_APP_API_URL=http://localhost:5000
```

### CORS Configuration

The Flask backend has CORS enabled by default. If you need to restrict origins, edit `api_server.py`:

```python
CORS(app, origins=["http://localhost:3000"])
```

## 📝 Features Implemented

✅ All Streamlit pages converted to React:
- 📊 Dashboard with charts (Recharts)
- 📝 Daily Entry form
- 📈 Trends & Analytics
- 🔮 Cycle Forecast
- 📋 Weekly Report
- 📅 Monthly Report
- 💡 Recommendations
- 📥 Export Data

✅ API Endpoints:
- Health check
- CRUD operations for entries
- Dashboard stats and charts
- Reports generation
- Cycle predictions
- ML predictions
- Data export

## 🔄 Migration from Streamlit

If you were using the Streamlit version:

1. **Database**: Your `wellness.db` file is compatible - no migration needed!
2. **Data**: All your existing entries will work with the React version
3. **ML Models**: Saved models in `ml_models_saved/` will be loaded automatically

## 🐛 Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Change port
PORT=5001 python start_backend.py
```

**Module not found errors:**
```bash
pip install -r requirements.txt
```

### Frontend Issues

**npm install fails:**
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
```

**API connection errors:**
- Ensure backend is running on port 5000
- Check CORS settings in `api_server.py`
- Verify `REACT_APP_API_URL` environment variable

**Charts not displaying:**
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors

## 🚀 Production Build

### Build React Frontend:
```bash
cd frontend
npm run build
```

The build folder contains static files that can be served by any web server.

### Serve with Flask (optional):

You can serve the React build from Flask by adding this to `api_server.py`:

```python
from flask import send_from_directory

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

app.static_folder = '../frontend/build'
```

## 📚 API Documentation

### Health Check
```
GET /api/health
```

### Entries
```
GET    /api/entries
GET    /api/entries/recent?limit=30
POST   /api/entries
GET    /api/entries/<date>
```

### Dashboard
```
GET /api/dashboard/stats
GET /api/dashboard/charts
```

### Reports
```
GET /api/reports/weekly
GET /api/reports/monthly
```

### Cycle
```
GET /api/cycle/predict
GET /api/cycle/symptoms
```

### Export
```
GET /api/export/csv
GET /api/export/json
GET /api/export/summary
```

## 🎉 Next Steps

1. Start both servers (backend and frontend)
2. Open `http://localhost:3000` in your browser
3. Start tracking your wellness!

The React frontend provides the same functionality as Streamlit with a modern, responsive UI.

