# 🚀 Quick Start - Advanced Features

## For Backend Testing (Ready Now!)

### 1. Test ID Verification

```javascript
// Submit ID Verification
POST http://localhost:5000/api/verification/id
Headers: {
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "idType": "aadhaar",
  "idNumber": "1234-5678-9012",
  "idDocumentUrl": "/uploads/id/aadhaar_123.jpg",
  "selfieUrl": "/uploads/id/selfie_123.jpg"
}

// Expected Response:
{
  "success": true,
  "message": "ID verification submitted successfully. Admin will review shortly.",
  "data": {
    "status": "pending",
    "idType": "aadhaar",
    "idNumber": "1234-5678-9012",
    "submittedAt": "2024-11-07T10:30:00.000Z"
  }
}
```

### 2. Test Background Check (Admin)

```javascript
// Request Background Check
POST http://localhost:5000/api/verification/background-check/USER_ID
Headers: {
  "Authorization": "Bearer ADMIN_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "provider": "Manual Review",
  "notes": "High-value provider requiring verification"
}

// Expected Response:
{
  "success": true,
  "message": "Background check initiated",
  "data": {
    "status": "in_progress",
    "requestedAt": "2024-11-07T10:30:00.000Z",
    "checks": {
      "criminalRecord": "pending",
      "employmentHistory": "pending",
      "educationVerification": "pending",
      "referenceCheck": "pending"
    }
  }
}
```

### 3. Test Skill Certification

```javascript
// Add Certification
POST http://localhost:5000/api/verification/certifications
Headers: {
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "skill": "React.js",
  "certificationName": "Meta Front-End Developer Certificate",
  "issuingOrganization": "Meta (Coursera)",
  "issueDate": "2024-01-15",
  "expiryDate": null,
  "credentialId": "ABC123XYZ",
  "credentialUrl": "https://coursera.org/verify/ABC123XYZ",
  "certificateUrl": "/uploads/certs/react_cert_123.pdf"
}

// Expected Response:
{
  "success": true,
  "message": "Certification added successfully. Admin will verify it soon.",
  "data": [
    {
      "_id": "cert_123",
      "skill": "React.js",
      "certificationName": "Meta Front-End Developer Certificate",
      "verificationStatus": "pending",
      "addedAt": "2024-11-07T10:30:00.000Z"
    }
  ]
}
```

### 4. Test Video Call

```javascript
// Initiate Video Call
POST http://localhost:5000/api/communication/video-call/initiate
Headers: {
  "Authorization": "Bearer YOUR_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "receiverId": "6123abc456def789"
}

// Expected Response:
{
  "success": true,
  "message": "Video call initiated",
  "data": {
    "messageId": "msg_123",
    "roomId": "video_1699876543_a1b2c3d4",
    "callData": {
      "status": "initiated",
      "roomId": "video_1699876543_a1b2c3d4",
      "startedAt": "2024-11-07T10:30:00.000Z",
      "participants": [
        {
          "userId": "YOUR_USER_ID",
          "joinedAt": "2024-11-07T10:30:00.000Z"
        }
      ]
    }
  }
}
```

### 5. Get Verification Overview

```javascript
// Get Complete Overview
GET http://localhost:5000/api/verification/overview
Headers: {
  "Authorization": "Bearer YOUR_TOKEN"
}

// Expected Response:
{
  "success": true,
  "data": {
    "basicVerification": {
      "status": "verified",
      "verifiedAt": "2024-10-01T10:00:00.000Z"
    },
    "demoVerification": {
      "status": "verified",
      "score": 85
    },
    "idVerification": {
      "status": "pending",
      "idType": "aadhaar",
      "submittedAt": "2024-11-07T10:30:00.000Z"
    },
    "backgroundCheck": {
      "status": "not_initiated"
    },
    "skillCertifications": [
      {
        "_id": "cert_123",
        "skill": "React.js",
        "certificationName": "Meta Front-End Developer Certificate",
        "verificationStatus": "pending"
      }
    ],
    "completionPercentage": 40,
    "isFullyVerified": false
  }
}
```

---

## For Frontend Development (Start Here!)

### Step 1: Create Services

#### `frontend/src/services/verificationService.ts`
```typescript
import api from '../lib/api';

export const verificationService = {
  // ID Verification
  submitIdVerification: async (data: {
    idType: string;
    idNumber: string;
    idDocumentUrl: string;
    selfieUrl: string;
  }) => {
    const response = await api.post('/verification/id', data);
    return response.data;
  },

  // Skill Certifications
  addCertification: async (data: {
    skill: string;
    certificationName: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    certificateUrl?: string;
  }) => {
    const response = await api.post('/verification/certifications', data);
    return response.data;
  },

  deleteCertification: async (certId: string) => {
    const response = await api.delete(`/verification/certifications/${certId}`);
    return response.data;
  },

  // Overview
  getVerificationOverview: async () => {
    const response = await api.get('/verification/overview');
    return response.data;
  }
};
```

