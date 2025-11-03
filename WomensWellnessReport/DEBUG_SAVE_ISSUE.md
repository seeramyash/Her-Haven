# Debug Guide: Form Save Issue

## ✅ Changes Made to Help Debug

### 1. Enhanced Error Logging in Frontend
**File:** `frontend/src/pages/DailyEntry.js`

- Added console.log for form data being submitted
- Added console.log for API response
- Enhanced error logging with full error details
- Added validation check for response.success

### 2. Enhanced Backend Logging
**File:** `api_server.py`

- Added check for empty request body
- Added logging of received data keys
- Enhanced error traceback printing

### 3. Improved Form Data Handling
**File:** `frontend/src/pages/DailyEntry.js`

- Improved range input value handling (convert to numbers)
- Better type conversion in handleChange

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Open your React app (http://localhost:3000)
2. Open Developer Tools (F12)
3. Go to the "Console" tab

### Step 2: Try to Save an Entry
1. Fill out the Daily Entry form
2. Click "Save Today's Entry"
3. Check the console for:
   - `Submitting form data:` - Should show your form data
   - `Save response:` - Should show the API response
   - Any error messages

### Step 3: Check Backend Console
Look at your backend terminal for:
- `Received entry data:` - Should show what fields were received
- Any error messages or tracebacks

## 🔧 Common Issues and Solutions

### Issue 1: "No data received"
**Symptom:** Error shows "No data received"
**Solution:** 
- Check if form is properly preventing default
- Verify API endpoint is accessible
- Check network tab in browser DevTools

### Issue 2: CORS Error
**Symptom:** Console shows CORS error
**Solution:** Backend CORS is already configured, but verify backend is running on port 5000

### Issue 3: Network Error
**Symptom:** Console shows "Failed to save entry" or network error
**Solution:**
- Verify backend is running: `python start_backend.py`
- Check backend URL: Should be `http://localhost:5000/api`
- Try accessing: `http://localhost:5000/api/health`

### Issue 4: Silent Failure
**Symptom:** Button clicks but nothing happens
**Solution:**
- Check console for JavaScript errors
- Verify form has `onSubmit={handleSubmit}`
- Check if button has `type="submit"`

### Issue 5: Success but Data Not Saved
**Symptom:** Success message shows but data not in database
**Solution:**
- Check backend console for database errors
- Verify database file exists: `wellness.db`
- Check database permissions

## 📋 Checklist

When saving fails, check:
- [ ] Backend server is running (`python start_backend.py`)
- [ ] Backend is accessible (http://localhost:5000/api/health)
- [ ] No JavaScript errors in browser console
- [ ] Form data appears in console.log when submitting
- [ ] API response appears in console.log
- [ ] Error message is displayed if save fails
- [ ] Success message appears if save succeeds
- [ ] Backend console shows received data
- [ ] Database file exists and is writable

## 🧪 Test Save Functionality

### Test via API Directly:
```python
import requests
test_data = {
    'morning_meal': 'test',
    'afternoon_meal': 'test',
    'night_meal': 'test',
    'morning_stress': 5,
    'afternoon_stress': 5,
    'night_stress': 5,
    'exercise_minutes': 30,
    'water_intake': 2000,
    'sleep_hours': 7,
    'sleep_quality': 7,
    'on_period': False,
    'symptoms': {},
    'additional_notes': 'test'
}
response = requests.post('http://localhost:5000/api/entries', json=test_data)
print(response.json())
```

This should return: `{"success": True, ...}`

## 📝 What to Report

If the issue persists, please provide:
1. Console output from browser (especially the "Submitting form data" log)
2. Backend console output (especially any error messages)
3. Network tab showing the POST request to `/api/entries`
4. Screenshot of the error message (if any)

