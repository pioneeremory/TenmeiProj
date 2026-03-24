#!/bin/bash

echo "🏮 Starting Tenmei Project: Kyoto 1788..."

# 1. Docker Compose (Database/Services)
echo "🐳 Starting Docker containers..."
docker compose up -d

# 2. Django Setup & Server
echo "🐍 Migrating and Starting Django..."
source .venv/bin/activate
python3 manage.py migrate
# Run in background
python3 manage.py runserver & 

# 3. FastAPI AI Bridge
echo "🌉 Starting AI Bridge (Port 8001)..."
# We assume Ollama is already running on Windows at this point
uvicorn main:app --port 8001 &

# 4. Frontend (React)
echo "⚛️ Starting Frontend..."
cd frontend
npm run dev