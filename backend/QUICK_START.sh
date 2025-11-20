#!/bin/bash
echo "🚀 Starting AkTrendFlare Admin Access..."
echo ""
echo "Step 1: Checking backend..."
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "   ⚠️  Backend not running. Starting backend..."
    cd backend
    npm run dev &
    sleep 5
    cd ..
else
    echo "   ✅ Backend is running"
fi

echo ""
echo "Step 2: Checking frontend..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ⚠️  Frontend not running. Please start it:"
    echo "   cd frontend && npm run dev"
else
    echo "   ✅ Frontend is running"
fi

echo ""
echo "Step 3: Admin Login Credentials"
echo "   Email: admin@aktrendflare.com"
echo "   Password: admin123"
echo ""
echo "Step 4: Access Admin Panel"
echo "   1. Go to: http://localhost:3000/login"
echo "   2. Login with admin credentials"
echo "   3. Then go to: http://localhost:3000/admin"
echo ""
echo "📝 Note: If admin user doesn't exist, run: cd backend && npm run seed"
