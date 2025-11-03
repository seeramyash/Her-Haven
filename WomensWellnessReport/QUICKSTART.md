# Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Fast Setup

### 1. Install Python (if not already installed)
- Download from [python.org](https://www.python.org/downloads/)
- Python 3.11 or higher required
- Check "Add Python to PATH" during installation

### 2. Clone/Download the Project
```bash
cd WomensWellnessReport
```

### 3. Create Virtual Environment
```bash
# Windows (PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies

**Option A: Using pip (Recommended for beginners)**
```bash
pip install -r requirements.txt
```

**Option B: Using uv (Faster)**
```bash
# Install uv first
pip install uv

# Then sync dependencies
uv sync
```

### 5. Download NLTK Data (for sentiment analysis)
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('brown'); nltk.download('wordnet')"
```

### 6. Run Setup Script (Optional)
```bash
python setup.py
```

### 7. Start the Application
```bash
streamlit run app.py
```

The app will open automatically in your browser at `http://localhost:8501`

## 🎯 First Steps

1. **Click "📝 Daily Entry"** in the sidebar
2. **Fill in your health metrics** for today
3. **Click "💾 Save Today's Entry"**
4. **Explore the Dashboard** to see your wellness overview

## 📚 Features to Try

- **📊 Dashboard**: Visual overview of your wellness
- **📈 Trends**: See how your health metrics change over time
- **🔮 Cycle Forecast**: Get predictions for your next period
- **💡 Recommendations**: Personalized health tips based on your data
- **📋 Reports**: Weekly and monthly summaries

## 🆘 Having Issues?

### "Module not found" error
```bash
pip install -r requirements.txt
```

### "Streamlit not found"
```bash
pip install streamlit
streamlit run app.py
```

### Database errors
```bash
# Delete wellness.db if it exists, then restart the app
# The database will be created automatically
```

### TensorFlow installation fails
```bash
# Try CPU-only version
pip install tensorflow-cpu>=2.20.0
```

## 📖 Need More Help?

See [README.md](README.md) for detailed instructions and troubleshooting.

## 🎉 That's It!

Start tracking your wellness journey today. The more you track, the better the AI predictions become!

---

**Pro Tip**: Track your data daily for at least 7-10 days to enable ML model training and get the most accurate predictions!

