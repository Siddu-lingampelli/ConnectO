# 🚀 Quick Start - ConnectO AI Chatbot

## ⚡ 3-Step Setup

### Step 1: Get Mistral API Key (2 minutes)

1. Go to: https://console.mistral.ai/
2. Sign up (free account available)
3. Click "API Keys" in sidebar
4. Click "Create new key"
5. Copy your API key

### Step 2: Add API Key to Backend (30 seconds)

Open `backend/.env` and add:

```env
MISTRAL_API_KEY=your_api_key_here
```

**Example:**
```env
MISTRAL_API_KEY=abcdefgh123456789
```

### Step 3: Start Everything (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## ✅ Test It!

1. Open http://localhost:3011
2. Look for the **blue chat button** (bottom-right corner) 🤖
3. Click it to open chat
4. Try: "How do I register as a service provider?"
5. Get instant AI-powered response! 🎉

---

## 💡 Features

✅ **Smart AI Assistant** - Powered by Mistral AI
✅ **Context-Aware** - Remembers conversation
✅ **Suggested Questions** - Click to ask instantly
✅ **Multi-Language** - Automatic language detection
✅ **Always Available** - On every page
✅ **Conversation History** - Saves in browser
✅ **Beautiful UI** - Smooth animations

---

## 🎯 What Can You Ask?

**Registration & Verification:**
- "How do I sign up as a provider?"
- "What is demo verification?"
- "How long does verification take?"

**Referrals & Rewards:**
- "How does the referral system work?"
- "How much can I earn from referrals?"
- "What are the badge milestones?"

**Jobs & Applications:**
- "How do I apply for jobs?"
- "Can technical providers apply to non-technical jobs?"
- "How do I post a job as a client?"

**Platform Features:**
- "What is the leaderboard?"
- "How does XP and leveling work?"
- "How do I message providers?"

**And much more!** The chatbot knows everything about ConnectO.

---

## 🎨 Customization

### Change Chat Button Position

Edit `frontend/src/components/Chatbot.tsx`:

```tsx
// Line ~150 - Change from bottom-right to bottom-left
className="fixed bottom-6 right-6"  // Current
className="fixed bottom-6 left-6"   // Bottom-left
```

### Change Colors

```tsx
// Chat button gradient
from-blue-600 to-purple-600  // Current
from-green-600 to-teal-600   // Custom
```

### Add More Suggested Questions

Edit `backend/controllers/chat.controller.js`:

```javascript
const suggestions = [
  "How do I register as a service provider?",
  "What is the demo verification process?",
  // Add yours here:
  "How do I contact support?",
  "What are the platform fees?"
];
```

---

## 🔧 Troubleshooting

### Chat button not showing?
- Check browser console for errors
- Verify frontend is running
- Clear browser cache

### "AI service not configured" error?
- Check `MISTRAL_API_KEY` in `.env`
- Restart backend server
- Verify API key is valid

### Slow responses?
- Normal for first message (API initialization)
- Check internet connection
- Mistral API might be experiencing high traffic

---

## 💰 Costs

**Mistral AI Pricing:**
- Free tier: Limited requests
- Pay-as-you-go: ~$0.002 per 1K tokens
- **Average chat costs less than $0.001** (one-tenth of a cent!)

Very affordable for production use! 💵

---

## 🚀 Production Deployment

### Environment Variables

**Backend `.env`:**
```env
MISTRAL_API_KEY=prod_your_real_api_key
MONGODB_URI=mongodb+srv://your_production_db
FRONTEND_URL=https://your-domain.com
```

**Frontend `.env`:**
```env
VITE_API_URL=https://api.your-domain.com
```

### Deploy Checklist

- [ ] Add MISTRAL_API_KEY to production environment
- [ ] Enable HTTPS
- [ ] Set CORS to production domain
- [ ] Add rate limiting (prevent abuse)
- [ ] Monitor API usage
- [ ] Set up error logging

---

## 📚 Need More Help?

📖 **Full Documentation:** See `CHATBOT_GUIDE.md`

**Common Issues:**
- API Key Issues → Check `.env` file
- Connection Errors → Check backend logs
- UI Problems → Check browser console

**Resources:**
- Mistral Docs: https://docs.mistral.ai/
- ConnectO Guide: Main `README.md`

---

## 🎉 You're All Set!

Your AI chatbot is now ready to help users navigate ConnectO!

**Features:**
- 24/7 Availability ✅
- Instant Responses ✅
- Context Understanding ✅
- Multi-Language Support ✅
- Beautiful UI ✅

**Happy Chatting! 🤖💬**
