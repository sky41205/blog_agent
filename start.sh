#!/usr/bin/env bash

echo "====================================================================="
echo " STARTING AUTONOMOUS BLOGGER PLATFORM (AI + ML MULTI-SERVICE SUITE)"
echo "====================================================================="

# Start Python ML Service
echo "[1/4] Starting Python FastAPI ML Microservice on port 8000..."
(cd ml-service && ./venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &

sleep 2

# Start Node.js Backend
echo "[2/4] Starting Node.js Express Backend API on port 5000..."
(cd backend && npm start) &

sleep 2

# Start Live Website Demo
echo "[3/4] Starting Live Client Website on port 3001..."
(cd live-website-demo && node server.js) &

sleep 2

# Start React Frontend
echo "[4/4] Starting React.js Frontend Dashboard on port 3002..."
(cd frontend && npm run dev) &

echo "====================================================================="
echo " ALL 4 SERVICES LAUNCHED SUCCESSFULLY!"
echo " - React Dashboard:  http://localhost:3002"
echo " - Live Client Site: http://localhost:3001 (and :5000/live-site)"
echo " - Node.js Backend:  http://localhost:5000 (Health: :5000/health)"
echo " - Python ML Engine: http://localhost:8000 (Docs: :8000/docs)"
echo "====================================================================="
wait
