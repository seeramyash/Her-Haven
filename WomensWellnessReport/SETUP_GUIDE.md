# 🚀 Women's Wellness Report - Setup Guide

## Welcome! 👋

This guide will help you set up the Women's Wellness Report application on your computer.

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

### 1. Python 3.8+ 
**Check if you have Python:**
```bash
python --version
```

**If not installed:**
- Download from: https://www.python.org/downloads/
- ⚠️ **Important**: Check "Add Python to PATH" during installation

### 2. Node.js 16+
**Check if you have Node.js:**
```bash
node --version
npm --version
```

**If not installed:**
- Download from: https://nodejs.org/
- Install the LTS (Long Term Support) version

---

## 🔧 Quick Setup (Automated)

### For Windows Users

1. **Double-click** `setup_windows.bat`
2. Wait for installation to complete
3. **Double-click** `start_app_windows.bat` to run the application

### For Mac/Linux Users

1. Open Terminal in the project folder
2. Run:
   ```bash
   chmod +x setup.sh start.sh
   ./setup.sh
   ```
3. After setup completes:
   ```bash
   ./start.sh
   ```

---

## 🛠️ Manual Setup (If automated doesn't work)

### Step 1: Install Python Dependencies

Open a terminal/command prompt in this folder and run:

**Windows:**
```cmd
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Mac/Linux:**
```bash
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt
```

### Step 2: Install Node.js Dependencies

**Windows:**
```cmd
cd frontend
npm install
cd ..
```

**Mac/Linux:**
```bash
cd frontend
npm install
cd ..
```

### Step 3: Start the Application

**Windows:**
```cmd
python start_backend.py
```
Open a **new terminal** and run:
```cmd
cd frontend
npm start
```

**Mac/Linux:**
```bash
python3 start_backend.py
```
Open a **new terminal** and run:
```bash
cd frontend
npm start
```

---

## 🎯 Access the Application

Once both servers are running:

1. **Backend**: http://localhost:5000
2. **Frontend**: http://localhost:3000 (Open this in your browser!)

The application will automatically open in your default browser at http://localhost:3000

---

## ✅ Verification

### Check Backend
Visit: http://localhost:5000/api/health

You should see:
```json
{
  "message": "API is running",
  "status": "healthy"
}
```

### Check Frontend
Visit: http://localhost:3000

You should see the Women's Wellness Report homepage!

---

## 🐛 Troubleshooting

### "Python is not recognized"
- Python is not in your PATH
- Reinstall Python and check "Add Python to PATH"

### "npm is not recognized"
- Node.js is not installed or not in your PATH
- Install Node.js from nodejs.org

### "Port 5000 already in use"
- Another application is using port 5000
- Close that application or change the port in `start_backend.py`

### "Port 3000 already in use"
- Another application is using port 3000
- Close that application or change the React port

### "Module not found" errors
- Dependencies not installed correctly
- Delete `node_modules` folder in `frontend/` and run `npm install` again
- Delete Python cache and reinstall: `pip install -r requirements.txt --force-reinstall`

### Backend starts but frontend doesn't
- Make sure you're in the `frontend` folder when running `npm start`
- Check if `node_modules` folder exists in `frontend/`

### Database errors
- Delete `wellness.db` if it exists (it will be recreated)
- Make sure Python has write permissions in the project folder

---

## 📱 Features

Once running, you can:
- ✍️ **Daily Entry**: Track your daily wellness metrics
- 📊 **Dashboard**: View overall statistics
- 📈 **Trends & Analytics**: See correlations between metrics
- 🔮 **Cycle Forecast**: Get period predictions
- 📋 **Weekly Report**: 7-day analysis
- 📅 **Monthly Report**: 30-day insights
- 💡 **Recommendations**: Personalized advice

---

## 🛑 Stopping the Application

Press `Ctrl+C` in both terminal windows running the servers.

---

## 📞 Need Help?

1. Check the troubleshooting section above
2. Make sure all prerequisites are installed
3. Try the manual setup if automated fails
4. Check the console for error messages

---

## 📝 Notes

- **First Run**: The database (`wellness.db`) will be created automatically
- **Data Storage**: All data is stored locally on your computer
- **Privacy**: Your data never leaves your computer
- **Updates**: Run `pip install -r requirements.txt --upgrade` to update Python packages
- **Ports**: Backend uses port 5000, frontend uses port 3000 - keep these free

---

## 🎉 Success!

You're all set! Start tracking your wellness journey!

**Happy Tracking! 📊✨🌸**

