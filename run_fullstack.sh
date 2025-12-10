#!/usr/bin/env bash
set -e

# Directory Definitions
# valid assumes script is run from project root
FRONTEND_DIR="frontend"
BACKEND_DIR="backend/dunzomanagement"

# 1. Cleanup Function
cleanup() {
    echo ""
    echo "🛑 Shutting down..."

    # "jobs -p" lists the PIDs of the background jobs started by this script.
    # We kill only those, avoiding the self-killing loop.
    JOBS=$(jobs -p)
    if [ -n "$JOBS" ]; then
        kill $JOBS 2>/dev/null
    fi
}
# Trap EXIT (happens on normal finish) and INT (Ctrl+C)
trap cleanup EXIT INT

## 2. Find a free port
#PORT=${1:-8000}
#while lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
#  echo "⚠️  Port $PORT is busy, checking next..."
#  PORT=$((PORT + 1))
#done

echo "--------------------------------------------------"
echo "✅  Backend Port 8000"
echo "--------------------------------------------------"

# 3. Start Backend (in a subshell)
# The parentheses ( ... ) mean we 'cd' only inside this block.
# The main script STAYS in the root.
echo "🚀 Starting Backend..."
(
    cd "$BACKEND_DIR"
    # Python output is unbuffered (-u) so you see logs immediately
    python -u manage.py runserver
) &

# 4. Start Frontend (in a subshell)
# We inject the VITE_API_URL so frontend knows the chosen port automatically.
echo "🚀 Starting Frontend..."
(
    cd "$FRONTEND_DIR"
    # CHANGE 'VITE_API_URL' to match your frontend (e.g., REACT_APP_API_URL, NEXT_PUBLIC_API_URL)
    export VITE_API_URL="http://127.0.0.1:8000"

    npm run dev
) &

# Wait for both background processes
wait