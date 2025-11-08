# 🚀 Step-by-Step Testing Guide - Video/Voice Calls

## ✅ Step 1: Start Both Servers

### Option A: Automatic (Recommended)
```bash
# In project root directory
.\start-dev.bat
```

This will:
- ✅ Start backend server on http://localhost:5000
- ✅ Start frontend server on http://localhost:5173
- ✅ Open 2 separate command windows

**Wait until you see:**
```
Backend Window:
✅ MongoDB Connected Successfully
✅ Socket.io initialized
🚀 Server is running on port 5000
🔌 Socket.io: Enabled

Frontend Window:
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Option B: Manual
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## ✅ Step 2: Open 2 Browser Windows

### Window 1 (User A - Client)
1. Open **Chrome** in normal mode
2. Go to: **http://localhost:5173**
3. Open Developer Console (Press F12)
4. You should see: `✅ Socket connected` (once logged in)

### Window 2 (User B - Provider)
1. Open **Chrome** in **Incognito/Private** mode (Ctrl+Shift+N)
2. Go to: **http://localhost:5173**
3. Open Developer Console (Press F12)

**Why 2 windows?**
- You need 2 different users logged in simultaneously
- Incognito mode allows separate session/login

---

## ✅ Step 3: Create/Login as Different Users

### Window 1 - Register User A (Client)

1. Click **"Sign Up"** or go to http://localhost:5173/signup
2. Fill the form:
   ```
   Name: John Client
   Email: john@test.com
   Password: Test123!
   Role: Client
   ```
3. Click **"Create Account"**
4. You'll be logged in automatically

### Window 2 - Register User B (Provider)

1. Click **"Sign Up"** or go to http://localhost:5173/signup
2. Fill the form:
   ```
   Name: Sarah Provider
   Email: sarah@test.com
   Password: Test123!
   Role: Provider
   ```
3. Click **"Create Account"**
4. Complete provider profile (skills, rate, etc.)

**Alternative:** If you already have test accounts, just login with those credentials.

---

## ✅ Step 4: Start a Conversation

### From Window 1 (John - Client)

**Method A: Through Provider Browse**
1. Click **"Browse Providers"** in navigation
2. Find "Sarah Provider" in the list
3. Click on her profile
4. Click **"Message"** button
5. This opens the chat page

**Method B: Through Messages**
1. Click **"Messages"** in navigation
2. Click **"New Conversation"** or **"+"**
3. Search for "Sarah Provider"
4. Click to start chat

**Send a test message:**
```
Type: "Hi Sarah, I need help with my project!"
Press Send
```

### From Window 2 (Sarah - Provider)

1. You should see a notification: **"New message from John Client"**
2. Click **"Messages"** in navigation
3. Click on "John Client" conversation
4. Reply: "Hello John! I'd be happy to help."

**Now both users are in the same chat!**

---

## ✅ Step 5: Initiate Video/Voice Call

### Option A: Video Call

**From Window 1 (John):**

1. In the chat header, you'll see these buttons:
   ```
   [📹 Video] [📞 Phone] [🖥️ Screen]
   ```

2. Click the **📹 Video Call** button (camera icon)

3. **Browser will ask for permissions:**
   ```
   "localhost:5173 wants to use your camera and microphone"
   ```
   Click **"Allow"**

4. You'll see:
   - Your own video preview
   - "Calling Sarah..." message
   - Ringing sound

**From Window 2 (Sarah):**

1. **Incoming Call Modal appears:**
   ```
   ┌─────────────────────────────┐
   │  📹 Incoming Video Call      │
   │                             │
   │  [User Avatar]              │
   │  John Client                │
   │  is calling you...          │
   │                             │
   │  [Accept] [Decline]         │
   └─────────────────────────────┘
   ```

2. Click **"Accept"** button

3. **Browser asks for permissions:**
   ```
   "localhost:5173 wants to use your camera and microphone"
   ```
   Click **"Allow"**

4. **✅ Call Connected!**

---

### Option B: Voice Call

**Same process as video, but click the 📞 Phone icon instead:**

**From Window 1 (John):**
1. Click **📞 Voice Call** button
2. Allow microphone permission
3. Hear ringing sound

**From Window 2 (Sarah):**
1. See incoming voice call modal
2. Click **"Accept"**
3. Allow microphone permission
4. **✅ Voice call connected!**

---

## ✅ Step 6: During the Call

### Video Call Interface

**You'll see:**

```
┌────────────────────────────────────────┐
│  [Remote User Video - Large]           │
│                                        │
│    ┌──────────────┐                   │
│    │ Your Video   │  [00:45]          │
│    │ (Small PiP)  │                   │
│    └──────────────┘                   │
│                                        │
│  [🎤 Mute] [📹 Video] [🔴 End Call]   │
└────────────────────────────────────────┘
```

**Controls:**
- **🎤 Mute** - Toggle your microphone
- **📹 Video Off** - Toggle your camera
- **🔴 End Call** - Hang up

### Voice Call Interface

```
┌────────────────────────────┐
│                            │
│    [User Avatar]           │
│    Sarah Provider          │
│                            │
│    Connected - 00:45       │
│                            │
│  ▓▓▓░░░▓▓▓░░  (Waveform)   │
│                            │
│  [🎤 Mute] [🔊 Speaker]    │
│  [🔴 End Call]             │
│                            │
└────────────────────────────┘
```

---

## ✅ Step 7: End the Call

**Either user can end:**

1. Click **🔴 End Call** button
2. Call ends for both users
3. Back to chat interface
4. Call is saved in history

---

## 📊 What Happens Behind the Scenes

### When You Click "Video Call":

1. **Frontend → Backend:**
   ```
   POST /api/communication/video-call
   {
     chatId: "abc123",
     participantIds: ["user456"]
   }
   ```

2. **Backend creates call record**
   - Generates callId and roomId
   - Stores in database

3. **Socket.io notification:**
   ```javascript
   // Sent to recipient
   socket.emit('incoming_video_call', {
     callId: "call789",
     roomId: "room456",
     caller: { id, name, avatar }
   })
   ```

4. **WebRTC peer connection:**
   ```javascript
   // Both browsers connect directly
   Caller → Offer → Recipient
   Recipient → Answer → Caller
   ICE candidates exchanged
   Media streams flowing
   ```

---

## 🐛 Troubleshooting

### ❌ "No incoming call modal appears"

**Check:**
```javascript
// Window 2 console should show:
✅ Socket connected
📞 Incoming video call from: John Client
```

**Fix:**
- Refresh both browser windows
- Check if Socket.io is connected (see console)
- Make sure both servers are running

---

### ❌ "Cannot see video/audio"

**Check browser console:**
```javascript
// Should see:
📹 Local stream started
📡 WebRTC offer sent
📡 WebRTC answer received
🎥 Remote stream received
```

**Common issues:**

1. **Permissions denied:**
   - Click lock icon in address bar
   - Allow Camera & Microphone
   - Refresh page

2. **No camera/mic detected:**
   - Check if camera is connected
   - Close other apps using camera (Zoom, Teams)
   - Try different browser

3. **WebRTC connection failed:**
   ```javascript
   // Console shows: "ICE connection failed"
   ```
   - Check firewall settings
   - Try on same WiFi network
   - Use Chrome/Firefox (best WebRTC support)

---

### ❌ "Socket not connected"

**Window console shows no Socket.io logs:**

**Fix:**
```bash
# 1. Check backend is running
curl http://localhost:5000/api/health

