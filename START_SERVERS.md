# VSConnectO - Quick Start Guide

## 🚀 How to Start the Application

### Step 1: Start Backend Server

Open a terminal and run:
```bash
cd "A:\DT project\SIH 18 try\final 4\backend"
npm start
```

**Expected Output:**
```
🚀 Server is running on port 5000
✅ MongoDB Connected Successfully to VSConnectO Database
```

### Step 2: Start Frontend Server

Open a NEW terminal (keep backend running) and run:
```bash
cd "A:\DT project\SIH 18 try\final 4\frontend"
npm run dev
```

**Expected Output:**
```
VITE v5.4.20  ready in 335 ms
➜  Local:   http://localhost:3011/
```

### Step 3: Open Browser

Go to: **http://localhost:3011**

---

## ❌ Error: "Something went wrong!"

This error appears when the **backend is not running**.

### Solution:

1. **Check if backend is running:**
   - Look for terminal with `npm start` in backend folder
   - Should show "✅ MongoDB Connected"

2. **If backend not running:**
   ```bash
   cd "A:\DT project\SIH 18 try\final 4\backend"
   npm start
   ```

3. **If frontend showing error:**
   - Reload the page (F5 or Ctrl+R)
   - Clear browser cache (Ctrl+Shift+Delete)
   - Check browser console (F12) for errors

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to server"
**Cause:** Backend not running
**Fix:** Start backend server (see Step 1)

### Issue: Port already in use
**Cause:** Another process using port 5000 or 3011
**Fix:**
```powershell
# Kill node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Then restart servers
```

### Issue: MongoDB connection error
**Cause:** Database credentials or network issue
**Fix:** Check `.env` file in backend folder, ensure MongoDB URI is correct

---

## ✅ Quick Health Check

**Backend Running?**
- Open: http://localhost:5000/api/health
- Should return: `{"status": "OK", "database": "Connected"}`

**Frontend Running?**
- Open: http://localhost:3011
- Should show VSConnectO homepage

---

## 📝 PowerShell Commands (Windows)

### Start Both Servers:

**Terminal 1 (Backend):**
```powershell
cd "A:\DT project\SIH 18 try\final 4\backend"
npm start
```

**Terminal 2 (Frontend):**
```powershell
cd "A:\DT project\SIH 18 try\final 4\frontend"
npm run dev
```

### Stop All Servers:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## 🎯 Demo Project System Testing

Once servers are running, test the demo system:

1. **Login as Admin:**
   - Email: admin@vsconnecto.com
   - Password: admin123

2. **Create Test Provider:**
   - Register new account
   - Role: Service Provider
   - Work Type: Technical

3. **Assign Demo (Admin):**
   - Admin Panel → Demo Projects
   - Click "+ Assign Demo"
   - Enter provider email
   - Select demo type
   - Submit

4. **Submit Demo (Provider):**
   - Login as provider
   - Dashboard → Demo Status Card
   - Submit GitHub link
   - Wait for admin review

5. **Review Demo (Admin):**
   - Admin Panel → Demo Projects
   - Find submitted demo
   - Click "Review & Score"
   - Enter score (≥60 to verify)
   - Submit

6. **Apply for Jobs (Provider):**
   - Once verified, provider can apply for jobs
   - Unverified providers are blocked

---

## 🆘 Still Having Issues?

1. **Clear everything and restart:**
   ```powershell
   # Stop all servers
   Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
   
   # Clear npm cache
   cd "A:\DT project\SIH 18 try\final 4\backend"
   npm cache clean --force
   
   cd "A:\DT project\SIH 18 try\final 4\frontend"
   npm cache clean --force
   
   # Reinstall dependencies
   cd "A:\DT project\SIH 18 try\final 4\backend"
   npm install
   
   cd "A:\DT project\SIH 18 try\final 4\frontend"
   npm install
   
   # Start servers
   cd "A:\DT project\SIH 18 try\final 4\backend"
   npm start
   
   # In new terminal
   cd "A:\DT project\SIH 18 try\final 4\frontend"
   npm run dev
   ```

2. **Check logs:**
   - Backend: Look at terminal running `npm start`
   - Frontend: Press F12 in browser, check Console tab
   - Network: F12 → Network tab → Check failed requests

---

**Remember:** Both backend AND frontend must be running simultaneously!

Backend: http://localhost:5000 (API Server)
Frontend: http://localhost:3011 (React App)
