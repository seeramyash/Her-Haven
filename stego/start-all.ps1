# Start all servers for the Her Haven project
Write-Host "Starting Her Haven servers..." -ForegroundColor Green

# Start wellness backend in a new window
Write-Host "Starting Women's Wellness backend (port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Desktop\her-haven\wellness; python scripts\start_backend.py"

# Wait a bit
Start-Sleep -Seconds 3

# Start wellness frontend in a new window
Write-Host "Starting Women's Wellness frontend (port 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Desktop\her-haven\wellness\frontend; `$env:PORT=3001; npm start"

# Wait a bit
Start-Sleep -Seconds 2

# Start chatbot backend in a new window
Write-Host "Starting chatbot backend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\seera\Videos\her-haven\chat_bot\r3f-virtual-girlfriend-backend-main; yarn dev"

# Wait a bit
Start-Sleep -Seconds 2

# Start chatbot frontend in a new window
Write-Host "Starting chatbot frontend (port 5176)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\seera\Videos\her-haven\chat_bot\r3f-virtual-girlfriend-frontend-main; yarn dev"

# Wait a bit
Start-Sleep -Seconds 2

# Start CHAT server in a new window
Write-Host "Starting CHAT server (port 8002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\seera\Videos\her-haven\msc\CHAT; `$env:IPV4_ADDRESS='10.1.168.139'; npm start"

# Wait a bit
Start-Sleep -Seconds 2

# Start her-connect in a new window
Write-Host "Starting her-connect (port 8001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\seera\Videos\her-haven\msc\her-connect; npm run dev"

# Wait a bit
Start-Sleep -Seconds 2

# Start main server in a new window
Write-Host "Starting main server (port 4000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\seera\Videos\her-haven\stego; npm start"

Write-Host "`nServers starting..." -ForegroundColor Green
Write-Host "`n=== API Services ===" -ForegroundColor Yellow
Write-Host "Women's Wellness Backend: http://localhost:5000/" -ForegroundColor Cyan
Write-Host "Chatbot Backend: http://localhost:3000/" -ForegroundColor Cyan
Write-Host "`n=== Web Applications ===" -ForegroundColor Yellow
Write-Host "Main App: http://localhost:4000/" -ForegroundColor Green
Write-Host "  - Steganography: http://localhost:4000/" -ForegroundColor Cyan
Write-Host "  - Law Bot: http://localhost:4000/law/" -ForegroundColor Cyan
Write-Host "  - Therapy Bot: http://localhost:4000/therapy.html" -ForegroundColor Cyan
Write-Host "Women's Wellness Tracker: http://localhost:3001/" -ForegroundColor Cyan
Write-Host "Chatbot (3D): http://localhost:5176/" -ForegroundColor Cyan
Write-Host "Her Connect: http://localhost:8001/" -ForegroundColor Cyan
Write-Host "CHAT Room: http://localhost:8002/" -ForegroundColor Cyan
Write-Host "CHAT (Network): http://10.1.168.139:8002/" -ForegroundColor Cyan
