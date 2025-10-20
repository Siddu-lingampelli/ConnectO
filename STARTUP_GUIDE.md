# 🚀 VSConnectO - Complete Startup Guide

## ⚡ CRITICAL: Start in This Order!

### **Step 1: Start MongoDB (REQUIRED)**
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# If not running, start it:
Start-Service -Name MongoDB

# OR if MongoDB is not installed as service, start manually:
# Navigate to MongoDB bin folder and run:
mongod --dbpath="C:\data\db"
```

### **Step 2: Start Backend API (Port 5000)**
```powershell
# Open NEW Terminal (Terminal 1)
cd "a:\DT project\SIH 18 try\final 4\backend"

# Install dependencies (FIRST TIME ONLY)
npm install

# Start backend server
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected Successfully to VSConnectO Database
📊 Database: VSConnectO
🚀 Server is running on port 5000
```

### **Step 3: Start Frontend (Port 3011)**
```powershell
# Open ANOTHER Terminal (Terminal 2)
cd "a:\DT project\SIH 18 try\final 4"

# Start frontend (ALREADY RUNNING if you see Vite output)
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:3011/
```

---

## 🔌 Connection Status Check

### **1. Test Backend Health**
Open browser: `http://localhost:5000/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "message": "VSConnectO Backend API is running",
  "database": "Connected"
}
```

### **2. Test Frontend**
Open browser: `http://localhost:3011`

Should show landing page.

---

## 🐛 Troubleshooting Common Issues

### **Issue 1: "Cannot connect to MongoDB"**

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
```powershell
# Check MongoDB status
Get-Service -Name MongoDB

# Start MongoDB
Start-Service -Name MongoDB

# OR start manually
mongod --dbpath="C:\data\db"
```

### **Issue 2: "Port 5000 is already in use"**

**Solution 1:** Kill the process using port 5000
```powershell
# Find process
Get-Process -Name node

# Kill all node processes
Get-Process -Name node | Stop-Process -Force

# OR kill specific port
netstat -ano | findstr :5000
# Note the PID and kill it:
Stop-Process -Id <PID> -Force
```

**Solution 2:** Change backend port
Edit `backend/.env`:
```env
PORT=5001
```

Then update frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:5001
```

### **Issue 3: "CORS Error" or "Network Error"**

**Symptoms:**
- Login/Register fails with network error
- Console shows: "Access to XMLHttpRequest blocked by CORS"

**Solution:**
Check backend `.env` has correct frontend URL:
```env
FRONTEND_URL=http://localhost:3011
```

Restart backend after changing.

### **Issue 4: "User already exists" during registration**

**Solution:** Clear database or use different email
```powershell
# Connect to MongoDB
mongosh

# Switch to VSConnectO database
use VSConnectO

# Clear users collection
db.users.deleteMany({})

# Clear wallets collection
db.wallets.deleteMany({})

# Exit
exit
```

### **Issue 5: Frontend can't connect to backend**

**Check:**
1. Backend is running on port 5000
2. Frontend `.env` has correct API URL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
3. After changing `.env`, restart frontend (Ctrl+C then `npm run dev`)

---

## ✅ Verification Checklist

Before testing login/register, verify:

- [ ] MongoDB service is running
- [ ] Backend server started successfully on port 5000
- [ ] Backend health check returns "Connected": `http://localhost:5000/api/health`
- [ ] Frontend is running on port 3011: `http://localhost:3011`
- [ ] No CORS errors in browser console
- [ ] Backend shows in console: `MongoDB Connected Successfully`

---

## 📝 Test the Connection

### **1. Register a New User**

1. Go to: `http://localhost:3011/auth/register`
2. Select "I'm a client" or "I'm a provider"
3. Fill in all fields:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `9876543210`
   - City: `Mumbai`
   - Area: `Andheri`
   - Password: `password123`
   - Confirm Password: `password123`
   - Check "I agree to terms"
4. Click "Create Account"

**Expected:**
- Success toast: "Welcome to VSConnectO, Test User!"
- Redirected to dashboard (client or provider based on selection)
- User data saved in MongoDB `VSConnectO` database

### **2. Login with Existing User**

1. Go to: `http://localhost:3011/auth/login`
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"

**Expected:**
- Success toast: "Welcome back, Test User!"
- Redirected to dashboard
- Token saved in localStorage

### **3. Check MongoDB Data**

```powershell
# Connect to MongoDB
mongosh

# Switch to VSConnectO database
use VSConnectO

# View registered users
db.users.find().pretty()

# View wallets
db.wallets.find().pretty()

# Exit
exit
```

---

## 🎯 What's Connected Now

### **✅ Working Features:**

1. **Authentication:**
   - ✅ Register new users (Client/Provider)
   - ✅ Login with email/password
   - ✅ JWT token generation
   - ✅ Auto-wallet creation on registration
   - ✅ Role-based dashboard redirect

2. **Backend API:**
   - ✅ POST `/api/auth/register` - User registration
   - ✅ POST `/api/auth/login` - User login
   - ✅ GET `/api/health` - Health check

3. **Data Persistence:**
   - ✅ Users saved in MongoDB
   - ✅ Wallets created automatically
   - ✅ Passwords hashed with bcrypt
   - ✅ Tokens stored in localStorage

### **🚧 Not Yet Connected (Still Using localStorage):**

- Job posting/browsing
- Proposals
- Orders
- Messages
- Wallet transactions
- Profile updates
- Provider search

**These will be connected in next phase.**

---

## 🔑 Environment Variables

### **Backend (.env):**
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/VSConnectO

# Server
PORT=5000
NODE_ENV=development

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3011
```

### **Frontend (.env):**
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=VSConnectO
VITE_APP_VERSION=1.0.0
VITE_ENV=development

# Socket.io
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🎉 Success Indicators

### **Backend Console Should Show:**
```
✅ MongoDB Connected Successfully to VSConnectO Database
📊 Database: VSConnectO
🚀 Server is running on port 5000
```

### **Frontend Console Should Show:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:3011/
```

### **Browser Console Should NOT Show:**
- ❌ CORS errors
- ❌ Network errors
- ❌ 404 errors for API calls
- ❌ MongoDB connection errors

### **Browser Console SHOULD Show:**
- ✅ Successful API responses
- ✅ Toast notifications
- ✅ User data after login

---

## 📞 Quick Command Reference

```powershell
# Start MongoDB
Start-Service -Name MongoDB

# Check MongoDB status
Get-Service -Name MongoDB

# Start Backend
cd "a:\DT project\SIH 18 try\final 4\backend"
npm run dev

# Start Frontend (if not running)
cd "a:\DT project\SIH 18 try\final 4"
npm run dev

# Test Backend Health
curl http://localhost:5000/api/health

# View MongoDB data
mongosh
use VSConnectO
db.users.find()
db.wallets.find()
exit
```

---

## 🎯 Current Status

**Frontend → Backend Connection:**
- ✅ Login Form → API
- ✅ Register Form → API
- ✅ JWT Token Management
- ✅ Redux State Updates
- ✅ Role-based Navigation

**Remaining localStorage Dependencies:**
- Jobs, Proposals, Orders, Messages (will be migrated next)

---

## 🚀 Next Steps

1. **Start both servers** (MongoDB → Backend → Frontend)
2. **Test registration** with a new user
3. **Test login** with registered user
4. **Verify data** in MongoDB
5. **Check console** for any errors

**Your authentication is now fully connected to the backend! 🎉**
