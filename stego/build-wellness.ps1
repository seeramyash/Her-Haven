# Build Women's Wellness Report frontend
Write-Host "Building Women's Wellness Tracker frontend..." -ForegroundColor Green

# Navigate to wellness frontend
cd "C:\Desktop\her-haven\wellness\frontend"

# Build the React app
Write-Host "Running npm build..." -ForegroundColor Yellow
npm run build

Write-Host "`nBuild complete! The wellness app is now ready to be served." -ForegroundColor Green
Write-Host "Run the stego server with: npm start" -ForegroundColor Cyan
