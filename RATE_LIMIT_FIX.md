# AI Assistant Rate Limiting & Error Handling

## Issue Fixed
**Error:** `429 - Too Many Requests` when using the AI Assistant

## Root Cause
Mistral AI has rate limits on their API:
- Free tier: Limited requests per minute
- Too many requests in short time = 429 error

## Solutions Implemented

### 1. Backend Rate Limiter ✅
**File:** `backend/middleware/rateLimiter.js`
- Limits: **5 requests per minute** per user
- Prevents hitting Mistral API limits
- User-friendly error messages with retry time

**How it works:**
```javascript
// Tracks requests per user
- User makes request
- Check if within limit (5/min)
- If exceeded: Return 429 with "wait X seconds"
- If OK: Allow request
```

### 2. Mistral API Error Handling ✅
**File:** `backend/routes/aiAssistant.routes.js`
- Catches 429 errors from Mistral
- Returns friendly message
- Includes retry-after time

### 3. Frontend User Experience ✅
**File:** `frontend/src/components/ai/EnhancedAIAssistant.tsx`
- Detects rate limit errors
- Shows clear message: "⏳ Rate limit reached! Wait X seconds"
- Displays toast notification
- Provides helpful tip

## Usage Guidelines

### For Users:
**Best Practices:**
1. ⏱️ Wait 10-15 seconds between messages
2. 🎯 Be specific in your questions (fewer back-and-forth)
3. 📝 Combine multiple questions in one message
4. 💬 Use simpler modes (Chat) when possible

**If you see rate limit:**
```
⏳ Rate limit reached!
Wait 60 seconds and try again.
💡 Tip: Wait a few seconds between messages.
```

**What to do:**
- Wait the specified time
- Don't spam the send button
- Consider using a different mode

### For Developers:

**Adjust Rate Limits:**
```javascript
// In aiAssistant.routes.js
router.use(rateLimiter(5, 60000));  // 5 requests per 60 seconds
//                     ↑      ↑
//                  requests  time(ms)

// Examples:
rateLimiter(10, 60000)  // 10 per minute (generous)
rateLimiter(3, 60000)   // 3 per minute (strict)
rateLimiter(20, 120000) // 20 per 2 minutes
```

**Per-Mode Rate Limits:**
```javascript
// Different limits for different modes
router.post('/chat', rateLimiter(10, 60000), ...)       // 10/min
router.post('/analyze-profile', rateLimiter(2, 60000), ...) // 2/min
```

## Error Messages

### User-Facing Messages:

**Rate Limit (Our Server):**
```
Rate limit exceeded. Please wait 45 seconds before trying again.
```

**Rate Limit (Mistral API):**
```
⏳ Rate limit reached!
The AI service is temporarily busy. 
Please wait 60 seconds and try again.
💡 Tip: To avoid this, wait a few seconds between messages.
```

**Other Errors:**
```
❌ Sorry, I encountered an error: [error details]
```

## Testing

### Test Rate Limiter:
```bash
# Send 6 requests quickly (should get rate limited on 6th)
curl -X POST http://localhost:5000/api/ai-assistant/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}' \
  --repeat 6
```

**Expected:**
- First 5: Success ✅
- 6th: `429 Rate limit exceeded` ❌

### Test Mistral Rate Limit:
1. Make many requests very quickly
2. Should see Mistral 429 error
3. Frontend shows friendly message
4. Includes retry-after time

## Monitoring

### Check Rate Limiter Status:
```javascript
// In rateLimiter.js, add logging:
console.log(`User ${userId} - Request ${count}/${maxRequests}`);
```

### Check Mistral API Usage:
- Visit: https://console.mistral.ai/usage
- View API call statistics
- Check rate limit status

## Production Recommendations

### 1. Upgrade Mistral API Plan
**Current:** Free tier (limited)
**Upgrade to:**
- Starter: Higher rate limits
- Professional: Even higher limits
- Check pricing: https://mistral.ai/pricing

### 2. Implement Caching
```javascript
// Cache common responses
const responseCache = new Map();

// Before calling Mistral:
const cacheKey = `${mode}-${message}`;
if (responseCache.has(cacheKey)) {
  return cachedResponse;
}

// After getting response:
responseCache.set(cacheKey, response);
```

### 3. Queue System
```javascript
// For high traffic, implement job queue
import Bull from 'bull';

const aiQueue = new Bull('ai-requests');
// Process requests sequentially
// Prevents burst requests
```

### 4. Premium Features
```javascript
// VIP users get higher limits
if (user.isPremium) {
  router.use(rateLimiter(20, 60000)); // 20/min for premium
} else {
  router.use(rateLimiter(5, 60000));  // 5/min for free
}
```

## Alternative AI Services

If Mistral rate limits are too restrictive:

### Option 1: OpenAI GPT
```javascript
// Replace Mistral with OpenAI
const openaiResponse = await axios.post(
  'https://api.openai.com/v1/chat/completions',
  {
    model: 'gpt-3.5-turbo',
    messages: messages
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
  }
);
```

### Option 2: Anthropic Claude
```javascript
// Use Claude API
const claudeResponse = await axios.post(
  'https://api.anthropic.com/v1/messages',
  {
    model: 'claude-3-sonnet-20240229',
    messages: messages
  }
);
```

### Option 3: Local LLM
```javascript
// Use Ollama (free, local, unlimited)
const ollamaResponse = await axios.post(
  'http://localhost:11434/api/chat',
  {
    model: 'llama2',
    messages: messages
  }
);
```

## Summary

✅ **Fixed:**
- Added rate limiter (5 requests/min)
- Catches Mistral 429 errors
- User-friendly error messages
- Retry-after guidance

🎯 **Best Practice:**
- Wait 10-15 seconds between messages
- Be specific in questions
- Combine multiple questions

🚀 **Future:**
- Upgrade Mistral plan for production
- Implement caching for common queries
- Consider queue system for high traffic
- Premium users get higher limits

**The AI Assistant is now protected against rate limits and provides clear guidance to users!** 🎉
