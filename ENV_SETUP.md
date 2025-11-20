# Environment Variables Setup Guide

## Quick Start

### Backend Setup

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. The `.env.example` file contains **dummy credentials** that work for local development.

3. For production, replace dummy values with real credentials.

### Frontend Setup

1. Copy the example file:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```

2. The default value (`http://localhost:5000/api`) should work for local development.

## Dummy Credentials Explained

### Backend `.env.example`

All credentials in `.env.example` are **dummy/placeholder values** for development:

- **MongoDB**: Uses default Docker credentials (`admin:password`)
- **JWT Secrets**: Placeholder strings (generate real ones for production)
- **Razorpay**: Dummy test keys (format: `rzp_test_...`)
- **Twilio**: Dummy account SID and token (format: `AC...`)
- **SendGrid**: Dummy API key (format: `SG....`)
- **Ekart**: Mock API key for development

### Important Notes

1. **For Local Development**: The dummy credentials work fine since:
   - Razorpay integration is commented out
   - Twilio/SendGrid are optional
   - Ekart uses mock API

2. **For Production**: You MUST replace:
   - JWT secrets (use: `openssl rand -base64 32`)
   - Razorpay keys (get from Razorpay dashboard)
   - Twilio credentials (if using SMS)
   - SendGrid API key (if using email)
   - Database connection strings
   - All other service credentials

## Getting Real Credentials

### Razorpay (Required for payments)
1. Go to https://dashboard.razorpay.com/
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Generate **Test Keys** for development
5. Copy `Key ID` and `Key Secret` to `.env`

### Twilio (Optional - for SMS OTP)
1. Go to https://console.twilio.com/
2. Sign up for free trial
3. Get **Account SID** and **Auth Token** from dashboard
4. Get a phone number from Twilio
5. Add to `.env`

### SendGrid (Optional - for emails)
1. Go to https://app.sendgrid.com/
2. Sign up for free account
3. Navigate to **Settings → API Keys**
4. Create API key with "Mail Send" permissions
5. Copy to `.env`

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Rotate secrets regularly** in production
4. **Use different credentials** for dev/staging/production
5. **Restrict API key permissions** to minimum required

## Generating Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate refresh token secret
openssl rand -base64 32
```

## Environment-Specific Files

- **Development**: `.env` (local machine)
- **Staging**: `.env.staging` (staging server)
- **Production**: `.env.production` (production server)

Never commit these files to Git!

