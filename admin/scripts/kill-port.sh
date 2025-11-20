#!/bin/bash
# Script to kill process on a specific port

PORT=${1:-3001}

echo "Checking for processes on port $PORT..."

PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "No process found on port $PORT"
  exit 0
fi

echo "Found process $PID on port $PORT"
echo "Killing process..."

kill -9 $PID

sleep 1

# Verify
if lsof -ti:$PORT > /dev/null 2>&1; then
  echo "⚠️  Process still running, trying force kill..."
  kill -9 $PID 2>/dev/null
  sleep 1
fi

if lsof -ti:$PORT > /dev/null 2>&1; then
  echo "❌ Failed to kill process on port $PORT"
  exit 1
else
  echo "✅ Port $PORT is now free"
  exit 0
fi

