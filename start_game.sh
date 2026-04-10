#!/bin/bash
set -e

echo "🏮 Starting Tenmei Project (Docker Mode)..."

# 1. Start Docker
# This builds the images and starts the containers in the background
docker-compose up -d --build

echo "⏳ Waiting for Database to be ready..."
sleep 5

# 2. Run Migrations INSIDE Docker
# Notice we use 'docker-compose exec'. This tells Docker to run the command 
# inside the 'api' container where Django IS installed.
echo "🐍 Running migrations..."
docker-compose exec api python manage.py migrate

echo "-------------------------------------------------------"
echo "✅ Done! Access the game at: http://localhost"
echo "-------------------------------------------------------"

# #!/bin/bash


# echo "🏮 Starting Tenmei Project: Kyoto 1788..."

# # 1. Docker Compose (Database/Services)
# echo "🐳 Starting Docker containers..."
# docker compose up -d

# # 2. Django Setup & Server
# echo "🐍 Migrating and Starting Django..."
# source .venv/bin/activate
# python3 manage.py migrate
# # Run in background
# python3 manage.py runserver & 

# # 3. FastAPI AI Bridge
# echo "🌉 Starting AI Bridge (Port 8001)..."
# # We assume Ollama is already running on Windows at this point
# uvicorn main:app --port 8001 &

# # 4. Frontend (React)
# echo "⚛️ Starting Frontend..."
# cd frontend
# npm run dev