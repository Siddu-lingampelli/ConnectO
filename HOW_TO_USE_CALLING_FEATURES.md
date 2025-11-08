# 📞 How to Use Calling Features - Complete Guide

## 🎯 Quick Overview

Your VSConnectO platform now has complete video, voice, and screen sharing capabilities. Here's how to use them:

---

## 🚀 Step-by-Step Integration

### Step 1: Import Services in Your Component

```typescript
// In your messaging or chat component
import socketService from '@/services/socketService';
import webrtcService from '@/services/webrtcService';
import communicationService from '@/services/communicationService';
import { VideoCallInterface } from '@/components/communication/VideoCallInterface';
import { VoiceCallInterface } from '@/components/communication/VoiceCallInterface';
import { IncomingCallModal } from '@/components/communication/IncomingCallModal';
```

### Step 2: Initialize Socket Connection

```typescript
import { useEffect, useState } from 'react';

function MessagingPage() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const token = localStorage.getItem('token'); // Your auth token

  useEffect(() => {
    // Connect to Socket.io server
    socketService.connect(token);

    // Listen for incoming video calls
    socketService.onIncomingVideoCall((data) => {
      setIncomingCall({
        type: 'video',
        ...data
      });
    });

    // Listen for incoming voice calls
    socketService.onIncomingVoiceCall((data) => {
      setIncomingCall({
        type: 'voice',
        ...data
      });
    });

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  // ... rest of component
}
```

### Step 3: Add Call Buttons to Your UI

```typescript
function ChatHeader({ recipientId, chatId, recipientName }) {
  const initiateVideoCall = async () => {
    try {
      // Create call in database
      const response = await communicationService.initiateVideoCall({
        chatId,
        participantIds: [recipientId]
      });

      const { callId, roomId } = response.data;

      // Notify recipient via Socket.io
      socketService.initiateVideoCall(
        chatId,
        recipientId,
        callId,
        roomId,
        {
          callerAvatar: currentUser.avatar,
          callerName: currentUser.name
        }
      );

      // Show video call interface
      setActiveCall({
        type: 'video',
        callId,
        roomId,
        role: 'caller'
      });
    } catch (error) {
      console.error('Failed to initiate video call:', error);
    }
  };

  const initiateVoiceCall = async () => {
    try {
      const response = await communicationService.initiateVoiceCall({
        chatId,
        participantIds: [recipientId]
      });

      const { callId, roomId } = response.data;

      socketService.initiateVoiceCall(
        chatId,
        recipientId,
        callId,
        roomId
      );

      setActiveCall({
        type: 'voice',
        callId,
        roomId,
        role: 'caller'
      });
    } catch (error) {
      console.error('Failed to initiate voice call:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-3">
        <img src={recipientAvatar} className="w-10 h-10 rounded-full" />
        <h3 className="font-semibold">{recipientName}</h3>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Video Call Button */}
        <button
          onClick={initiateVideoCall}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Start Video Call"
        >
          <Video className="w-5 h-5 text-emerald-600" />
        </button>

        {/* Voice Call Button */}
        <button
          onClick={initiateVoiceCall}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Start Voice Call"
        >
          <Phone className="w-5 h-5 text-emerald-600" />
        </button>
      </div>
    </div>
  );
}
```

### Step 4: Handle Incoming Calls

