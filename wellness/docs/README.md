# Women's Wellness Report 🌸

A comprehensive wellness tracking application designed specifically for women's health, featuring menstrual cycle predictions, personalized recommendations, and detailed analytics.

---

## 🚀 Quick Start

### Windows Users
1. **Double-click** `setup.bat` (in the root folder)
2. Wait for installation
3. **Double-click** `start.bat`

### Mac/Linux Users
1. Open Terminal in this folder
2. Run:
   ```bash
   chmod +x setup.sh start.sh
   ./setup.sh
   ./start.sh
   ```

That's it! The app will open at http://localhost:3000

---

## 📋 What You Need

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)

---

## ✨ Features

### 📝 Daily Entry
- Track nutrition, stress, exercise, sleep, and more
- Auto-advance date feature for quick logging
- Symptom tracking

### 📊 Dashboard
- Real-time wellness statistics
- Quick overview of your health metrics

### 📈 Trends & Analytics
- Correlation matrix between health metrics
- Visual insights and recommendations

### 🔮 Cycle Forecast
- Predict next period date
- Symptom likelihood predictions
- Confidence levels

### 📋 Reports
- **Weekly Report**: 7-day comprehensive analysis
- **Monthly Report**: 30-day insights and achievements

### 💡 Recommendations
- Personalized wellness plan
- Cycle-phase specific nutrition advice
- Symptom management tips

---

## 🏗️ Architecture

### Backend (Flask API)
- RESTful API endpoints
- SQLite database
- Machine Learning models:
  - XGBoost for wellness scoring
  - LSTM for time-series predictions
  - TextBlob for sentiment analysis

### Frontend (React)
- Modern, responsive UI
- Real-time data updates
- Beautiful visualizations

---

## 📁 Project Structure

```
WomensWellnessReport/
├── api_server.py          # Flask backend server
├── start_backend.py       # Backend launcher
├── database.py            # Database models
├── db_storage.py          # Database operations
├── ml_models.py           # ML models
├── reports.py             # Report generation
├── recommendations.py     # Recommendation engine
├── comparative_analytics.py
├── cycle_prediction.py
├── wellness.db            # SQLite database (auto-created)
├── requirements.txt       # Python dependencies
├── setup_windows.bat      # Windows setup script
├── start_app_windows.bat  # Windows launcher
├── setup.sh               # Mac/Linux setup
├── start.sh               # Mac/Linux launcher
├── frontend/              # React frontend
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── components/
│       └── pages/
└── README.md
```

---

## 🔧 Manual Setup

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Node.js Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Run the Application
**Terminal 1 (Backend):**
```bash
python start_backend.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

Open http://localhost:3000 in your browser.

---

## 🌐 API Endpoints

### Health
- `GET /api/health` - Check API status

### Entries
- `GET /api/entries` - Get all entries
- `POST /api/entries` - Create new entry
- `GET /api/entries/recent` - Get recent entries
- `GET /api/entries/<date>` - Get entry by date

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/charts` - Get chart data

### Reports
- `GET /api/reports/weekly` - Weekly report (3+ entries)
- `GET /api/reports/monthly` - Monthly report (7+ entries)

### Analytics
- `GET /api/analytics/trends` - Trend analysis (3+ entries)
- `GET /api/analytics/comparative` - Month-over-month (14+ entries)

### Cycle
- `GET /api/cycle/predict` - Predict next period (2+ cycles)
- `GET /api/cycle/symptoms` - Symptom predictions

### Recommendations
- `GET /api/recommendations` - Personalized advice

---

## 📊 Data Requirements

| Feature | Minimum Entries |
|---------|----------------|
| Dashboard | 1+ |
| Recommendations | 1+ |
| Weekly Report | 3+ |
| Trends & Analytics | 3+ |
| Monthly Report | 7+ |
| Comparative Analytics | 14+ |
| Cycle Forecast | 2+ cycles |

---

## 🗄️ Database

- **Type**: SQLite (local development) / PostgreSQL (production)
- **File**: `wellness.db` (auto-created on first run)
- **Models**: 
  - `WellnessEntry` - Daily wellness data
  - `UserProfile` - User profile information

---

## 🔒 Privacy & Security

- All data is stored locally on your computer
- No data is sent to external servers
- Your information never leaves your device
- Full privacy and control over your data

---

## 🐛 Troubleshooting

### "Python not found"
- Install Python from python.org
- Make sure to check "Add Python to PATH"

### "npm not found"
- Install Node.js from nodejs.org
- Restart terminal after installation

### "Port already in use"
- Close other applications using ports 3000 or 5000
- Or modify ports in the code

### "Module not found"
- Run setup script again
- Or manually: `pip install -r requirements.txt` and `cd frontend && npm install`

### Database errors
- Delete `wellness.db` to reset
- Ensure write permissions in project folder

---

## 📝 License

This project is provided as-is for educational and personal use.

---

## 🙏 Acknowledgments

- Machine Learning models powered by XGBoost, LSTM, and TextBlob
- Built with Flask, React, SQLAlchemy, and Pandas
- UI designed for user experience and accessibility

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the SETUP_GUIDE.md
3. Check console error messages
4. Ensure all prerequisites are installed

---

## 🎉 Enjoy Tracking!

Start your wellness journey today. Every entry brings you closer to understanding your health patterns!

**Happy Tracking! 📊✨🌸**
