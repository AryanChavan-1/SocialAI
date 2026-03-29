# production_run.ps1
# This script runs the SocialAI application in production mode without requiring Docker.

Write-Host "--- Starting SocialAI Production Build ---" -ForegroundColor Cyan

# 1. Frontend Build
Write-Host "Building Frontend..." -ForegroundColor Yellow
npm run build

# 2. Start Services
Write-Host "Launching Services..." -ForegroundColor Green

# Start Backend in background (using uvicorn)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn main:socket_app --host 0.0.0.0 --port 8001" -WindowStyle Normal

# Start Frontend (npm start)
npm start
