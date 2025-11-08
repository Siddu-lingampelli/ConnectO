import express from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/voice-intent
 * @desc    Process voice command using Mistral AI
 * @access  Private
 */
router.post('/voice-intent', authenticate, async (req, res) => {
  try {
    const { command } = req.body;

    if (!command || typeof command !== 'string' || command.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Command is required and must be a non-empty string'
      });
    }

    // Check if Mistral API key is configured
    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY not configured');
      return res.status(500).json({
        success: false,
        message: 'Voice assistant is not configured. Please contact support.'
      });
    }

    // Construct the prompt for Mistral AI
    const systemPrompt = `You are a voice assistant for ConnectO, a freelance marketplace platform. 
Your job is to interpret user voice commands and return structured JSON responses.

Available intents:
- "navigate": User wants to go to a specific page (profile, dashboard, messages, etc.)
- "search": User wants to search for providers, jobs, or services
- "switch_role": User wants to switch between client and provider modes
- "action": User wants to perform a specific action (post job, send message, etc.)
- "unknown": Command cannot be understood

Available routes:
- /profile - User's profile page
- /dashboard - Main dashboard
- /messages - Messages/chat page
- /jobs - Browse jobs
- /browse-providers - Browse service providers
- /post-job - Post a new job
- /my-orders - View orders
- /ongoing-jobs - View ongoing jobs
- /wishlist - View wishlist
- /notifications - View notifications
- /settings - Settings page
- /wallet - Wallet page
- /referrals - Referrals page
- /leaderboard - Leaderboard page
- /community - Community page
- /collaboration - Collaboration page
- /verification - Verification page

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "intent": "navigate|search|switch_role|action|unknown",
  "route": "/path/to/page",
  "query": "optional search keywords",
  "action": "optional action type",
  "feedback": "brief confirmation message for voice feedback"
}

Examples:
User: "Go to my profile"
Response: {"intent":"navigate","route":"/profile","feedback":"Opening your profile"}

User: "Find React developers in Hyderabad"
Response: {"intent":"search","route":"/browse-providers","query":"React developers Hyderabad","feedback":"Searching for React developers in Hyderabad"}

User: "Switch to client mode"
Response: {"intent":"switch_role","route":"/dashboard","feedback":"Switching to client mode"}

User: "Show my messages"
Response: {"intent":"navigate","route":"/messages","feedback":"Opening your messages"}

User: "Post a new job"
Response: {"intent":"action","route":"/post-job","action":"post_job","feedback":"Opening job posting form"}

User: "Find web developers near me"
Response: {"intent":"search","route":"/browse-providers","query":"web developers","feedback":"Searching for web developers near you"}`;

    const userMessage = `User command: "${command}"`;

    // Call Mistral AI API
    console.log('📢 Processing voice command:', command);
    
    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        timeout: 10000 // 10 second timeout
      }
    );

    // Extract the AI response
    const aiContent = mistralResponse.data.choices[0].message.content;
    console.log('🤖 Mistral AI response:', aiContent);

    // Parse the JSON response
    let parsedIntent;
    try {
      parsedIntent = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse Mistral response:', aiContent);
      // Fallback response
      parsedIntent = {
        intent: 'unknown',
        feedback: 'I did not understand that command. Please try again.'
      };
    }

    // Validate and sanitize the response
    const validIntents = ['navigate', 'search', 'switch_role', 'action', 'unknown'];
    if (!validIntents.includes(parsedIntent.intent)) {
      parsedIntent.intent = 'unknown';
    }

    // Ensure required fields
    if (!parsedIntent.feedback) {
      parsedIntent.feedback = 'Command processed';
    }

    // Log successful interpretation
    console.log('✅ Intent processed:', {
      command,
      intent: parsedIntent.intent,
      route: parsedIntent.route,
      query: parsedIntent.query
    });

    // Return the structured response
    res.json({
      success: true,
      data: {
        command,
        intent: parsedIntent.intent,
        route: parsedIntent.route || null,
        query: parsedIntent.query || null,
        action: parsedIntent.action || null,
        feedback: parsedIntent.feedback
      }
    });

  } catch (error) {
    console.error('Voice intent processing error:', error.message);
    
    // Handle specific error types
    if (error.response) {
      // Mistral API error
      console.error('Mistral API error:', error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: 'AI assistant is temporarily unavailable. Please try again.',
        error: error.response.data.message || 'AI service error'
      });
    } else if (error.request) {
      // Network error
      return res.status(503).json({
        success: false,
        message: 'Could not connect to AI assistant. Please check your connection.',
        error: 'Network error'
      });
    } else {
      // Other errors
      return res.status(500).json({
        success: false,
        message: 'An error occurred while processing your command.',
        error: error.message
      });
    }
  }
});

/**
 * @route   GET /api/voice-intent/test
 * @desc    Test voice intent endpoint
 * @access  Private
 */
router.get('/voice-intent/test', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Voice intent API is operational',
    mistralConfigured: !!process.env.MISTRAL_API_KEY
  });
});

export default router;