# 2. Check FRONTEND_URL in backend/.env
FRONTEND_URL=http://localhost:5173

# 3. Check VITE_SOCKET_URL in frontend/.env
VITE_SOCKET_URL=http://localhost:5000

# 4. Restart both servers
```

---

### ❌ "Call connects but no audio/video"

**Check:**

1. **Camera/Mic selection:**
   - Click Settings in call interface
   - Select correct devices

2. **Browser permissions:**
   ```
   Chrome → Settings → Privacy and Security
   → Site Settings → Camera/Microphone
   → Allow for localhost:5173
   ```

3. **Test devices:**
   - Open https://webcamtests.com/
   - Verify camera works
   - Test microphone

---

## 📝 Testing Checklist

Before testing calls:

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] MongoDB running (check backend logs)
- [ ] 2 browser windows open (one incognito)
- [ ] 2 different users registered/logged in
- [ ] Chat conversation exists between them
- [ ] Socket.io connected (check console)
- [ ] Camera/microphone working
- [ ] Permissions allowed in browser

---

## 🎯 Quick Test Script

**Copy-paste this to test everything:**

### Terminal 1:
```bash
cd "A:\DT project\SIH 18 try\Connnecto\final 4"
.\start-dev.bat
```

### Browser Window 1 (Normal Chrome):
```
1. Go to: http://localhost:5173/signup
2. Register as: john@test.com / Test123! / Client
3. Go to: Browse Providers
4. Click on any provider
5. Click: Message
6. Send: "Hello!"
7. Click: 📹 Video Call button
8. Allow camera/mic permissions
9. Wait for other user to accept
```

### Browser Window 2 (Incognito Chrome):
```
1. Press Ctrl+Shift+N (open incognito)
2. Go to: http://localhost:5173/signup
3. Register as: sarah@test.com / Test123! / Provider
4. Complete profile
5. Go to: Messages
6. Wait for message from John
7. Click on John's conversation
8. Wait for incoming call modal
9. Click: Accept
10. Allow camera/mic permissions
11. ✅ Call connected!
```

---

## 🎥 Expected Result

**After following all steps, you should see:**

**Window 1 (John):**
- ✅ Large video of Sarah
- ✅ Small video of yourself (Picture-in-Picture)
- ✅ Timer showing call duration
- ✅ Mute/Video/End controls working

**Window 2 (Sarah):**
- ✅ Large video of John
- ✅ Small video of yourself (Picture-in-Picture)
- ✅ Same timer and controls

**Both can:**
- ✅ See each other in real-time
- ✅ Hear each other
- ✅ Toggle mute/video
- ✅ End call

---

## 📸 Screenshots of What You'll See

### 1. Chat Header with Call Buttons
```
┌─────────────────────────────────────────┐
│  👤 Sarah Provider    [📹] [📞] [🖥️]   │
└─────────────────────────────────────────┘
```

### 2. Incoming Call Modal
```
┌──────────────────────────┐
│   📹 Incoming Video Call  │
│                          │
│   [Avatar]               │
│   John Client            │
│   is calling you...      │
│                          │
│   [✅ Accept] [❌ Decline]│
└──────────────────────────┘
```

### 3. Active Video Call
```
┌────────────────────────────────┐
│ [Remote User - Fullscreen]     │
│                                │
│    ┌────────┐  ⏱️ 02:34       │
│    │ You    │                 │
│    │ (PiP)  │                 │
│    └────────┘                 │
│                                │
│ [🎤] [📹] [🔴 End]             │
└────────────────────────────────┘
```

---

## 🎉 Success!

If you see both video streams and can hear each other, **congratulations!** Your real-time video calling system is working perfectly!

**Next steps:**
- Test voice calls (same process)
- Test screen sharing
- Check call history
- Test on different networks
- Add more users and test group calls (future feature)

---

## 🆘 Still Having Issues?

### Quick Debug Commands:

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check if frontend is running
curl http://localhost:5173

# Check MongoDB connection
mongo VSConnectO --eval "db.stats()"

# Check ports
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# View backend logs
cd backend
npm start 2>&1 | Tee-Object backend.log

# View frontend logs
cd frontend  
npm run dev 2>&1 | Tee-Object frontend.log
```

### Check Console Logs:

**Backend console should show:**
```
✅ MongoDB Connected
✅ Socket.io initialized
🔌 User connected: John Client
📹 Video call from John to Sarah
```

**Browser console should show:**
```
✅ Socket connected
📹 Initiating video call
📡 Sending WebRTC offer
🎥 Remote stream received
```

---

**Good luck with testing! 🚀**
