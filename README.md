# DevAshish - Full-Stack E-Commerce Platform

A production-ready, responsive clothing marketplace built with Next.js, Express, MongoDB, and Elasticsearch.

## 🚀 Features

### Customer Features
- **User Authentication**: Email/password, OTP, and OAuth stubs (Google, Apple)
- **Product Browsing**: Category-based navigation with filters (size, color, price, brand, rating)
- **Advanced Search**: Fuzzy search with typo tolerance (e.g., "sirt" → "shirt")
- **Product Details**: Image gallery, variants, reviews, ratings, size guide
- **Shopping Cart**: Add, update, remove items with real-time stock validation
- **Checkout**: Multiple payment methods (Razorpay, COD) with coupon support
- **Order Tracking**: Real-time order status with shipment timeline
- **Reviews & Ratings**: Verified purchase tags, image uploads, helpful votes
- **Wishlist & Recently Viewed**: Save products for later

### Admin Features (Separate Application)
- **Separate Admin Panel**: Independent Next.js app running on port 3001
- **Product Management**: CRUD operations, bulk upload, variant management
- **Order Management**: View orders, update status, process refunds
- **User Management**: View users, block/unblock accounts
- **Coupon Management**: Create and manage discount coupons
- **Reports**: Sales analytics, top products, returns tracking
- **Isolated Authentication**: Separate login system for admin users

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (Pages Router) with TypeScript
- **Tailwind CSS** with custom design tokens
- **React Query** for data fetching
- **Zustand** for state management
- **React Hook Form** for form handling
- **Framer Motion** for animations

### Backend
- **Node.js** with Express (TypeScript)
- **MongoDB** with Mongoose
- **Elasticsearch** for product search
- **Redis** for caching and sessions
- **Razorpay** for payments
- **JWT** for authentication

### DevOps
- **GitHub Actions** for CI/CD
- **Vitest** for testing

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas)
- Optional: Elasticsearch (for advanced search)
- Optional: Redis (for caching)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or cloud like MongoDB Atlas)
- Optional: Elasticsearch (for advanced search features)
- Optional: Redis (for caching)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd demo
   ```

2. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # The .env.example contains dummy credentials for development
   # For production, replace with real credentials
   
   # Frontend (Customer App)
   cd ../frontend
   cp .env.example .env.local
   # Edit .env.local if needed (defaults should work for local dev)
   
   # Admin Panel
   cd ../admin
   cp .env.example .env.local
   # Edit .env.local if needed (defaults should work for local dev)
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend (Customer App)
   cd ../frontend
   npm install
   
   # Admin Panel
   cd ../admin
   npm install
   ```

4. **Start MongoDB**
   ```bash
   # If MongoDB is installed locally:
   mongod
   
   # Or use MongoDB Atlas (free cloud service):
   # Update MONGO_URI in backend/.env with your Atlas connection string
   ```

5. **Start backend**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

7. **Start admin panel** (in another terminal)
   ```bash
   cd admin
   npm run dev
   ```

8. **Seed the database** (in another terminal)
   ```bash
   cd backend
   npm run seed
   ```

9. **Access the application**
   - **Customer Frontend**: http://localhost:3000
   - **Admin Panel**: http://localhost:3001
   - **Backend API**: http://localhost:5000
   - **API Docs**: http://localhost:5000/api/docs

### Optional Services

**Elasticsearch** (for advanced search):
- Install locally or use cloud service
- Set `ELASTICSEARCH_URL` in `.env`
- If not available, search will fall back to MongoDB

**Redis** (for caching):
- Install locally or use cloud service
- Set `REDIS_URL` in `.env`
- If not available, caching will be disabled

**Note:** The application will run without Elasticsearch and Redis, but with limited features.

## 🔑 Environment Variables

### Backend (.env)

Copy `backend/.env.example` to `backend/.env`. The example file contains dummy credentials that work for local development:

```bash
cd backend
cp .env.example .env
```

**Important:** The `.env.example` file includes dummy credentials for development. For production:
- Generate strong JWT secrets (use: `openssl rand -base64 32`)
- Get real Razorpay keys from https://dashboard.razorpay.com/app/keys
- Configure real Twilio/SendGrid credentials if using SMS/Email features

### Frontend (.env.local)

Copy `frontend/.env.example` to `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

The default value (`http://localhost:5000/api`) should work for local development.

### Admin Panel (.env.local)

Copy `admin/.env.example` to `admin/.env.local`:

```bash
cd admin
cp .env.example .env.local
```

The default value (`http://localhost:5000/api`) should work for local development.

## 📝 Default Credentials

After seeding:

- **Admin**: admin@devashish.com / admin123
  - Access admin panel at: http://localhost:3001/login
