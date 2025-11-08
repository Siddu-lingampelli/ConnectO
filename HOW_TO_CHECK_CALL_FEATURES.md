# 📹 How to Check & Test Call Features

## ✅ Quick Status Check

Your call features are **LIVE and READY** to test! Here's how to verify everything works.

---

## 🎯 What You Have Right Now

✅ **Video Calls** - Real camera access with live streaming  
✅ **Voice Calls** - Microphone-only audio calls  
✅ **Call UI** - Full-screen interface with controls  
✅ **Incoming Calls** - Accept/Decline modal popup  
✅ **Call Controls** - Mute, video toggle, end call  
✅ **Error Handling** - Permission denials handled gracefully

---

## 🧪 Testing Instructions (5 Minutes)

### Prerequisites
Make sure both servers are running:
- ✅ Backend: `http://localhost:5000`
- ✅ Frontend: `http://localhost:3011`

### Step-by-Step Test

#### 1️⃣ **Setup Test Environment** (1 minute)
```
Open 2 browser windows:
├─ Window 1: Normal Chrome/Edge browser
└─ Window 2: Incognito/Private mode (Ctrl+Shift+N)
```

#### 2️⃣ **Login as Two Users** (1 minute)
```
Window 1: Login as User A (Provider account)
Window 2: Login as User B (Client account)
```

**Don't have 2 users?** Create a second account:
- Click "Sign Up"
- Register as a different role
- Complete profile setup

#### 3️⃣ **Navigate to Messages** (30 seconds)
```
Both Windows:
├─ Click "Messages" in left sidebar
├─ Click on the same conversation
└─ You'll see the chat window
```

#### 4️⃣ **Find the Call Buttons** (10 seconds)
Look at the **top-right of the chat header**:
```
┌─────────────────────────────────────┐
│ [User Name] [Online Status]         │
│                  📹  📞  🖥️  [Live] │ ← HERE!
└─────────────────────────────────────┘
```

Three buttons:
- 📹 **Video Call** (green icon)
- 📞 **Voice Call** (blue icon)
- 🖥️ **Screen Share** (purple icon - coming soon)

#### 5️⃣ **Test Video Call** (2 minutes)

**In Window 1 (User A):**
1. Click the **📹 Video Call** button
2. Browser popup: "Allow camera and microphone?" → Click **Allow**
3. You'll see:
   - Black screen with your video loading
   - "Calling [User B]..." message
   - Your video appears in small corner

**In Window 2 (User B):**
1. **Incoming call popup appears automatically!**
   ```
   ┌─────────────────────────┐
   │    [Profile Picture]    │
   │                         │
   │      User A's Name      │
   │                         │
   │ 📹 Incoming Video Call  │
   │                         │
   │  [Decline]  [Accept]    │
   └─────────────────────────┘
   ```
2. Click **Accept**
3. Browser asks for permissions → Click **Allow**
4. **Call starts!**

**What Both Users See:**
```
┌─────────────────────────────────────┐
│ [User Name] 📹 Video Call [End Call]│
├─────────────────────────────────────┤
│                                     │
│    [Other Person's Video FULL]      │
│                                     │
│                  ┌─────────┐        │
│                  │  [Your  │        │
│                  │  Video] │ ←PiP   │
│                  └─────────┘        │
├─────────────────────────────────────┤
│      [🎤 Mute]  [📹 Video]          │
└─────────────────────────────────────┘
```

5. Click **End Call** (red button) to hang up

#### 6️⃣ **Test Voice Call** (1 minute)

**Same process but:**
1. Click **📞 Phone** button instead
2. Only microphone permission needed (no camera)
3. UI shows profile pictures instead of video
4. You can hear each other talking

---

## 🔍 What to Verify

### ✅ Visual Checks

**Before Call:**
- [ ] Three call buttons visible in chat header
- [ ] Buttons have hover effects (background color changes)
- [ ] Icons are clear and colored

**During Video Call:**
- [ ] Your video shows in small corner (top-right)
- [ ] Other person's video fills the screen
- [ ] "End Call" button visible at top
- [ ] Call controls at bottom (mute, video toggle)
- [ ] Video is smooth and real-time

**During Voice Call:**
- [ ] Profile pictures shown instead of video
- [ ] "Connected" status with green dot
- [ ] Audio is clear with no echo
- [ ] Mute button works

**Incoming Call:**
- [ ] Modal pops up immediately
- [ ] Shows caller's name and profile
- [ ] Accept/Decline buttons clear
- [ ] Modal is centered and visible

### ✅ Functional Checks

