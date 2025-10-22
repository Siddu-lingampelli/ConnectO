# 🤖 ConnectO AI Chatbot Assistant - Complete Guide

## Overview
The ConnectO Chatbot is an intelligent AI assistant powered by Mistral AI that helps users navigate the platform, understand features, and get instant answers about registration, verification, referrals, and more.

---

## 🎯 Features

### ✅ **Core Capabilities**
- Answers questions about ConnectO platform features
- Guides users through registration and verification
- Explains referral system and rewards
- Helps troubleshoot common issues
- Provides instant support 24/7
- Maintains conversation context
- Multi-language support (browser-based)
- Floating chat widget on all pages
- Conversation history (localStorage)

### 💡 **Smart Features**
- Pre-loaded suggested questions
- Typing indicators
- Message timestamps
- Clear chat functionality
- Responsive design
- Smooth animations
- Error handling

---

## 🏗️ Architecture

### Backend Components

**1. Controller: `backend/controllers/chat.controller.js`**
- Handles chat API requests
- Integrates with Mistral AI API
- Manages conversation history
- Returns intelligent responses

**2. Routes: `backend/routes/chat.routes.js`**
- `POST /api/chat` - Send message and get response
- `GET /api/chat/suggestions` - Get suggested questions

**3. System Prompt**
The chatbot knows about:
- Service provider types (Technical vs Non-Technical)
- Demo verification process
- Referral rewards structure
- Gamification (XP, levels, badges)
- Job posting and application flow
- Platform features and rules

### Frontend Components

**1. Service: `frontend/src/services/chatService.ts`**
- API integration layer
- TypeScript types for messages
- Error handling

**2. Component: `frontend/src/components/Chatbot.tsx`**
- Floating chat button
- Chat window UI
- Message display
- Input handling
- Conversation management
- localStorage persistence

**3. Integration: `frontend/src/App.tsx`**
- Global chatbot component
- Available on all pages

---

## 📝 Setup Instructions

### Step 1: Backend Configuration

**1. Get Mistral API Key**
- Go to https://console.mistral.ai/
- Sign up or log in
- Navigate to API Keys section
- Create a new API key
- Copy the key

**2. Update `.env` file**
```env
# Add to backend/.env
MISTRAL_API_KEY=your_mistral_api_key_here
```

**3. Verify Installation**
```bash
cd backend
npm install  # Installs node-fetch and other dependencies
```

### Step 2: Test the Backend

**Start the server:**
```bash
cd backend
npm start
```

**Test the chat endpoint:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I register as a service provider?"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "reply": "To register as a service provider on ConnectO...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 75,
    "total_tokens": 225
  }
}
```

### Step 3: Frontend Usage

The chatbot is automatically available on all pages. No additional setup needed!

**Features:**
- Click the floating chat button (bottom-right)
- Type your question or use suggested questions
- Press Enter or click Send
- View conversation history
- Clear chat anytime

---

## 💬 Example Conversations

### Example 1: Registration Help
**User:** "How do I register as a service provider?"

**Bot:** "To register as a service provider on ConnectO:

1. Click 'Sign Up' and select 'Service Provider' role
2. Choose your provider type:
   - **Technical**: Developers, designers, video editors, IT support
   - **Non-Technical**: Plumbers, electricians, carpenters, cleaners
3. Complete your profile with skills and services
4. Wait for admin to assign a demo task
5. Complete the demo (must score ≥60%)
6. Get verified and start applying for jobs!

You can only apply to jobs matching your provider type. Need help with anything else? 😊"

### Example 2: Referral System
**User:** "How does the referral system work?"

**Bot:** "The ConnectO Referral System is awesome! Here's how it works:

**Rewards vary by user type:**
- Provider→Provider: ₹75 + 150 XP (Team Building!)
- Client→Client: ₹100 + 120 XP (Community Builder!)
- Client→Provider: ₹80 + 130 XP (Talent Scout!)
- Provider→Client: ₹60 + 110 XP (Network Expansion!)

**How to refer:**
1. Go to Referrals page (green 🎁 button in header)
2. Copy your unique referral code
3. Share with friends
4. They enter your code during registration
5. You earn credits + XP instantly!

**Bonus:** Earn badges at 1, 5, 10, 25, and 50 referrals. Get 'Trusted Referrer' status at 10+ referrals! 🏆"

### Example 3: Demo Verification
**User:** "What is demo verification?"

**Bot:** "Demo verification is ConnectO's quality assurance system!

**Process:**
1. Admin assigns you a demo task matching your skills
2. You complete the task and submit it
3. Admin reviews and scores your work (out of 100)
4. You need ≥60% to pass
5. Once verified, you can apply for jobs!

**Why it matters:**
- Proves your skills to clients
- Builds trust on the platform
- Required before applying for any job

Check your demo status on the Dashboard. Good luck! 🎯"

---

## 🎨 Customization

### Change Chatbot Appearance

**Edit `frontend/src/components/Chatbot.tsx`:**

```tsx
// Change button colors
className="bg-gradient-to-r from-blue-600 to-purple-600"
// Change to your brand colors:
className="bg-gradient-to-r from-green-600 to-teal-600"

