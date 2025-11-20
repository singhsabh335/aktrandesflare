# Quick Admin Access Guide

## Step 1: Start Backend Server

```bash
cd backend
npm run dev
```

Wait for: `🚀 Server running on port 5000`

## Step 2: Seed Database (if not done)

```bash
cd backend
npm run seed
```

This creates:
- **Admin user**: `admin@devashish.com` / `admin123`
- 10 regular users
- 50 sample products
- Sample coupons

## Step 3: Start Frontend (in new terminal)

```bash
cd frontend
npm run dev
```

Wait for: `Ready on http://localhost:3000`

## Step 4: Login as Admin

1. Open browser: **http://localhost:3000**
2. Click **"Login"** button (top right)
3. Enter credentials:
   - **Email**: `admin@devashish.com`
   - **Password**: `admin123`
4. Click **"Login"**

## Step 5: Access Admin Panel

After login, you can access admin in two ways:

**Option A:** Click your profile icon → Select **"Admin"**

**Option B:** Go directly to: **http://localhost:3000/admin**

## Admin Features Available

Once in admin panel, you'll see:

1. **Products** (`/admin/products`)
   - View all products
   - Add new products
   - Edit products
   - Delete products

2. **Orders** (`/admin/orders`)
   - View all orders
   - Filter by status
   - Update order status

3. **Users** (`/admin/users`)
   - View all users
   - Block/unblock users

4. **Coupons** (`/admin/coupons`)
   - View all coupons
   - Create new coupons

5. **Reports** (`/admin/reports`)
   - Sales statistics
   - Top products

## Troubleshooting

### Can't login?
- Make sure database is seeded: `cd backend && npm run seed`
- Check backend is running: `curl http://localhost:5000/health`
- Check browser console for errors

### Admin page shows blank/loading?
- Make sure you're logged in first
- Check if user role is 'admin' in database
- Try refreshing the page

### Backend not starting?
- Check if port 5000 is free: `lsof -ti:5000`
- Kill process: `npm run kill-port` or `lsof -ti:5000 | xargs kill -9`

## Quick Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm run dev

# Seed database
cd backend && npm run seed

# Kill port if needed
cd backend && npm run kill-port
```