```typescript
function MessagingPage() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  const handleAcceptCall = async () => {
    try {
      // Accept call in database
      await communicationService.acceptCall(incomingCall.callId);

      // Notify caller via Socket.io
      socketService.acceptCall(
        incomingCall.callId,
        incomingCall.caller.id
      );

      // Show call interface
      setActiveCall({
        type: incomingCall.type,
        callId: incomingCall.callId,
        roomId: incomingCall.roomId,
        role: 'receiver'
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  const handleDeclineCall = async () => {
    try {
      await communicationService.declineCall(
        incomingCall.callId,
        'User declined'
      );

      socketService.declineCall(
        incomingCall.callId,
        incomingCall.caller.id,
        'User declined'
      );

      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
  };

  return (
    <div>
      {/* Your messaging UI */}
      
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          caller={incomingCall.caller}
          callType={incomingCall.type}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Active Call Interface */}
      {activeCall && activeCall.type === 'video' && (
        <VideoCallInterface
          callId={activeCall.callId}
          roomId={activeCall.roomId}
          isInitiator={activeCall.role === 'caller'}
          onCallEnd={() => setActiveCall(null)}
        />
      )}

      {activeCall && activeCall.type === 'voice' && (
        <VoiceCallInterface
          callId={activeCall.callId}
          roomId={activeCall.roomId}
          isInitiator={activeCall.role === 'caller'}
          onCallEnd={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}
```

---

## 📱 Complete Example Component

Here's a full working example:

```typescript
// src/pages/MessagingPage.tsx
import React, { useEffect, useState } from 'react';
import { Video, Phone, ScreenShare } from 'lucide-react';
import socketService from '@/services/socketService';
import communicationService from '@/services/communicationService';
import { VideoCallInterface } from '@/components/communication/VideoCallInterface';
import { VoiceCallInterface } from '@/components/communication/VoiceCallInterface';
import { ScreenShareViewer } from '@/components/communication/ScreenShareViewer';
import { IncomingCallModal } from '@/components/communication/IncomingCallModal';

export default function MessagingPage() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Initialize Socket.io connection
  useEffect(() => {
    socketService.connect(token);

    // Setup call listeners
    socketService.onIncomingVideoCall((data) => {
      setIncomingCall({ type: 'video', ...data });
    });

    socketService.onIncomingVoiceCall((data) => {
      setIncomingCall({ type: 'voice', ...data });
    });

    socketService.onIncomingScreenShare((data) => {
      setIncomingCall({ type: 'screen-share', ...data });
    });

    socketService.onCallEnded(() => {
      setActiveCall(null);
    });

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  // Start Video Call
  const startVideoCall = async () => {
    if (!currentChat) return;

    try {
      const response = await communicationService.initiateVideoCall({
        chatId: currentChat.id,
        participantIds: [currentChat.otherUser.id]
      });

      const { callId, roomId } = response.data;

      socketService.initiateVideoCall(
        currentChat.id,
        currentChat.otherUser.id,
        callId,
        roomId,
        {
          callerAvatar: currentUser.avatar,
          callerName: currentUser.name
        }
      );

      setActiveCall({
        type: 'video',
        callId,
        roomId,
        isInitiator: true,
        participant: currentChat.otherUser
      });
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to start video call. Please try again.');
    }
  };

  // Start Voice Call
  const startVoiceCall = async () => {
    if (!currentChat) return;

    try {
      const response = await communicationService.initiateVoiceCall({
        chatId: currentChat.id,
        participantIds: [currentChat.otherUser.id]
      });

      const { callId, roomId } = response.data;

      socketService.initiateVoiceCall(
        currentChat.id,
        currentChat.otherUser.id,
        callId,
        roomId
      );

      setActiveCall({
        type: 'voice',
        callId,
        roomId,
        isInitiator: true,
        participant: currentChat.otherUser
      });
    } catch (error) {
      console.error('Failed to start voice call:', error);
      alert('Failed to start voice call. Please try again.');
    }
  };

  // Start Screen Share
  const startScreenShare = async () => {
    if (!currentChat) return;

    try {
      const response = await communicationService.initiateScreenShare({
        chatId: currentChat.id,
        participantId: currentChat.otherUser.id
      });

      const { sessionId } = response.data;

      socketService.initiateScreenShare(
        currentChat.id,
        currentChat.otherUser.id,
        sessionId
      );

      setActiveCall({
        type: 'screen-share',
        sessionId,
        isInitiator: true,
        participant: currentChat.otherUser
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  };

  // Accept Incoming Call
  const acceptCall = async () => {
    try {
      await communicationService.acceptCall(incomingCall.callId);

      socketService.acceptCall(
        incomingCall.callId,
        incomingCall.caller.id
      );

      setActiveCall({
        type: incomingCall.type,
        callId: incomingCall.callId,
        roomId: incomingCall.roomId,
        isInitiator: false,
        participant: incomingCall.caller
      });

      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  // Decline Incoming Call
  const declineCall = async () => {
    try {
      await communicationService.declineCall(
        incomingCall.callId,
        'User declined'
      );

      socketService.declineCall(
        incomingCall.callId,
        incomingCall.caller.id,
        'User declined'
      );

      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
  };

  // End Active Call
  const endCall = () => {
    setActiveCall(null);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Sidebar */}
      <div className="w-1/4 bg-white border-r">
        {/* Your chat list */}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat && (
          <>
            {/* Chat Header with Call Buttons */}
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={currentChat.otherUser.avatar}
                  alt={currentChat.otherUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{currentChat.otherUser.name}</h3>
                  <span className="text-sm text-gray-500">
                    {currentChat.otherUser.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Video Call Button */}
                <button
                  onClick={startVideoCall}
                  className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                  title="Start Video Call"
                >
                  <Video className="w-5 h-5 text-emerald-600" />
                </button>

                {/* Voice Call Button */}
                <button
                  onClick={startVoiceCall}
                  className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                  title="Start Voice Call"
                >
                  <Phone className="w-5 h-5 text-emerald-600" />
                </button>

                {/* Screen Share Button */}
                <button
                  onClick={startScreenShare}
                  className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                  title="Share Screen"
                >
                  <ScreenShare className="w-5 h-5 text-emerald-600" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-4">
                  {/* Message rendering */}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              {/* Your message input */}
            </div>
          </>
        )}
      </div>

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          caller={incomingCall.caller || incomingCall.sharer}
          callType={incomingCall.type}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}

      {/* Active Call Interfaces */}
      {activeCall && activeCall.type === 'video' && (
        <div className="fixed inset-0 z-50">
          <VideoCallInterface
            callId={activeCall.callId}
            roomId={activeCall.roomId}
            isInitiator={activeCall.isInitiator}
            participantName={activeCall.participant.name}
            onCallEnd={endCall}
          />
        </div>
      )}

      {activeCall && activeCall.type === 'voice' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <VoiceCallInterface
            callId={activeCall.callId}
            roomId={activeCall.roomId}
            isInitiator={activeCall.isInitiator}
            participantName={activeCall.participant.name}
            onCallEnd={endCall}
          />
        </div>
      )}

      {activeCall && activeCall.type === 'screen-share' && (
        <div className="fixed inset-0 z-50">
          <ScreenShareViewer
            sessionId={activeCall.sessionId}
            isSharing={activeCall.isInitiator}
            onClose={endCall}
          />
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Adding Call Buttons to Existing Pages

### In Provider Profile Page

```typescript
// src/pages/ProviderProfile.tsx
import { Video, Phone } from 'lucide-react';

function ProviderProfile({ providerId }) {
  const startCall = async (type) => {
    // Create or get existing chat
    const chat = await createChatWithProvider(providerId);
    
    // Navigate to messaging with call intention
    navigate(`/messages/${chat.id}`, {
      state: { initiateCall: type }
    });
  };

  return (
    <div className="provider-profile">
      {/* Profile info */}
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => startCall('video')}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          <Video className="w-5 h-5" />
          Video Call
        </button>
        
        <button
          onClick={() => startCall('voice')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Phone className="w-5 h-5" />
          Voice Call
        </button>
      </div>
    </div>
  );
}
```

---

## 🔍 Call History Integration

```typescript
import { CallHistoryList } from '@/components/communication/CallHistoryList';

function CallHistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Call History</h1>
      
      <CallHistoryList
        onCallAgain={(call) => {
          // Initiate new call with same participant
          navigate(`/messages/${call.chatId}`, {
            state: { initiateCall: call.type, participantId: call.participantId }
          });
        }}
      />
    </div>
  );
}
```

---

## 🛠️ Testing the Calling Features

### 1. **Test Video Call**

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev

# Open two browser windows:
# Window 1: http://localhost:5173 (User A)
# Window 2: http://localhost:5173 (User B - incognito)

# Steps:
# 1. Login as User A in Window 1
# 2. Login as User B in Window 2
# 3. User A sends message to User B
# 4. User A clicks video call button
# 5. User B sees incoming call modal
# 6. User B clicks accept
# 7. Both users should see video streams
```

### 2. **Check Browser Console**

```javascript
// Should see these logs:
✅ Socket connected
Socket ID: xyz123...
📹 Local stream started
📡 WebRTC offer sent
📡 WebRTC answer received
🎥 Remote stream received
```

### 3. **Test Voice Call**

Same as video call but click the phone icon instead.

### 4. **Test Screen Share**

Click screen share button → Select window/screen → Recipient sees your screen.

---

## 🐛 Troubleshooting

### ❌ "getUserMedia is not supported"

**Problem:** Browser doesn't support WebRTC
**Solution:** Use Chrome, Firefox, or Safari (latest versions)

### ❌ "Permission denied"

**Problem:** Camera/microphone not allowed
**Solution:** 
```
Chrome: Settings → Privacy and security → Site settings → Camera/Microphone
Allow access for localhost:5173
```

### ❌ "Socket not connected"

**Problem:** Socket.io not connecting
**Solution:**
```typescript
// Check if backend is running
fetch('http://localhost:5000/api/health')

// Check Socket.io connection
console.log(socketService.isConnected());
```

### ❌ "No video/audio"

**Problem:** WebRTC peer connection failed
**Solution:**
```typescript
// Check ICE connection state
webrtcService.onConnectionStateChange((state) => {
  console.log('Connection state:', state);
});

// Should show: connecting → connected
// If shows "failed", check network/firewall
```

---

## 📚 Additional Resources

### API Documentation
- **Video Call API:** `POST /api/communication/video-call`
- **Voice Call API:** `POST /api/communication/voice-call`
- **Screen Share API:** `POST /api/communication/screen-share`
- **Call History API:** `GET /api/communication/call-history`

### Service Methods

**socketService:**
```typescript
connect(token)
disconnect()
initiateVideoCall(chatId, recipientId, callId, roomId)
initiateVoiceCall(chatId, recipientId, callId, roomId)
acceptCall(callId, callerId)
declineCall(callId, callerId, reason)
endCall(callId, participantIds)
```

**webrtcService:**
```typescript
startCall(callId, enableVideo, enableAudio)
createOffer(callId)
createAnswer(callId, offer)
handleAnswer(callId, answer)
handleICECandidate(callId, candidate)
endCall(callId)
toggleVideo(callId)
toggleAudio(callId)
```

**communicationService:**
```typescript
initiateVideoCall(data)
initiateVoiceCall(data)
initiateScreenShare(data)
acceptCall(callId)
declineCall(callId, reason)
endCall(callId, duration)
getCallHistory(filters)
```

---

## ✅ Quick Checklist

Before testing calls:

- [ ] Backend server running (`npm start` in backend/)
- [ ] Frontend server running (`npm run dev` in frontend/)
- [ ] Socket.io connected (check browser console)
- [ ] Camera/microphone permissions granted
- [ ] Two test accounts created
- [ ] Both users logged in (different browsers/windows)
- [ ] Chat conversation exists between users

---

## 🎉 You're Ready!

Your calling features are fully functional! Just:

1. Add the call buttons to your messaging page
2. Import the call components
3. Handle incoming calls with the modal
4. Test with two browser windows

**Need more help?** Check the complete integration examples in `INTEGRATION_GUIDE.md`!