// Change window size
className="w-96 h-[600px]"
// Change to:
className="w-[500px] h-[700px]"
```

### Add More Suggestions

**Edit `backend/controllers/chat.controller.js`:**

```javascript
const suggestions = [
  "How do I register as a service provider?",
  "What is the demo verification process?",
  // Add your custom suggestions:
  "How do I withdraw my earnings?",
  "What are the platform fees?",
  "How do I report a problem?"
];
```

### Modify System Prompt

**Edit the `SYSTEM_PROMPT` in `backend/controllers/chat.controller.js`:**

```javascript
const SYSTEM_PROMPT = `You are the ConnectO Assistant...

// Add more details:
**Payment Methods:**
- Wallet system
- Bank transfer
- UPI
- Credit/Debit cards

// Add custom rules:
**Support Hours:**
Live chat: 9 AM - 9 PM IST
Email: support@connecto.com
`;
```

---

## 🌍 Multi-Language Support

The chatbot uses browser language detection and Mistral's multilingual capabilities.

**Automatic translation:**
- User's browser language is detected
- Mistral API responds in the appropriate language
- Supports Hindi, English, Spanish, French, and more

**To force a language:**
```typescript
// In chatService.ts, modify the message:
const userLanguage = navigator.language; // 'en-US', 'hi-IN', etc.
const enhancedMessage = `[Language: ${userLanguage}] ${message}`;
```

---

## 📊 Analytics (Optional)

### Track Chat Usage in MongoDB

**Create Chat model: `backend/models/Chat.model.js`**
```javascript
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  response: { type: String, required: true },
  tokens: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Chat', chatSchema);
```

**Update controller to save chats:**
```javascript
import Chat from '../models/Chat.model.js';

// After getting response:
await Chat.create({
  userId: req.user?._id, // If authenticated
  message,
  response: botReply,
  tokens: data.usage?.total_tokens
});
```

---

## 🔧 Troubleshooting

### Issue 1: "AI service is not configured"
**Solution:** Add MISTRAL_API_KEY to `.env` file

### Issue 2: "Failed to get response"
**Solutions:**
- Check internet connection
- Verify API key is valid
- Check Mistral API status
- Review backend logs

### Issue 3: Chat history not saving
**Solution:** Check browser localStorage permissions

### Issue 4: Slow responses
**Solutions:**
- Using `mistral-small-latest` (fastest model)
- Limit conversation history to 10 messages
- Reduce max_tokens if needed

---

## 💰 Cost Optimization

**Mistral API Pricing (as of 2024):**
- `mistral-small-latest`: ~$0.002 per 1K tokens
- Average chat: ~200-300 tokens
- Cost per chat: ~$0.0005 (less than 1 cent!)

**Tips to reduce costs:**
1. Limit conversation history
2. Use lower max_tokens (currently 500)
3. Implement rate limiting
4. Cache common questions

---

## 🚀 Deployment

### Production Checklist

**Backend:**
- [x] Add MISTRAL_API_KEY to production environment
- [x] Enable HTTPS
- [x] Set CORS to production domain
- [x] Add rate limiting
- [x] Monitor API usage
- [x] Set up error logging

**Frontend:**
- [x] Update API URL in production
- [x] Enable analytics (optional)
- [x] Test on mobile devices
- [x] Optimize bundle size
- [x] Add CSP headers

---

## 📚 API Reference

### POST /api/chat

**Request:**
```json
{
  "message": "Your question here",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Bot's response",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 75,
    "total_tokens": 225
  }
}
```

### GET /api/chat/suggestions

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "How do I register?",
    "What is demo verification?",
    "..."
  ]
}
```

---

## 🎓 Best Practices

1. **Keep System Prompt Updated**: Add new features to the system prompt
2. **Monitor Usage**: Track common questions to improve responses
3. **Test Regularly**: Try different question formats
4. **Gather Feedback**: Let users rate responses
5. **Privacy**: Never log sensitive information
6. **Fallback**: Provide contact info if bot can't help

---

## 🔐 Security

- API key stored in `.env` (never commit!)
- No authentication required for public chat
- Rate limiting recommended for production
- Input sanitization in place
- CORS properly configured

---

## 📞 Support

**For issues:**
1. Check this documentation
2. Review backend logs
3. Test Mistral API separately
4. Contact platform admin

**Useful Resources:**
- Mistral AI Docs: https://docs.mistral.ai/
- ConnectO Platform Guide: See main README.md

---

## 🎉 Features Coming Soon

- [ ] Voice input/output
- [ ] Image understanding
- [ ] Advanced analytics dashboard
- [ ] Custom training on ConnectO data
- [ ] Multi-agent conversations
- [ ] Integration with notifications

---

**Built with ❤️ for ConnectO Platform**
**Powered by Mistral AI**