- **User**: user1@example.com / user123
  - Access customer app at: http://localhost:3000/login

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Run All Tests
```bash
make test
```

## 📦 Available Scripts

### Root Level
- `make dev` - Start development servers
- `make build` - Build production bundles
- `make test` - Run all tests
- `make lint` - Run linters
- `make seed` - Seed database
- `make admin-dev` - Start admin panel
- `make admin-build` - Build admin panel

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run seed` - Seed database

### Frontend (Customer App)
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

### Admin Panel
- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run kill-port` - Kill process on port 3001

## 🏗️ Project Structure

```
demo/
├── backend/                 # API Server (Port 5000)
│   ├── src/
│   │   ├── config/          # Database, Elasticsearch, Redis configs
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, error handling, rate limiting
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   └── scripts/         # Seed scripts
│   └── package.json
├── frontend/                # Customer App (Port 3000)
│   ├── components/          # React components
│   ├── lib/                 # Utilities, API client, store
│   ├── pages/               # Next.js pages
│   ├── styles/              # Global styles
│   └── package.json
├── admin/                   # Admin Panel (Port 3001) ✨ Separate App
│   ├── pages/
│   │   ├── login.tsx         # Admin login
│   │   └── admin/            # Admin pages (dashboard, products, orders, etc.)
│   ├── components/          # Admin components
│   ├── lib/                 # API client, store
│   └── package.json
├── Makefile
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - Search and filter products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/slug/:slug` - Get product by slug
- `GET /api/products/suggestions` - Get search suggestions
- `GET /api/products/categories` - Get all categories
- `GET /api/products/brands` - Get all brands

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart` - Remove from cart

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/verify` - Verify payment
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/track` - Track order

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `POST /api/reviews/:reviewId/helpful` - Mark review as helpful

### Coupons
- `POST /api/coupons/validate` - Validate coupon

### Admin
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/reports/sales` - Get sales report

Full API documentation available at `/api/docs` when server is running.

## 🎨 Design Tokens

The application uses the following color scheme:

- **Primary**: `#2A9D8F` (ak-primary)
- **Secondary**: `#264653` (ak-secondary)
- **Accent**: `#E9C46A` (ak-accent)

These are defined in Tailwind config and CSS variables.

## 🚢 Deployment

### Backend Deployment

1. **Build the application**
   ```bash
   cd backend
   npm run build
   ```

2. **Set environment variables** on your hosting platform

3. **Deploy to cloud service** (Heroku, Railway, Render, AWS, etc.)

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Admin Panel Deployment

1. **Build the application**
   ```bash
   cd admin
   npm run build
   ```

2. **Deploy to Vercel** (or your preferred platform)
   ```bash
   vercel --prod
   ```

**Note:** The admin panel is a separate application and can be deployed independently from the customer frontend.

### Environment Setup

Ensure all environment variables are set in your deployment platform:
- MongoDB connection string
- Elasticsearch URL
- Redis URL
- JWT secrets
- Razorpay keys
- Other service credentials

## 🔒 Security Features

- JWT authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- Helmet.js for security headers
- CORS configuration
- Password hashing with bcrypt
- File upload size limits

## 📊 Monitoring & Logging

- Structured logging
- Error tracking (Sentry placeholder)
- Health check endpoint (`/health`)
- Prometheus metrics (stub)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

ISC

## 🆘 Troubleshooting

### MongoDB connection issues
- Verify MongoDB is running (local installation or MongoDB Atlas)
- Verify connection string in `backend/.env`
- Check network connectivity

### Elasticsearch not indexing
- Verify Elasticsearch is running
- Check index exists: `curl http://localhost:9200/products`
- Re-run seed script

### Razorpay payment not working
- Verify Razorpay keys in `.env`
- Check Razorpay dashboard for test mode
- Ensure webhook URLs are configured

### Frontend not connecting to backend
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check CORS settings in backend (should allow both localhost:3000 and localhost:3001)
- Ensure backend is running on port 5000

### Admin panel not connecting to backend
- Verify `NEXT_PUBLIC_API_URL` in admin `.env.local`
- Check CORS settings in backend (should allow localhost:3001)
- Ensure backend is running on port 5000
- Try logging in with: admin@devashish.com / admin123

### Port already in use errors
- **Backend (port 5000)**: `lsof -ti:5000 | xargs kill -9`
- **Frontend (port 3000)**: `lsof -ti:3000 | xargs kill -9`
- **Admin (port 3001)**: `cd admin && npm run kill-port` or `lsof -ti:3001 | xargs kill -9`

### Image loading errors (Next.js)
- Ensure image domains are configured in `next.config.js`
- For external images, add domains to `images.domains` array
- Restart the Next.js dev server after config changes

## 📞 Support

For issues and questions:
- Email: support@devashish.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)

---

Built with ❤️ for DevAshish

