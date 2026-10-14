@echo off
echo =====================================================================
echo  STARTING AUTONOMOUS BLOGGER PLATFORM (AI + ML MULTI-SERVICE SUITE)
echo =====================================================================
echo.

set BASE_DIR=%~dp0

echo [1/4] Starting Python FastAPI ML Microservice on port 8000...
start "ML Service (:8000)" cmd /k "cd /d "%BASE_DIR%ml-service" && .\venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

ping -n 3 127.0.0.1 >nul

echo [2/4] Starting Node.js Express Backend API on port 5000...
start "Node.js Backend (:5000)" cmd /k "cd /d "%BASE_DIR%backend" && npm start"

ping -n 3 127.0.0.1 >nul

echo [3/4] Starting Live Client Website on port 3001...
start "Live Website (:3001)" cmd /k "cd /d "%BASE_DIR%live-website-demo" && node server.js"

ping -n 2 127.0.0.1 >nul

echo [4/4] Starting React.js Frontend Dashboard on port 3002...
start "React Frontend (:3002)" cmd /k "cd /d "%BASE_DIR%frontend" && npm run dev"

echo.
echo =====================================================================
echo  ALL 4 SERVICES LAUNCHED SUCCESSFULLY!
echo  - React Dashboard:  http://localhost:3002
echo  - Live Client Site: http://localhost:3001 (and :5000/live-site)
echo  - Node.js Backend:  http://localhost:5000 (Health: :5000/health)
echo  - Python ML Engine: http://localhost:8000 (Docs: :8000/docs)
echo =====================================================================
