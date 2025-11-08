# Environment Setup Templates

## Backend Environment (.env)

Create `backend/.env` file with the following configuration:

### Required Variables

```env
# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# ===========================================
# DATABASE CONFIGURATION
# ===========================================

# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/vsconnecto

# Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vsconnecto?retryWrites=true&w=majority

# ===========================================
# AUTHENTICATION
# ===========================================
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars

# JWT expiration (examples: 1h, 24h, 7d, 30d)
JWT_EXPIRES_IN=7d

# ===========================================
# PAYMENT GATEWAY - RAZORPAY
# ===========================================

# Get your keys from: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Webhook secret (from Razorpay dashboard)
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# ===========================================
# EMAIL CONFIGURATION (Optional)
# ===========================================

# For Gmail: Enable 2FA and create App Password
# https://myaccount.google.com/apppasswords
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password

# SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# ===========================================
# FILE UPLOAD CONFIGURATION
# ===========================================
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg,image/gif,image/webp
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# ===========================================
# ADMIN CONFIGURATION
# ===========================================
ADMIN_EMAIL=admin@vsconnecto.com
ADMIN_PASSWORD=SecureAdmin@123
ADMIN_NAME=System Administrator

# ===========================================
# SOCKET.IO CONFIGURATION
# ===========================================
SOCKET_CORS_ORIGIN=http://localhost:5173

# ===========================================
# SECURITY SETTINGS
# ===========================================
BCRYPT_ROUNDS=10
SESSION_SECRET=your_session_secret_key_change_this

# ===========================================
# API RATE LIMITING
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===========================================
# FEATURE FLAGS
# ===========================================
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_TWO_FACTOR_AUTH=false

# ===========================================
# LOGGING
# ===========================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# ===========================================
# THIRD-PARTY SERVICES (Optional)
# ===========================================

# AWS S3 (for file storage)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=your-bucket-name

# Twilio (for SMS)
# TWILIO_ACCOUNT_SID=your_account_sid
# TWILIO_AUTH_TOKEN=your_auth_token
# TWILIO_PHONE_NUMBER=+1234567890

# Google OAuth (for social login)
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret
# GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
DEBUG_MODE=true
MOCK_PAYMENT_GATEWAY=false
SKIP_EMAIL_VERIFICATION=false
```

---

## Frontend Environment (.env)

Create `frontend/.env` file with the following configuration:

```env
# ===========================================
# API CONFIGURATION
# ===========================================
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# ===========================================
# PAYMENT GATEWAY
# ===========================================
# Use the same Razorpay KEY_ID from backend
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx

# ===========================================
# APPLICATION SETTINGS
# ===========================================
VITE_APP_NAME=VSConnectO
VITE_APP_ENV=development
VITE_APP_VERSION=1.0.0

# ===========================================
# FEATURE FLAGS
# ===========================================
VITE_ENABLE_VIDEO_CALLS=true
VITE_ENABLE_VOICE_CALLS=true
VITE_ENABLE_SCREEN_SHARE=true
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true

# ===========================================
# WEBRTC CONFIGURATION
# ===========================================
# STUN servers for WebRTC
VITE_STUN_SERVER_1=stun:stun.l.google.com:19302
VITE_STUN_SERVER_2=stun:stun1.l.google.com:19302

# TURN servers (optional, for better connectivity)
# VITE_TURN_SERVER=turn:your-turn-server.com:3478
# VITE_TURN_USERNAME=username
# VITE_TURN_CREDENTIAL=password

# ===========================================
# GOOGLE SERVICES (Optional)
# ===========================================
# Google Maps API (for location features)
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Google Analytics
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
VITE_DEBUG_MODE=true
VITE_SHOW_DEV_TOOLS=true
```

---

## Quick Setup Instructions

### Step 1: Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**Minimum required for development:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vsconnecto
JWT_SECRET=my_secret_key_for_development_only
FRONTEND_URL=http://localhost:5173
```

### Step 2: Frontend Environment

```bash
cd frontend
cp .env.example .env
# Edit .env with your values
```

**Minimum required for development:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Step 3: Verify Setup

```bash
# Backend
cd backend
node -e "require('dotenv').config(); console.log(process.env.PORT)"

# Frontend (PowerShell)
cd frontend
Get-Content .env
```

---

## Environment-Specific Configurations

### Development (.env.development)

```env
NODE_ENV=development
DEBUG_MODE=true
LOG_LEVEL=debug
MOCK_PAYMENT_GATEWAY=true
SKIP_EMAIL_VERIFICATION=true
```

### Production (.env.production)

```env
NODE_ENV=production
DEBUG_MODE=false
LOG_LEVEL=error
MOCK_PAYMENT_GATEWAY=false
SKIP_EMAIL_VERIFICATION=false
HTTPS_ENABLED=true
```

### Testing (.env.test)

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/vsconnecto_test
JWT_SECRET=test_jwt_secret
PORT=5001
```

---

## Security Best Practices

### 🔒 Never Commit .env Files

Add to `.gitignore`:
```
# Environment variables
.env
.env.local
.env.development
.env.production
.env.test

# Logs
logs/
*.log
```

### 🔐 Generate Strong Secrets

```bash
# Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ✅ Validate Environment Variables

Create `backend/config/validateEnv.js`:

```javascript
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT',
  'FRONTEND_URL'
];

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
};
```

---

## Troubleshooting

### Issue: Variables not loading

**Solution:**
```bash
# Check if .env exists
ls -la backend/.env
ls -la frontend/.env

# Verify dotenv is installed
cd backend && npm list dotenv
cd frontend && npm list dotenv
```

### Issue: CORS errors

**Solution:**
```env
# Backend .env - match exactly
FRONTEND_URL=http://localhost:5173

# Frontend .env - match exactly
VITE_API_URL=http://localhost:5000/api
```

### Issue: Socket.io not connecting

**Solution:**
```env
# Backend
SOCKET_CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_SOCKET_URL=http://localhost:5000
```

---

## Getting API Keys

### Razorpay (Payment Gateway)

1. Sign up at: https://razorpay.com/
2. Go to Dashboard → Settings → API Keys
3. Generate Test Keys (for development)
4. Copy Key ID and Key Secret to .env

### MongoDB Atlas (Cloud Database)

1. Sign up at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (for development)
5. Get connection string and add to .env

### Google Maps (Location Features)

1. Go to: https://console.cloud.google.com/
2. Create project
3. Enable Maps JavaScript API
4. Create credentials (API Key)
5. Add to frontend .env

---

## ✅ Checklist

Before starting development:

- [ ] Created `backend/.env` file
- [ ] Created `frontend/.env` file
- [ ] Set MONGODB_URI (local or Atlas)
- [ ] Set JWT_SECRET (minimum 32 characters)
- [ ] Set RAZORPAY keys (if using payments)
- [ ] Verified FRONTEND_URL and VITE_API_URL match
- [ ] Tested MongoDB connection
- [ ] Added .env to .gitignore
- [ ] Backed up .env.example templates

**All set? Run:** `./start-dev.bat` or `npm start` in both directories! 🚀
