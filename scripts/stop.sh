#!/bin/bash

set -e

cd "$(dirname "$0")/.."

echo "===================================="
echo "🛑 Stopping KaamWala..."
echo "===================================="

docker compose down

echo
echo "===================================="
echo "✅ KaamWala stopped successfully."
echo "===================================="
