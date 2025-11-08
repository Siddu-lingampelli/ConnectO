# 📧 Email System - Complete Implementation Guide

## ✅ Current Status

### **What's Already Implemented:**

1. **Email Configuration** ✅
   - Multi-provider support (Gmail, SMTP, SendGrid/Resend)
   - `backend/config/email.config.js` - Ready to use

2. **Email Service** ✅
   - Comprehensive email templates
   - `backend/services/email.service.js` - Fully functional
   - Templates include:
     - Welcome emails ✅
     - Job notifications ✅
     - Proposal notifications ✅
     - Order notifications ✅
     - Password reset emails ✅
     - Email verification ✅

3. **Current Integration:**
   - Welcome emails sent on registration ✅
   - Non-blocking email sending ✅

---

## 🔴 What's Missing (Implementation Needed)

### **1. Database Schema Updates**

**User Model needs new fields:**
```javascript
// Add to User.model.js
{
  // Email Verification
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Account Security
  passwordChangedAt: Date
}
```

### **2. Auth Controller Updates**

**Missing endpoints:**
- `POST /api/auth/send-verification` - Send/resend verification email
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### **3. Frontend Pages**

**Missing pages:**
- Email verification page
- Password reset request page
- Password reset confirmation page
- Email sent confirmation pages

---

## 🚀 Implementation Steps

### **STEP 1: Update User Model**

**File:** `backend/models/User.model.js`

Add these fields to the schema:
```javascript
// Email Verification
isEmailVerified: {
  type: Boolean,
  default: false
},
emailVerificationToken: {
  type: String,
  select: false
},
emailVerificationExpires: {
  type: Date,
  select: false
},

// Password Reset
resetPasswordToken: {
  type: String,
  select: false
},
resetPasswordExpires: {
  type: Date,
  select: false
},

// Security
passwordChangedAt: Date
```

Add these methods:
```javascript
// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  
  return resetToken;
};

// Check if password was changed after JWT was issued
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
```

---

### **STEP 2: Add Email Verification Endpoints**

**File:** `backend/controllers/auth.controller.js`

Add these functions:

```javascript
// @desc    Send email verification
// @route   POST /api/auth/send-verification
// @access  Private
export const sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Generate verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    // Send verification email
    await sendEmailVerification(user.email, user.fullName, verificationToken);
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification email',
      error: error.message
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    // Hash token to compare with database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};
```

---

### **STEP 3: Add Password Reset Endpoints**

**File:** `backend/controllers/auth.controller.js`

```javascript
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // Send reset email
    await sendPasswordResetEmail(user.email, user.fullName, resetToken);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending reset email',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }
    
    // Hash token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }
    
    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};
```

---

### **STEP 4: Update Auth Routes**

**File:** `backend/routes/auth.routes.js`

Add these routes:
```javascript
router.post('/send-verification', protect, sendEmailVerification);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
```

---

### **STEP 5: Update Auth Middleware**

**File:** `backend/middleware/auth.middleware.js`

Add password change check:
```javascript
// Check if user changed password after token was issued
if (user.changedPasswordAfter(decoded.iat)) {
  return res.status(401).json({
    success: false,
    message: 'User recently changed password. Please login again.'
  });
}
```

---

### **STEP 6: Frontend Implementation**

#### **6.1 Email Verification Page**

**Create:** `frontend/src/pages/VerifyEmail.tsx`

```typescript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing');
      return;
    }
    
    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully!');
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      }
    };
    
    verify();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin h-12 w-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Verifying your email...</h2>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-emerald-600 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

#### **6.2 Forgot Password Page**

**Create:** `frontend/src/pages/ForgotPassword.tsx`

```typescript
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await forgotPassword(email);
      setStatus('success');
      setMessage('Password reset link sent to your email!');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to send reset email');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-6xl mb-4">✉️</div>
            <p className="text-emerald-600 font-semibold mb-2">{message}</p>
            <p className="text-gray-600 text-sm mb-4">Check your inbox and follow the instructions.</p>
            <Link to="/login" className="text-emerald-600 hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
                placeholder="Enter your email"
              />
            </div>
            
            {status === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {message}
              </div>
            )}
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="mt-4 text-center">
              <Link to="/login" className="text-emerald-600 hover:underline text-sm">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

#### **6.3 Reset Password Page**

**Create:** `frontend/src/pages/ResetPassword.tsx`

