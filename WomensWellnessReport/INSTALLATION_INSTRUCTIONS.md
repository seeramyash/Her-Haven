# 📦 Installation Instructions

## For Your Friend (Easy Setup)

Follow these simple steps to get the Women's Wellness Report running on your computer!

---

## Step 1: Install Prerequisites

### Install Python
1. Go to: https://www.python.org/downloads/
2. Download Python (latest version)
3. **IMPORTANT**: During installation, check ✅ **"Add Python to PATH"**
4. Click "Install Now"
5. Wait for installation to complete

### Install Node.js
1. Go to: https://nodejs.org/
2. Download the **LTS** (Long Term Support) version
3. Double-click the installer
4. Follow the installation wizard
5. Accept all defaults
6. Restart your computer after installation

---

## Step 2: Copy the Project Folder

1. Copy the entire `WomensWellnessReport` folder to your computer
2. You can place it anywhere (Desktop, Documents, etc.)

---

## Step 3: Run Setup

### For Windows Users

**Option A: Double-Click Setup**
1. Navigate to the `WomensWellnessReport` folder
2. **Double-click** `setup_windows.bat`
3. Wait for the installation to complete
4. Press any key when done

**Option B: PowerShell Setup**
1. Right-click on the `WomensWellnessReport` folder
2. Select "Open with PowerShell"
3. Run: `.\setup.ps1`
4. Wait for installation to complete

### For Mac Users
1. Open Terminal
2. Navigate to the folder: `cd path/to/WomensWellnessReport`
3. Run: `chmod +x setup.sh && ./setup.sh`
4. Enter your password if prompted

### For Linux Users
1. Open Terminal
2. Navigate to the folder: `cd path/to/WomensWellnessReport`
3. Run: `chmod +x setup.sh && ./setup.sh`

---

## Step 4: Start the Application

### For Windows Users

**Easy Way:**
1. **Double-click** `start_app_windows.bat`
2. Wait for browsers to open
3. The app will launch automatically!

**Manual Way:**
1. Open Command Prompt (or PowerShell)
2. Navigate to the project folder
3. Run: `python start_backend.py`
4. Open a **new** Command Prompt
5. Navigate to the project folder
6. Run: `cd frontend` then `npm start`
7. Open browser to: http://localhost:3000

### For Mac/Linux Users

**Easy Way:**
1. Run: `./start.sh`
2. The app will launch in your browser!

**Manual Way:**
1. Open Terminal
2. Run: `python3 start_backend.py`
3. Open a **new** Terminal window
4. Run: `cd frontend` then `npm start`
5. Open browser to: http://localhost:3000

---

## Step 5: Verify It's Working

1. You should see your browser open to http://localhost:3000
2. You should see the Women's Wellness Report homepage
3. Two terminal windows should be open (backend + frontend)

---

## 🎉 Success!

You're all set! Start tracking your wellness data!

---

## ❌ Something Wrong?

### Check These First:

1. **Did you install Python?**
   - Open Command Prompt
   - Type: `python --version`
   - Should show version 3.8 or higher

2. **Did you install Node.js?**
   - Open Command Prompt
   - Type: `node --version`
   - Should show version 16 or higher

3. **Did the setup complete?**
   - Look for "Setup Complete!" message
   - Check for any error messages

4. **Are both servers running?**
   - You should see TWO terminal windows open
   - One for backend, one for frontend

### Common Issues:

**"Python not found"**
- Reinstall Python and check "Add Python to PATH"
- Restart computer after installation

**"npm not found"**
- Install Node.js from nodejs.org
- Restart computer after installation

**"Port already in use"**
- Close any applications using ports 3000 or 5000
- Or restart your computer

**"Module not found"**
- Run the setup script again
- Or manually install:
  - `pip install -r requirements.txt`
  - `cd frontend && npm install`

**Database errors**
- Delete the `wellness.db` file
- Run the start script again

---

## 📞 Need More Help?

1. Read the full `SETUP_GUIDE.md` file
2. Check the `README.md` for more details
3. Look at the console error messages
4. Make sure all prerequisites are installed correctly

---

## 📋 Quick Checklist

Before asking for help, verify:

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Setup script completed successfully
- [ ] Both servers are running (2 terminal windows)
- [ ] Browser opened to http://localhost:3000
- [ ] No error messages in terminal

---

**Good luck! 🍀 You got this! 💪**

