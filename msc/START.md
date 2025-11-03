# Quick Start Commands

## Option 1: Start Both Services (PowerShell Script)
```powershell
cd C:\Users\seera\Videos\her-haven\msc
.\start-msc.ps1
```

## Option 2: Start Individually (Manual Commands)

### Start CHAT Server (Port 8002)
```powershell
cd C:\Users\seera\Videos\her-haven\msc\CHAT
$env:IPV4_ADDRESS='10.1.168.139'
npm start
```

### Start Her Connect (Port 8001)
Open a **NEW** PowerShell window:
```powershell
cd C:\Users\seera\Videos\her-haven\msc\her-connect
npm run dev
```

## Access URLs
- **CHAT**: http://localhost:8002 (Network: http://10.1.168.139:8002)
- **Her Connect**: http://localhost:8001

## To Stop Services
- Press `Ctrl+C` in each terminal window
- Or close the terminal windows

