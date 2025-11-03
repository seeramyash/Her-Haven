# MSC Running Instructions

## Overview
The MSC folder contains 2 separate projects that can be run independently.

## Projects

### 1. CHAT (Anonymous Chatroom)
- **Port:** 8002 (changed from 8000 to avoid conflicts)
- **Technology:** Node.js + Express + Socket.IO
- **Features:** Real-time anonymous chat with blockchain ledger

**To run:**
```powershell
cd msc\CHAT
npm start
```

**Access:** 
- Local: http://localhost:8002
- Network: http://10.1.168.139:8002

---

### 2. Her Connect (React UI)
- **Port:** 8001
- **Technology:** React + Vite + Tailwind CSS + Web3
- **Features:** Service marketplace UI with chat and payment modals

**To run:**
```powershell
cd msc\her-connect
npm run dev
```

**Access:** http://localhost:8001

---

## Quick Start (All at once)

Use the PowerShell script to start both services:

```powershell
cd C:\Users\seera\Videos\her-haven\msc
.\start-msc.ps1
```

This will open separate terminal windows for each service.

---

## Port Summary

| Service | Port | Status |
|---------|------|--------|
| CHAT | 8002 | ✅ Ready (IPv4: 10.1.168.139) |
| Her Connect | 8001 | ⚠️ Check manually |

## Notes

- **CHAT** requires `node_modules` (already installed)
- **Her Connect** requires `node_modules` (already installed)  
- Both projects are configured with unique ports to avoid conflicts with other Her Haven services
- The `start-msc.ps1` script creates separate terminal windows for each service

## Troubleshooting

If her-connect doesn't start:
1. Navigate to the directory: `cd msc\her-connect`
2. Run directly: `npm run dev`
3. Check for errors in the terminal

If CHAT doesn't work:
1. Check if port 8002 is available: `netstat -ano | findstr ":8002"`
2. Restart the server: `Ctrl+C` then `npm start` again

