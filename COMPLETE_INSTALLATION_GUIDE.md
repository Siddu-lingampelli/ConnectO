# 🚀 Complete Installation & Setup Guide

## ✅ Installation Status

### Dependencies Installed
- ✅ **Backend**: socket.io (20 packages)
- ✅ **Frontend**: socket.io-client, lucide-react (1 package)
- ✅ **Socket.io Server**: Integrated into server.js
- ✅ **WebRTC Service**: Complete peer-to-peer implementation

---

## 📋 Environment Setup

### 1. Backend Environment Variables

Create/verify `backend/.env` file with these variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/vsconnecto
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vsconnecto

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760

# Admin Credentials
ADMIN_EMAIL=admin@vsconnecto.com
ADMIN_PASSWORD=admin123
```

### 2. Frontend Environment Variables

Create `frontend/.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Razorpay (Public Key)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# App Configuration
VITE_APP_NAME=VSConnectO
VITE_APP_ENV=development
```

---

## 🔧 Quick Start Commands

### Option 1: Manual Start (Recommended for First Time)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Option 2: Using Startup Scripts (if created)

```bash
# Windows
./start-dev.bat

# Linux/Mac
./start-dev.sh
```

---

## 📦 What Was Installed

### Backend Packages (20 new packages)
```json
{
  "socket.io": "^4.7.2"
}
```

**Socket.io Server Features:**
- WebSocket connections
- Real-time event handling
- Room-based messaging
- JWT authentication
- Auto-reconnection support

### Frontend Packages (1 new package)
```json
{
  "socket.io-client": "^4.7.2",
  "lucide-react": "latest"
}
```

**Frontend Features:**
- Socket.io client for real-time communication
- Lucide React icons for all UI components
- WebRTC service for peer-to-peer calls
- Complete call interfaces (video/voice/screen share)

---

## 🏗️ Project Structure After Installation

```
backend/
├── socket/
│   └── socketHandler.js         ✨ NEW - Socket.io event handlers
├── server.js                     🔄 UPDATED - Socket.io integrated
├── controllers/
│   ├── verification.controller.js
│   ├── communication.controller.js
│   └── ...
├── routes/
│   ├── verification.routes.js
│   ├── communication.routes.js
│   └── ...
└── package.json                  🔄 UPDATED - socket.io added

frontend/
├── src/
│   ├── services/
│   │   ├── socketService.ts      ✨ NEW - Socket.io client
│   │   ├── webrtcService.ts      ✨ NEW - WebRTC peer connections
│   │   ├── communicationService.ts ✨ NEW - Call APIs
│   │   └── verificationService.ts 🔄 UPDATED
│   ├── components/
│   │   ├── verification/
│   │   │   ├── IdVerificationForm.tsx
│   │   │   ├── CertificationForm.tsx
│   │   │   ├── CertificationManager.tsx
│   │   │   ├── VerificationDashboard.tsx
│   │   │   └── BackgroundCheckStatus.tsx
│   │   ├── communication/
│   │   │   ├── VideoCallInterface.tsx
│   │   │   ├── VoiceCallInterface.tsx
│   │   │   ├── ScreenShareViewer.tsx
│   │   │   ├── CallHistoryList.tsx
│   │   │   └── IncomingCallModal.tsx
│   │   └── admin/
│   │       ├── AdminIdVerificationReview.tsx
│   │       ├── AdminBackgroundCheckManager.tsx
│   │       └── AdminCertificationReview.tsx
│   └── ...
└── package.json                  🔄 UPDATED - dependencies added
```

---

## 🔌 Socket.io Integration Details

### Backend Socket Events

The Socket.io server handles these events:

**Call Events:**
- `initiate_video_call` - Start video call
- `initiate_voice_call` - Start voice call
- `initiate_screen_share` - Start screen sharing
- `accept_call` - Accept incoming call
- `decline_call` - Decline incoming call
- `end_call` - End active call
- `participant_joined` - Join call room
- `participant_left` - Leave call room

**WebRTC Signaling:**
- `webrtc_offer` - Send WebRTC offer
- `webrtc_answer` - Send WebRTC answer
- `ice_candidate` - Exchange ICE candidates

**Chat Events:**
- `typing` - User typing indicator
- `stop_typing` - Stop typing
- `send_message` - Send chat message

**User Status:**
- `update_status` - Update online/offline status
- `user_status_change` - Broadcast status changes

### Frontend Socket Service

```typescript
import socketService from '@/services/socketService';

