#!/bin/bash

set -e

cd "$(dirname "$0")/.."

echo "===================================="
echo "🚀 Starting KaamWala..."
echo "===================================="

docker compose up --build -d

echo ""
echo "===================================="
echo "✅ Running Containers"
echo "===================================="

docker ps
docker ps -a
