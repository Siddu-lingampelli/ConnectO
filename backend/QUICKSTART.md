# 🚀 Quick Start Guide - VSConnectO Backend

## ⚡ **5-Minute Setup**

### **Step 1: Install Dependencies**
```powershell
cd "a:\DT project\SIH 18 try\final 4\backend"
npm install
```

### **Step 2: Start MongoDB**
```powershell
# Check if MongoDB is running
Get-Service -Name MongoDB

# If not running, start it
Start-Service -Name MongoDB
```

### **Step 3: Start Backend Server**
```powershell
npm run dev
```

### **Step 4: Test the API**
Open browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "VSConnectO Backend API is running",
  "database": "Connected"
}
```

---

## ✅ **Verification Checklist**

- [ ] MongoDB is running (port 27017)
- [ ] Backend server is running (port 5000)
- [ ] Database "VSConnectO" is created
- [ ] Health check returns "Connected"
- [ ] No errors in console

---

## 🧪 **Test Registration**

### **Using PowerShell:**
```powershell
$body = @{
    fullName = "Test User"
    email = "test@example.com"
    password = "test123"
    role = "client"
    phone = "+91-9876543210"
    city = "Mumbai"
    area = "Andheri"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 🔗 **Connect Frontend to Backend**

### **Update Frontend API Configuration:**

Edit `a:\DT project\SIH 18 try\final 4\src\config\apiEndpoints.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh-token`,
  },
  USERS: {
    PROFILE: `${API_BASE_URL}/users/profile`,
    SEARCH_PROVIDERS: `${API_BASE_URL}/users/search-providers`,
  },
  JOBS: {
    BASE: `${API_BASE_URL}/jobs`,
    MY_JOBS: `${API_BASE_URL}/jobs/my-jobs`,
  }
};
```

---

## 📊 **View Database**

### **Using MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Click on **VSConnectO** database
4. View collections: users, jobs, wallets, etc.

### **Using MongoDB Shell:**
```bash
mongosh
use VSConnectO
show collections
db.users.find()
```

---

## 🛑 **Common Issues & Solutions**

### **Issue 1: MongoDB Not Running**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:**
```powershell
Start-Service -Name MongoDB
```

### **Issue 2: Port 5000 Already in Use**
**Fix:** Change PORT in `.env` file:
```env
PORT=5001
```

### **Issue 3: Dependencies Not Installed**
**Fix:**
```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

---

## 🎯 **Next Steps**

1. ✅ Backend running
2. ⏭️ Test all auth endpoints
3. ⏭️ Connect frontend
4. ⏭️ Test registration/login from frontend
5. ⏭️ Replace localStorage with API calls

---

## 🔥 **Quick Commands**

```powershell
# Start backend
npm run dev

# Check MongoDB status
Get-Service -Name MongoDB

# View logs
# Logs appear in terminal where server is running

# Stop server
# Press Ctrl+C in the terminal
```

---

## ✨ **Success!**

Your backend is ready! 🎉

**API Running:** http://localhost:5000
**Database:** VSConnectO (MongoDB)
**Collections:** users, jobs, wallets, etc.

**Now you can integrate the frontend with real API calls!** 🚀