// Initialize connection
socketService.connect(token);

// Listen for incoming calls
socketService.onIncomingVideoCall((data) => {
  // Show incoming call modal
});

// Initiate a call
socketService.initiateVideoCall(chatId, recipientId, callId, roomId);

// Disconnect
socketService.disconnect();
```

---

## 🎯 Testing the Installation

### 1. Backend Health Check

```bash
# In backend directory
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
✅ Socket.io initialized
🚀 Server is running on port 5000
🔌 Socket.io: Enabled
```

Visit: http://localhost:5000/api/health

### 2. Frontend Development Server

```bash
# In frontend directory
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Socket.io Connection Test

Open browser console (F12) on http://localhost:5173:

```javascript
// Should see:
// ✅ Socket connected
// Socket ID: abc123xyz
```

---

## 🐛 Troubleshooting

### Issue: Socket.io not connecting

**Solution:**
```bash
# 1. Check backend .env
FRONTEND_URL=http://localhost:5173

# 2. Check frontend .env
VITE_SOCKET_URL=http://localhost:5000

# 3. Restart both servers
cd backend && npm start
cd frontend && npm run dev
```

### Issue: WebRTC calls not working

**Solution:**
```bash
# 1. Allow camera/microphone permissions in browser
# 2. Use HTTPS in production (required for WebRTC)
# 3. Check browser console for errors
```

### Issue: Module not found errors

**Solution:**
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: MongoDB connection failed

**Solution:**
```bash
# Option 1: Use local MongoDB
# Install MongoDB: https://www.mongodb.com/try/download/community
mongod --dbpath="C:\data\db"

# Option 2: Use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env with Atlas connection string
```

---

## 📊 Features Now Available

### ✅ Payment System
- Razorpay integration
- Escrow system
- Wallet management
- Auto-release on order acceptance
- Refund handling

### ✅ Provider Verification
- ID verification (5 document types)
- Skill certifications
- Background checks
- Admin review panels
- Verification score dashboard

### ✅ Advanced Communication
- Video calls (WebRTC)
- Voice calls (audio only)
- Screen sharing
- Call history tracking
- Real-time signaling (Socket.io)
- Incoming call notifications

### ✅ Real-time Features
- Online/offline status
- Typing indicators
- Instant notifications
- Live call events

---

## 🚀 Production Deployment

### Before Deploying:

1. **Update Environment Variables:**
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
JWT_SECRET=generate_strong_random_secret
```

2. **Enable HTTPS:**
   - Required for WebRTC features
   - Use SSL/TLS certificates
   - Update Socket.io CORS settings

3. **Database:**
   - Use MongoDB Atlas or managed MongoDB
   - Enable authentication
   - Create backups

4. **Security:**
   - Change all default passwords
   - Enable rate limiting
   - Add input validation
   - Implement CSRF protection

---

## 📚 Next Steps

1. **Test all features:**
   - Create test accounts
   - Submit ID verification
   - Make test calls
   - Process test payments

2. **Customize:**
   - Update branding
   - Configure email templates
   - Set Razorpay credentials
   - Adjust verification criteria

3. **Monitor:**
   - Check server logs
   - Monitor Socket.io connections
   - Track payment transactions
   - Review verification requests

---

## 🆘 Need Help?

### Documentation Files:
- `INTEGRATION_GUIDE.md` - Component integration examples
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full feature list
- `ADMIN_PANEL_GUIDE.md` - Admin features
- `PAYMENT_SYSTEM_GUIDE.md` - Payment integration

### Common Commands:

```bash
# Check running processes
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :5173  # Frontend

# Clear npm cache
npm cache clean --force

# View logs
npm start > backend.log 2>&1  # Backend logs
npm run dev > frontend.log 2>&1  # Frontend logs
```

---

## ✅ Installation Complete!

Your VSConnectO platform is now fully installed with:
- ✅ Real-time communication (Socket.io + WebRTC)
- ✅ Payment gateway (Razorpay + Escrow)
- ✅ Provider verification system
- ✅ Advanced call features
- ✅ Admin management panels

**Start both servers and visit http://localhost:5173 to begin!** 🎉
