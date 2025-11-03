# Women's Wellness Report 🌸

**A Beautiful & Professional Wellness Tracking Application for Women's Health**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Overview

Women's Wellness Report is a modern, AI-powered health tracking application designed specifically for women. It combines machine learning predictions, comprehensive analytics, and personalized recommendations to help you understand your health patterns.

### Key Features

- ✨ **Beautiful Modern UI** - Professional design with smooth animations
- 🧠 **AI-Powered Predictions** - ML models for wellness scoring and cycle forecasting
- 📊 **Comprehensive Analytics** - Trends, correlations, and insights
- 📝 **Easy Data Entry** - Quick daily tracking with auto-advance
- 🔒 **100% Private** - All data stored locally on your device
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))

### Installation

**Windows:**
1. Double-click `setup.bat`
2. Wait for installation
3. Double-click `start.bat`

**Mac/Linux:**
```bash
chmod +x setup.sh start.sh
./setup.sh
./start.sh
```

The app will automatically open at **http://localhost:3000**

---

## 📁 Project Structure

```
WomensWellnessReport/
├── docs/                   # Documentation
│   ├── README.md          # Detailed documentation
│   ├── SETUP_GUIDE.md     # Setup instructions
│   └── FOR_FRIEND.txt     # Quick start guide
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── services/      # API services
│   └── package.json
├── src/
│   ├── backend/           # Flask backend
│   │   ├── api_server.py  # Main API server
│   │   ├── database.py    # Database models
│   │   └── db_storage.py  # Database operations
│   └── ml/                # Machine learning
│       ├── ml_models.py   # ML models
│       ├── recommendations.py
│       └── reports.py
├── scripts/               # Setup & launch scripts
│   ├── setup_windows.bat
│   ├── start_backend.py
│   └── ...
├── setup.bat             # Quick Windows setup
├── start.bat             # Quick Windows start
└── requirements.txt      # Python dependencies
```

---

## 🎨 Features

### 📝 Daily Entry
- Track nutrition, stress levels, exercise, sleep
- Symptom tracking (headache, cramping, mood swings, etc.)
- Auto-advance date for quick consecutive entries
- Beautiful form with real-time validation

### 📊 Dashboard
- Overview of wellness metrics
- Interactive charts and graphs
- Real-time statistics
- Color-coded insights

### 📈 Trends & Analytics
- Correlation matrix between metrics
- Pattern identification
- Visual insights
- Key findings and recommendations

### 🔮 Cycle Forecast
- Predict next period date
- Symptom likelihood predictions
- Confidence levels
- Historical patterns

### 📋 Reports
- **Weekly Report**: 7-day comprehensive analysis
- **Monthly Report**: 30-day insights and trends

### 💡 Recommendations
- Personalized wellness plan
- Cycle-phase specific nutrition
- Symptom management tips
- Data-driven advice

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database

### Machine Learning
- **XGBoost** - Wellness scoring
- **LSTM** - Time-series forecasting
- **TextBlob** - Sentiment analysis
- **TensorFlow** - Neural networks
- **scikit-learn** - Data processing

---

## 📊 Data Requirements

| Feature | Minimum Entries |
|---------|----------------|
| Dashboard | 1+ |
| Recommendations | 1+ |
| Weekly Report | 3+ |
| Trends & Analytics | 3+ |
| Monthly Report | 7+ |
| Cycle Forecast | 2+ cycles |

---

## 🔒 Privacy & Security

- ✅ **Local Storage** - All data stored on your device
- ✅ **No Cloud** - No external servers
- ✅ **Complete Privacy** - Your data never leaves your computer
- ✅ **Full Control** - Export or delete anytime

---

## 🐛 Troubleshooting

**Python not found?**
- Install Python and check "Add Python to PATH"

**npm not found?**
- Install Node.js from nodejs.org

**Port in use?**
- Close other apps using ports 3000 or 5000

**Module errors?**
- Run setup script again

See `docs/SETUP_GUIDE.md` for detailed troubleshooting.

---

## 📞 Support

For detailed documentation:
- `docs/README.md` - Complete guide
- `docs/SETUP_GUIDE.md` - Setup instructions
- `docs/FOR_FRIEND.txt` - Quick start

---

## 📝 License

This project is provided as-is for educational and personal use.

---

## 🙏 Acknowledgments

Built with modern web technologies and machine learning to empower women's health.

**Happy Tracking! 📊✨🌸**

---

## 🎉 Ready to Start?

Run `setup.bat` (Windows) or `./setup.sh` (Mac/Linux) to begin!

