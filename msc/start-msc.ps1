# Start all MSC services
Write-Host "Starting MSC services..." -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

# Start CHAT server (Anonymous Chatroom)
Write-Host "`n1. Starting CHAT server on port 8002..." -ForegroundColor Yellow
Write-Host "   IPv4 Address: 10.1.168.139" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\seera\Videos\her-haven\msc\CHAT'; `$env:IPV4_ADDRESS='10.1.168.139'; Write-Host 'CHAT Server starting...' -ForegroundColor Green; Write-Host 'Local: http://localhost:8002' -ForegroundColor Yellow; Write-Host 'Network: http://10.1.168.139:8002' -ForegroundColor Cyan; npm start"

# Wait a moment for CHAT to start
Start-Sleep -Seconds 2

# Start her-connect (React app)
Write-Host "`n2. Starting her-connect on port 8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\seera\Videos\her-haven\msc\her-connect'; Write-Host 'Her Connect starting on http://localhost:8001' -ForegroundColor Green; npm run dev"

Write-Host "`n✅ All MSC services are starting!" -ForegroundColor Green
Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "  • CHAT (Local): http://localhost:8002" -ForegroundColor White
Write-Host "  • CHAT (Network): http://10.1.168.139:8002" -ForegroundColor Cyan
Write-Host "  • Her Connect: http://localhost:8001" -ForegroundColor White
Write-Host "`nNote: The terminal windows will stay open to keep the services running." -ForegroundColor Yellow