```typescript
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }
    
    setStatus('loading');
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid reset link');
      return;
    }
    
    try {
      await resetPassword(token, password);
      setStatus('success');
      setMessage('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to reset password');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create New Password</h2>
        
        {status === 'success' ? (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-emerald-600 font-semibold mb-2">{message}</p>
            <p className="text-gray-600 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
                placeholder="Enter new password"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-600"
                placeholder="Confirm new password"
              />
            </div>
            
            {status === 'error' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {message}
              </div>
            )}
            
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

#### **6.4 Update Auth Service**

**Add to:** `frontend/src/services/authService.ts`

```typescript
export const verifyEmail = async (token: string) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

export const sendEmailVerification = async () => {
  const response = await api.post('/auth/send-verification');
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
};
```

#### **6.5 Add Routes**

**Update:** `frontend/src/App.tsx`

```typescript
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Add routes
<Route path="/verify-email" element={<VerifyEmail />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

---

## 🔧 Environment Variables

Add to `.env`:

```env
# Email Configuration (Choose one provider)

# Option 1: Gmail (Easiest for testing)
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Generate from Google Account settings

# Option 2: Generic SMTP
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password

# Option 3: SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3011

# Admin email for notifications
ADMIN_EMAIL=admin@connecto.com
```

---

## 🎯 Testing Checklist

### **Email Verification Flow:**
- [ ] Register new user
- [ ] Receive welcome email
- [ ] Check if verification email is sent automatically
- [ ] Click verification link
- [ ] Verify account status changes to verified
- [ ] Try resending verification email

### **Password Reset Flow:**
- [ ] Click "Forgot Password" on login page
- [ ] Enter email and submit
- [ ] Receive reset email
- [ ] Click reset link
- [ ] Enter new password
- [ ] Login with new password
- [ ] Check that old password doesn't work

### **Order Notifications:**
- [ ] Create order → Provider receives email
- [ ] Complete order → Client receives email
- [ ] Approve order → Provider receives payment email

---

## 📊 Email System Architecture

```
User Action
    ↓
Controller (auth.controller.js)
    ↓
User Model (generate token)
    ↓
Email Service (email.service.js)
    ↓
Email Config (email.config.js)
    ↓
Nodemailer Transporter
    ↓
Email Provider (Gmail/SMTP/SendGrid)
    ↓
User's Inbox
```

---

## 🚀 Production Deployment

### **Gmail Setup (Free - Good for testing):**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password
4. Use App Password in `EMAIL_PASSWORD`

### **SendGrid Setup (Recommended for production):**
1. Create SendGrid account (Free tier: 100 emails/day)
2. Verify sender identity
3. Generate API key
4. Set `EMAIL_PROVIDER=sendgrid`

### **Custom SMTP (Most flexible):**
- AWS SES (99% delivery rate)
- Mailgun (Easy setup)
- Postmark (Fast delivery)

---

## 📈 Next Steps After Email System

Once email system is complete, move to:

1. **Cloud File Storage** (AWS S3/Cloudinary)
   - Profile pictures
   - Portfolio uploads
   - Order deliverables
   - Resume uploads

2. **Error Tracking** (Sentry)
   - Real-time error monitoring
   - Performance tracking
   - User feedback

3. **Redis Caching**
   - Session management
   - API response caching
   - Rate limiting

4. **SMS/OTP System** (Twilio)
   - Phone verification
   - Two-factor authentication
   - Order notifications via SMS

---

## 💡 Pro Tips

1. **Email Deliverability:**
   - Use verified domain
   - Add SPF/DKIM records
   - Monitor bounce rates
   - Use email validation

2. **Security:**
   - Hash tokens before storing
   - Set short expiration times
   - Rate limit email sending
   - Prevent email enumeration

3. **User Experience:**
   - Send emails asynchronously
   - Provide resend option
   - Show clear error messages
   - Track email open rates

4. **Performance:**
   - Use email queue (Bull/Redis)
   - Batch notifications
   - Monitor sending limits
   - Handle failures gracefully

---

## 🎉 Success Metrics

After full implementation, you'll have:

✅ Secure email verification system  
✅ Password reset functionality  
✅ Order notification emails  
✅ Welcome emails for new users  
✅ Professional HTML email templates  
✅ Multi-provider support  
✅ Production-ready email infrastructure  

**This is Feature #1 of 5 critical features for production readiness!**

Next: Cloud File Storage 🚀
