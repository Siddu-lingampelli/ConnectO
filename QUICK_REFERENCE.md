# 🎯 VSConnectO - Quick Reference Card

## ⚡ Start Servers

```bash
# Windows (Automatic)
.\start-dev.bat

# Manual
# Terminal 1: cd backend && npm start
# Terminal 2: cd frontend && npm run dev
```

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health Check | http://localhost:5000/api/health |
| Socket.io | ws://localhost:5000 |

## 🔑 Key API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Verification
```
POST /api/verification/id-verification
GET  /api/verification/background-check
POST /api/verification/certification
GET  /api/verification/score
```

### Communication
```
POST /api/communication/video-call
POST /api/communication/voice-call
POST /api/communication/screen-share
GET  /api/communication/call-history
```

### Payments
```
POST /api/payment/create-order
POST /api/payment/verify
GET  /api/wallet/balance
POST /api/wallet/withdraw
```

## 📦 Components

### Verification
- `IdVerificationForm` - Submit ID
- `CertificationForm` - Add certs
- `CertificationManager` - Manage certs
- `VerificationDashboard` - Score view
- `BackgroundCheckStatus` - Check status

### Communication
- `VideoCallInterface` - Video calls
- `VoiceCallInterface` - Voice calls
- `ScreenShareViewer` - Screen share
- `CallHistoryList` - Call history
- `IncomingCallModal` - Accept/decline

### Admin
- `AdminIdVerificationReview` - Review IDs
- `AdminBackgroundCheckManager` - Manage checks
- `AdminCertificationReview` - Verify certs

## 🔌 Socket.io Events

### Emit (Client → Server)
```typescript
// Call management
socketService.initiateVideoCall(chatId, recipientId, callId, roomId)
socketService.acceptCall(callId, callerId)
socketService.declineCall(callId, callerId)
socketService.endCall(callId, participantIds)

// WebRTC signaling
socketService.sendWebRTCOffer(callId, targetUserId, offer)
socketService.sendWebRTCAnswer(callId, targetUserId, answer)
socketService.sendICECandidate(callId, targetUserId, candidate)
```

### Listen (Server → Client)
```typescript
socketService.onIncomingVideoCall((data) => { /* handle */ })
socketService.onIncomingVoiceCall((data) => { /* handle */ })
socketService.onCallAccepted((data) => { /* handle */ })
socketService.onCallDeclined((data) => { /* handle */ })
socketService.onCallEnded((data) => { /* handle */ })
```

## 🎥 WebRTC Usage

```typescript
import webrtcService from '@/services/webrtcService';

// Initialize call
const localStream = await webrtcService.startCall(callId, true, true);

// Handle remote stream
webrtcService.onRemoteStream((stream) => {
  videoRef.current.srcObject = stream;
});

// Create offer
const offer = await webrtcService.createOffer(callId);

// Handle answer
await webrtcService.handleAnswer(callId, answer);

// End call
webrtcService.endCall(callId);
```

## 🛠️ Common Commands

```bash
# Development
npm start                  # Backend
npm run dev                # Frontend

# Testing
npm test                   # Run tests
npm run lint               # Check code

# Troubleshooting
npm install                # Reinstall deps
rm -rf node_modules        # Clean deps
netstat -ano | findstr :5000  # Check port
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vsconnecto
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Port in use | `netstat -ano \| findstr :5000` then `taskkill /PID xxx /F` |
| MongoDB error | Start MongoDB: `mongod --dbpath="C:\data\db"` |
| Socket not connecting | Check FRONTEND_URL in backend .env matches |
| WebRTC no media | Allow camera/mic permissions in browser |
| CORS error | Verify FRONTEND_URL and VITE_API_URL match |

## ✅ Health Checks

```bash
# Backend running
curl http://localhost:5000/api/health

# Frontend running
curl http://localhost:5173

# Socket.io connected
# Open browser console at localhost:5173
# Should see: "✅ Socket connected"
```

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| `COMPLETE_INSTALLATION_GUIDE.md` | Full setup |
| `ENVIRONMENT_SETUP.md` | Env variables |
| `FINAL_SETUP_CHECKLIST.md` | Pre-launch |
| `INTEGRATION_GUIDE.md` | Code examples |
| `INSTALLATION_SUCCESS_REPORT.md` | What was built |

## 🎓 Best Practices

✅ Always restart server after .env changes
✅ Check console for errors (F12)
✅ Use Socket.io for real-time features
✅ Use WebRTC for peer-to-peer media
✅ Test on HTTPS in production
✅ Generate strong JWT secrets
✅ Use MongoDB Atlas for production

---

**Need help?** See full docs in project root!