#### `frontend/src/services/communicationService.ts`
```typescript
import api from '../lib/api';

export const communicationService = {
  // Video Call
  initiateVideoCall: async (receiverId: string) => {
    const response = await api.post('/communication/video-call/initiate', { receiverId });
    return response.data;
  },

  joinVideoCall: async (messageId: string) => {
    const response = await api.put(`/communication/video-call/${messageId}/join`);
    return response.data;
  },

  endVideoCall: async (messageId: string, duration: number) => {
    const response = await api.put(`/communication/video-call/${messageId}/end`, { duration });
    return response.data;
  },

  // Voice Call (similar structure)
  initiateVoiceCall: async (receiverId: string) => {
    const response = await api.post('/communication/voice-call/initiate', { receiverId });
    return response.data;
  },

  // Call History
  getCallHistory: async (type?: string, page = 1, limit = 20) => {
    const response = await api.get('/communication/call-history', {
      params: { type, page, limit }
    });
    return response.data;
  }
};
```

### Step 2: Create Basic Component

#### `frontend/src/components/verification/IdVerificationForm.tsx`
```tsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { verificationService } from '../../services/verificationService';

const IdVerificationForm = () => {
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idNumber) {
      toast.error('Please enter ID number');
      return;
    }

    try {
      setSubmitting(true);
      
      // Here you would upload files and get URLs
      const idDocumentUrl = '/uploads/id/test.jpg';
      const selfieUrl = '/uploads/id/selfie.jpg';

      await verificationService.submitIdVerification({
        idType,
        idNumber,
        idDocumentUrl,
        selfieUrl
      });

      toast.success('ID verification submitted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">ID Verification</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Type
          </label>
          <select
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="aadhaar">Aadhaar Card</option>
            <option value="pan">PAN Card</option>
            <option value="passport">Passport</option>
            <option value="driving_license">Driving License</option>
            <option value="voter_id">Voter ID</option>
          </select>
        </div>

        {/* ID Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID Number
          </label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="Enter your ID number"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Uploads would go here */}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {submitting ? 'Submitting...' : 'Submit Verification'}
        </button>
      </form>
    </div>
  );
};

export default IdVerificationForm;
```

### Step 3: Add to Verification Page

```tsx
// In frontend/src/pages/Verification.tsx

import IdVerificationForm from '../components/verification/IdVerificationForm';

// Add after existing verification form
<IdVerificationForm />
```

---

## Testing Checklist

### Backend Testing
- [ ] Start backend server: `cd backend && node server.js`
- [ ] Test ID verification submission
- [ ] Test background check request (admin)
- [ ] Test certification add
- [ ] Test verification overview
- [ ] Test video call initiation
- [ ] Test call history
- [ ] Verify notifications are sent
- [ ] Check database for new fields

### Frontend Testing (After Creating UI)
- [ ] ID verification form renders
- [ ] File upload works
- [ ] Submission success shows toast
- [ ] Status updates in UI
- [ ] Certification manager shows list
- [ ] Add certification form works
- [ ] Delete certification works
- [ ] Verification dashboard shows progress
- [ ] Video call button appears
- [ ] Video call interface opens
- [ ] WebRTC connection works

---

## Common Issues & Solutions

### Issue: "Cannot read property 'status' of undefined"
**Solution:** User model may not have the new fields. Re-sync database or create new test user.

### Issue: "Authorization failed"
**Solution:** Ensure valid JWT token in Authorization header.

### Issue: "Admin routes not accessible"
**Solution:** Add admin middleware to routes. Update user role to 'admin' in database.

### Issue: "File upload fails"
**Solution:** Check `express-fileupload` middleware is configured. Max file size is 10MB.

### Issue: "Video call not connecting"
**Solution:** WebRTC requires:
1. WebRTC library (PeerJS, Daily.co, Twilio)
2. Signaling server (Socket.io)
3. STUN/TURN servers
4. HTTPS in production

---

## Next Steps

1. **Week 1:** Frontend services & basic UI
2. **Week 2:** Video/voice call integration
3. **Week 3:** Admin panel & testing
4. **Week 4:** Polish, optimization, deployment

---

## Documentation Files

1. **ADVANCED_COMMUNICATION_VERIFICATION_SYSTEM.md** - Complete guide (8,000+ words)
2. **IMPLEMENTATION_SUMMARY.md** - Quick overview
3. **QUICK_START.md** - This file

---

## Support

Need help? Check:
1. Console logs for errors
2. Network tab for API responses
3. Database for field existence
4. Notification system for user feedback

---

**Ready to Start? Begin with Step 1: Create Services! 🚀**
