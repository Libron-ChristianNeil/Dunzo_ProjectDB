#!/bin/bash

# Start backend in background
cd backend/dunzomanagement
python manage.py runserver &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
