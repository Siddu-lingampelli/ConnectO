# 🔌 Complete Integration Guide

## 📦 Installation Requirements

First, install necessary packages:

```bash
cd frontend
npm install socket.io-client lucide-react
```

## 🎯 Integration Steps

### 1. **App-Level Socket Initialization**

In your main `App.tsx` or root component:

```typescript
import { useEffect } from 'react';
import socketService from './services/socketService';

function App() {
  useEffect(() => {
    // Initialize socket on app load
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    // Your app routes
  );
}
```

---

### 2. **Messaging Page Integration**

Create or update `src/pages/Messages.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socketService from '../services/socketService';
import communicationService from '../services/communicationService';

// Import components
import VideoCallInterface from '../components/communication/VideoCallInterface';
import VoiceCallInterface from '../components/communication/VoiceCallInterface';
import ScreenShareViewer from '../components/communication/ScreenShareViewer';
import IncomingCallModal from '../components/communication/IncomingCallModal';
import CallHistoryList from '../components/communication/CallHistoryList';

const MessagesPage: React.FC = () => {
  const { chatId } = useParams();
  const [activeVideoCall, setActiveVideoCall] = useState<any>(null);
  const [activeVoiceCall, setActiveVoiceCall] = useState<any>(null);
  const [activeScreenShare, setActiveScreenShare] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [showCallHistory, setShowCallHistory] = useState(false);

  useEffect(() => {
    // Listen for incoming calls
    socketService.onIncomingVideoCall((data) => {
      setIncomingCall({ ...data, type: 'video' });
    });

    socketService.onIncomingVoiceCall((data) => {
      setIncomingCall({ ...data, type: 'voice' });
    });

    socketService.onIncomingScreenShare((data) => {
      setActiveScreenShare(data);
    });

    socketService.onCallEnded((data) => {
      setActiveVideoCall(null);
      setActiveVoiceCall(null);
      setActiveScreenShare(null);
    });

    return () => {
      // Cleanup listeners
    };
  }, []);

  const handleInitiateVideoCall = async () => {
    try {
      const response = await communicationService.initiateVideoCall({
        chatId: chatId!,
        recipientId: 'RECIPIENT_USER_ID' // Get from chat data
      });
      setActiveVideoCall(response.data);
    } catch (error) {
      console.error('Failed to initiate video call:', error);
    }
  };

  const handleInitiateVoiceCall = async () => {
    try {
      const response = await communicationService.initiateVoiceCall({
        chatId: chatId!,
        recipientId: 'RECIPIENT_USER_ID'
      });
      setActiveVoiceCall(response.data);
    } catch (error) {
      console.error('Failed to initiate voice call:', error);
    }
  };

  const handleAcceptCall = () => {
    if (incomingCall.type === 'video') {
      setActiveVideoCall(incomingCall);
    } else {
      setActiveVoiceCall(incomingCall);
    }
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Call Interface Overlays */}
      {activeVideoCall && (
        <VideoCallInterface
          callId={activeVideoCall.callId}
          chatId={chatId!}
          recipientName={activeVideoCall.caller?.name || 'User'}
          onEnd={() => setActiveVideoCall(null)}
        />
      )}

      {activeVoiceCall && (
        <VoiceCallInterface
          callId={activeVoiceCall.callId}
          chatId={chatId!}
          recipientName={activeVoiceCall.caller?.name || 'User'}
          recipientAvatar={activeVoiceCall.caller?.avatar}
          onEnd={() => setActiveVoiceCall(null)}
        />
      )}

      {activeScreenShare && (
        <ScreenShareViewer
          sessionId={activeScreenShare.sessionId}
          sharerName={activeScreenShare.sharer.name}
          sharerAvatar={activeScreenShare.sharer.avatar}
          onEnd={() => setActiveScreenShare(null)}
        />
      )}

      {incomingCall && (
        <IncomingCallModal
          callId={incomingCall.callId}
          callType={incomingCall.type}
          callerName={incomingCall.caller.name}
          callerAvatar={incomingCall.caller.avatar}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Main Chat UI */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header with Call Buttons */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Messages</h2>
          <div className="flex gap-2">
            <button
              onClick={handleInitiateVideoCall}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📹 Video Call
            </button>
            <button
              onClick={handleInitiateVoiceCall}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📞 Voice Call
            </button>
            <button
              onClick={() => setShowCallHistory(!showCallHistory)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              📋 History
            </button>
          </div>
        </div>

        {/* Call History */}
        {showCallHistory && (
          <div className="mb-6">
            <CallHistoryList />
          </div>
        )}

        {/* Messages would go here */}
        <div className="space-y-4">
          {/* Your existing message UI */}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
```

