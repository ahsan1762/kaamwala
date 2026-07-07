#!/bin/bash

set -e

cd "$(dirname "$0")/.."

echo "===================================="
echo "🔄 Restarting KaamWala..."
echo "===================================="

docker compose down

docker compose up -d

echo
echo "===================================="
echo "✅ KaamWala restarted successfully."
echo "===================================="

docker ps
