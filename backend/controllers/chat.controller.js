import fetch from 'node-fetch';

// System prompt that teaches the AI about ConnectO
const SYSTEM_PROMPT = `You are the ConnectO Assistant, a helpful AI chatbot for the ConnectO platform.

ConnectO is a freelancing platform connecting clients and service providers in India.

**Key Features:**
1. **Service Providers**: Can be Technical (developers, designers, video editors, IT support) or Non-Technical (plumbers, electricians, carpenters, cleaners, cooks, beauticians)
2. **Profile Verification**: All providers must complete a demo task assigned by admin to prove their skills before applying for jobs
3. **Referral System**: 
   - Provider→Provider: ₹75 + 150 XP (Team Building Bonus)
   - Client→Client: ₹100 + 120 XP (Community Builder Bonus)
   - Client→Provider: ₹80 + 130 XP (Talent Scout Bonus)
   - Provider→Client: ₹60 + 110 XP (Network Expansion Bonus)
   - Earn badges at milestones (1, 5, 10, 25, 50 referrals)
4. **Gamification**: XP system, levels (100 XP per level), badges, leaderboard
5. **Voice Search**: Search for jobs and providers using voice commands
6. **Smart Search**: Advanced filters by category, location, budget, provider type
7. **Job Posting**: Clients post jobs with budget, deadline, category, and provider type requirement
8. **Proposals**: Providers submit proposals with cover letter, budget, and timeline
9. **Messaging**: Direct chat between clients and providers
10. **Payments**: Secure payment system with wallet functionality
11. **Reviews**: 5-star rating system for completed work
12. **Notifications**: Real-time updates for proposals, jobs, messages

**User Flows:**
- **Service Provider Registration**: Sign up → Select provider type (Technical/Non-Technical) → Complete profile → Wait for demo task → Complete demo → Get verified → Apply for jobs
- **Client Registration**: Sign up → Complete profile → Post jobs → Review proposals → Hire providers
- **Referral**: Share unique referral code → New users sign up with code → Earn credits + XP + badges
- **Job Application**: Browse jobs matching your provider type → Submit proposal → Wait for client response → Start work if accepted

**Important Rules:**
- Technical providers can ONLY apply to Technical jobs
- Non-Technical providers can ONLY apply to Non-Technical jobs
- Must pass demo verification (score ≥60%) before applying for jobs
- Trusted Referrer status unlocked at 10+ referrals

**Available Pages:**
- Dashboard, Jobs, My Proposals, My Orders, Profile, Settings, Leaderboard, Referrals, Messages, Notifications

You should:
✅ Answer questions about ConnectO features
✅ Guide users through registration and verification
✅ Explain how referrals, XP, and gamification work
✅ Help troubleshoot common issues
✅ Be friendly, helpful, and concise
❌ Do NOT answer questions unrelated to ConnectO
❌ Do NOT provide technical coding help
❌ Do NOT share fake contact details

Keep responses clear, friendly, and under 150 words when possible.`;

// @desc    Chat with AI assistant
// @route   POST /api/chat
// @access  Public (can be used by anyone)
export const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Check if Mistral API key exists
    if (!process.env.MISTRAL_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured. Please contact support.'
      });
    }

    // Build messages array for Mistral API
    // Filter out timestamp and other extra fields from conversation history
    const cleanedHistory = conversationHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      // Include previous conversation for context (limit to last 10 messages)
      ...cleanedHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call Mistral API
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest', // Using mistral-small for cost efficiency
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Mistral API Error:', errorData);
      
      return res.status(response.status).json({
        success: false,
        message: 'AI service is temporarily unavailable. Please try again later.',
        error: errorData.message || 'Unknown error'
      });
    }

    const data = await response.json();
    
    // Extract the assistant's reply
    const botReply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return res.status(200).json({
      success: true,
      reply: botReply,
      usage: data.usage // Token usage info (optional)
    });

  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: error.message
    });
  }
};

// @desc    Get suggested questions
// @route   GET /api/chat/suggestions
// @access  Public
export const getSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "How do I register as a service provider?",
      "What is the demo verification process?",
      "How does the referral system work?",
      "What's the difference between Technical and Non-Technical providers?",
      "How do I apply for jobs?",
      "How can I earn XP and badges?",
      "How do I post a job as a client?",
      "What are the payment methods available?",
      "How does the leaderboard work?",
      "Can I message providers directly?"
    ];

    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load suggestions'
    });
  }
};