- [ ] Video call button requests camera + mic
- [ ] Voice call button requests mic only
- [ ] Permissions can be granted
- [ ] Call connects within 2-3 seconds
- [ ] Both users can see/hear each other
- [ ] End call stops all streams
- [ ] Decline call closes modal
- [ ] Toast notifications appear
- [ ] No errors in browser console (F12)

---

## 🐛 Troubleshooting

### "No call buttons visible"
**Solution:** Refresh the page, make sure you're in a chat conversation (not just messages list)

### "Permission denied" error
**Solution:** 
1. Click the camera icon in browser address bar
2. Change permissions to "Allow"
3. Refresh the page
4. Try again

### "Other user doesn't see incoming call"
**Solution:** 
- Make sure both users are in the SAME conversation
- Check both are on the Messages page
- Refresh Window 2

### "Camera not working"
**Solution:**
1. Close all other apps using camera (Zoom, Teams, etc.)
2. Check if camera is connected
3. Try in a different browser
4. Go to chrome://settings/content/camera to check permissions

### "No video/audio"
**Solution:**
1. Check browser console for errors (F12)
2. Verify camera/mic are not blocked by antivirus
3. Test on http://localhost (not HTTPS needed for localhost)
4. Try in Chrome/Edge (best WebRTC support)

---

## 📊 Expected Behavior

### Successful Video Call Flow
```
User A clicks Video → Permission granted → Call UI opens
                                              ↓
User B sees popup → Clicks Accept → Permission granted
                                              ↓
                    Both users connected in video call
                                              ↓
                    Can see/hear each other in real-time
                                              ↓
          Either user clicks End Call → Streams stop → Back to chat
```

### Toast Notifications
You should see these messages:
- "📹 Video call started! Calling [User]..."
- "Call accepted!"
- "Call ended"
- "Could not access camera/microphone..." (if permission denied)

---

## 🎬 Quick Demo Script

**Want to show someone? Follow this:**

1. **Show the buttons**: "See these call buttons in the chat header?"
2. **Click video call**: "Watch what happens when I click video call"
3. **Allow permissions**: "Browser asks for permission - I'll allow it"
4. **Show your video**: "Now my camera is active, see?"
5. **Switch to Window 2**: "The other user sees this popup"
6. **Accept call**: "They click accept and grant permission"
7. **Show connected call**: "Now we're in a live video call!"
8. **Point out features**: "See the picture-in-picture? Controls at bottom?"
9. **End call**: "And we can end it anytime with this button"
10. **Back to chat**: "Returns to normal chat. Simple!"

---

## 📱 Browser Console Check

Open browser console (F12) and check for:

**✅ Good Messages:**
```
✅ Socket.io connected
✅ Getting user media...
✅ Media stream acquired
✅ Call UI rendered
```

**❌ Error Messages:**
```
❌ NotAllowedError: Permission denied
❌ NotFoundError: Camera not found
❌ NotReadableError: Camera in use
```

If you see errors, check the troubleshooting section above.

---

## 🎯 Quick Test Checklist

Use this checklist for a 2-minute test:

```
□ Servers running (backend:5000, frontend:3011)
□ 2 browser windows open
□ 2 users logged in
□ Both in Messages page
□ Both in same conversation
□ Call buttons visible ✓
□ Click video call ✓
□ Allow permissions ✓
□ Incoming call appears ✓
□ Accept call ✓
□ Both see video ✓
□ End call works ✓
```

---

## 🚀 Production Readiness

For production deployment, you'll need:

1. **HTTPS Certificate** (required for camera access on non-localhost)
2. **STUN/TURN Servers** (for NAT traversal between different networks)
3. **WebRTC Signaling** (Socket.io already set up in backend)
4. **Error Monitoring** (track failed calls, permission issues)

But for **testing on localhost**, everything works RIGHT NOW! ✅

---

## 📞 Need Help?

If something doesn't work:

1. Check this guide's troubleshooting section
2. Open browser console (F12) and look for errors
3. Verify both servers are running
4. Try in Chrome/Edge (best WebRTC support)
5. Make sure you're testing on **localhost** (not remote server)

---

## 🎉 Summary

**Your call features are ready!**

✅ Real video calling with camera  
✅ Voice calling with microphone  
✅ Beautiful call UI  
✅ Incoming call notifications  
✅ Full call management  

**Just follow the 6 steps above to test in 5 minutes!** 🚀

---

**Last Updated:** November 7, 2025  
**Status:** ✅ Fully Functional  
**Test Environment:** Localhost (http://localhost:3011)