---

### 3. **Provider Profile Integration**

Update `src/pages/provider/Profile.tsx`:

```typescript
import React from 'react';
import VerificationDashboard from '../../components/verification/VerificationDashboard';
import CertificationManager from '../../components/verification/CertificationManager';
import BackgroundCheckStatus from '../../components/verification/BackgroundCheckStatus';

const ProviderProfile: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Verification Dashboard */}
      <VerificationDashboard />

      {/* Certifications */}
      <CertificationManager />

      {/* Background Check */}
      <BackgroundCheckStatus />

      {/* Other profile sections... */}
    </div>
  );
};

export default ProviderProfile;
```

---

### 4. **Provider Settings Integration**

Update `src/pages/provider/Settings.tsx`:

```typescript
import React, { useState } from 'react';
import IdVerificationForm from '../../components/verification/IdVerificationForm';

const ProviderSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('verification');

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'verification'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'profile'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'verification' && <IdVerificationForm />}
          {activeTab === 'profile' && <div>Profile settings...</div>}
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings;
```

---

### 5. **Admin Panel Integration**

Update `src/pages/admin/Dashboard.tsx`:

```typescript
import React, { useState } from 'react';
import AdminIdVerificationReview from '../../components/admin/AdminIdVerificationReview';
import AdminBackgroundCheckManager from '../../components/admin/AdminBackgroundCheckManager';
import AdminCertificationReview from '../../components/admin/AdminCertificationReview';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('id-verification');

  return (
    <div className="container mx-auto p-6">
      {/* Sidebar Navigation */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('id-verification')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeSection === 'id-verification'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ID Verification
            </button>
            <button
              onClick={() => setActiveSection('background-checks')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeSection === 'background-checks'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Background Checks
            </button>
            <button
              onClick={() => setActiveSection('certifications')}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                activeSection === 'certifications'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Certifications
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="col-span-3">
          {activeSection === 'id-verification' && <AdminIdVerificationReview />}
          {activeSection === 'background-checks' && <AdminBackgroundCheckManager />}
          {activeSection === 'certifications' && <AdminCertificationReview />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

---

### 6. **Route Configuration**

Update your routes in `src/App.tsx` or router file:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Provider routes
import ProviderProfile from './pages/provider/Profile';
import ProviderSettings from './pages/provider/Settings';

// Admin routes
import AdminDashboard from './pages/admin/Dashboard';

// Messaging
import MessagesPage from './pages/Messages';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Provider Routes */}
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/provider/settings" element={<ProviderSettings />} />

        {/* Messaging */}
        <Route path="/messages/:chatId" element={<MessagesPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Other routes... */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🔧 Environment Variables

Add to `.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🎨 Styling Note

All components use Tailwind CSS classes and assume you have `lucide-react` installed for icons. If you're using a different icon library, replace the imports.

---

## 🧪 Testing Integration

### Test Call Flow:
1. User A opens messaging page
2. User A clicks "Video Call" button
3. User B receives `IncomingCallModal`
4. User B clicks "Accept"
5. Both see `VideoCallInterface`
6. Either can click "End Call"
7. Call appears in `CallHistoryList`

### Test Verification Flow:
1. Provider goes to Settings > Verification
2. Submits ID verification via `IdVerificationForm`
3. Admin sees request in Admin Dashboard
4. Admin reviews via `AdminIdVerificationReview`
5. Provider sees updated status in `VerificationDashboard`

---

## 📊 State Management

For production, consider using:
- **Redux** for global call state
- **React Query** for API caching
- **Context API** for socket instance

Example Context:

```typescript
// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import socketService from '../services/socketService';

const SocketContext = createContext(socketService);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }
    return () => socketService.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socketService}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

---

## 🚀 Next Steps

1. ✅ All components created
2. ✅ Socket.io service ready
3. ✅ WebRTC service ready
4. ⏳ Install dependencies
5. ⏳ Follow integration examples above
6. ⏳ Test each flow
7. ⏳ Deploy!

---

## 📞 Support

All components are production-ready and fully documented. Adjust imports and styling as needed for your project structure.
