#!/bin/bash
# ./game.sh stop

echo "🛑 Shutting down Tenmei Project..."

# 1. Kill Django (Port 8000)
echo "🐍 Stopping Django..."
fuser -k 8000/tcp

# 2. Kill FastAPI Bridge (Port 8001)
echo "🌉 Stopping AI Bridge..."
fuser -k 8001/tcp

# 3. Kill React (Port 5173 - standard Vite port)
echo "⚛️ Stopping Frontend..."
fuser -k 5173/tcp

# 4. Stop Docker Containers
echo "🐳 Powering down Docker..."
docker compose down

# 5. Stop Ollama (Optional)
# Many users keep Ollama running in the background, but if you want it off:
# echo "🧠 Stopping Ollama..."
# systemctl stop ollama  # (Requires sudo)

echo "✅ All systems offline. Kyoto is at peace."