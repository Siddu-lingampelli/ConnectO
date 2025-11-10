import express from 'express';
import axios from 'axios';
import { authenticate } from '../middleware/auth.middleware.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import User from '../models/User.model.js';
import Job from '../models/Job.model.js';
import Order from '../models/Order.model.js';

const router = express.Router();

// Apply rate limiter to all AI routes: 5 requests per minute per user
router.use(rateLimiter(5, 60000));

/**
 * @route   POST /api/ai-assistant/chat
 * @desc    General chat with AI assistant
 * @access  Private
 */
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    const userId = req.user._id;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user info for personalized responses
    const user = await User.findById(userId).select('name email userType');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build conversation context
    const systemPrompt = `You are an advanced AI assistant for ConnectO, a freelance marketplace platform.

User Information:
- Name: ${user.name}
- Type: ${user.userType}
- Context: ${context || 'general'}

Your capabilities:
1. Answer questions about the platform
2. Help write job postings
3. Suggest pricing for services
4. Provide career advice
5. Resolve disputes fairly
6. Guide users through processes
7. Analyze profiles and suggest improvements

Be helpful, professional, and concise. Provide actionable advice.`;

    // Prepare messages for Mistral AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message }
    ];

    // Call Mistral AI with error handling
    let aiResponse;
    try {
      const mistralResponse = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-small-latest',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
          },
          timeout: 15000
        }
      );

      aiResponse = mistralResponse.data.choices[0].message.content;
    } catch (aiError) {
      console.error('Mistral AI Error:', aiError.response?.status, aiError.response?.data);
      
      if (aiError.response?.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'AI service rate limit reached. Please wait a moment and try again.',
          retryAfter: aiError.response.headers['retry-after'] || 60
        });
      }
      
      throw aiError;
    }

    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date(),
        conversationId: req.body.conversationId || Date.now()
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-assistant/generate-job-post
 * @desc    AI generates job posting from brief description
 * @access  Private
 */
router.post('/generate-job-post', authenticate, async (req, res) => {
  try {
    const { briefDescription, category, budget, skills } = req.body;

    if (!briefDescription) {
      return res.status(400).json({
        success: false,
        message: 'Brief description is required'
      });
    }

    const systemPrompt = `You are an expert job posting writer for ConnectO freelance marketplace.

Generate a professional, detailed job posting based on the user's brief description.

Include:
1. Compelling title (50-80 characters)
2. Detailed description (200-500 words)
3. Key responsibilities (bullet points)
4. Required skills and qualifications
5. Deliverables
6. Timeline expectations
7. Communication preferences

Category: ${category || 'General'}
Budget Range: ${budget || 'To be discussed'}
Required Skills: ${skills ? skills.join(', ') : 'To be determined'}

Make it professional, clear, and attractive to quality freelancers.

Return ONLY valid JSON in this format:
{
  "title": "Job title here",
  "description": "Full description here",
  "responsibilities": ["resp1", "resp2", "resp3"],
  "requirements": ["req1", "req2", "req3"],
  "deliverables": ["deliverable1", "deliverable2"],
  "timeline": "Estimated timeline",
  "preferredCommunication": "Communication style"
}`;

    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: briefDescription }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        timeout: 20000
      }
    );

    const aiContent = mistralResponse.data.choices[0].message.content;
    const generatedPost = JSON.parse(aiContent);

    res.json({
      success: true,
      data: generatedPost
    });

  } catch (error) {
    console.error('Job post generation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate job post',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-assistant/suggest-pricing
 * @desc    AI suggests pricing based on project details
 * @access  Private
 */
router.post('/suggest-pricing', authenticate, async (req, res) => {
  try {
    const { projectDescription, category, complexity, timeline, skills } = req.body;

    if (!projectDescription) {
      return res.status(400).json({
        success: false,
        message: 'Project description is required'
      });
    }

    // Get average market rates from database
    const similarJobs = await Job.find({
      category: category,
      status: 'completed'
    })
      .select('budget')
      .limit(50)
      .sort({ createdAt: -1 });

    const avgBudget = similarJobs.length > 0
      ? similarJobs.reduce((sum, job) => sum + (job.budget || 0), 0) / similarJobs.length
      : 0;

    const systemPrompt = `You are a pricing expert for ConnectO freelance marketplace.

Analyze the project and suggest appropriate pricing.

Project Details:
- Description: ${projectDescription}
- Category: ${category || 'General'}
- Complexity: ${complexity || 'Medium'}
- Timeline: ${timeline || 'Not specified'}
- Required Skills: ${skills ? skills.join(', ') : 'Various'}
- Market Average (similar projects): $${avgBudget.toFixed(2)}

Provide pricing recommendation with:
1. Minimum price (budget-friendly)
2. Recommended price (fair market value)
3. Premium price (high quality/urgent)
4. Reasoning for each tier
5. Factors affecting price
6. Negotiation tips

Return ONLY valid JSON:
{
  "pricing": {
    "minimum": number,
    "recommended": number,
    "premium": number,
    "currency": "USD"
  },
  "reasoning": {
    "minimum": "explanation",
    "recommended": "explanation",
    "premium": "explanation"
  },
  "factors": ["factor1", "factor2"],
  "negotiationTips": ["tip1", "tip2"],
  "marketInsight": "Brief market analysis"
}`;

    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Suggest pricing for: ${projectDescription}` }
        ],
        temperature: 0.5,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        timeout: 15000
      }
    );

    const aiContent = mistralResponse.data.choices[0].message.content;
    const pricingSuggestion = JSON.parse(aiContent);

    res.json({
      success: true,
      data: pricingSuggestion
    });

  } catch (error) {
    console.error('Pricing suggestion error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate pricing suggestion',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-assistant/negotiate
 * @desc    AI assists with negotiation strategies
 * @access  Private
 */
router.post('/negotiate', authenticate, async (req, res) => {
  try {
    const { situation, yourPosition, theirPosition, desiredOutcome } = req.body;

    if (!situation || !yourPosition || !theirPosition) {
      return res.status(400).json({
        success: false,
        message: 'Situation, your position, and their position are required'
      });
    }

    const user = await User.findById(req.user._id).select('userType');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const systemPrompt = `You are an expert negotiation coach for ConnectO marketplace.

User Type: ${user.userType}
Situation: ${situation}
User's Position: ${yourPosition}
Other Party's Position: ${theirPosition}
Desired Outcome: ${desiredOutcome || 'Fair resolution'}

Provide negotiation strategy including:
1. Analysis of both positions
2. Common ground identification
3. Suggested talking points
4. Counter-offers to consider
5. Win-win solutions
6. When to compromise vs. hold firm
7. Professional phrasing suggestions

Return ONLY valid JSON:
{
  "analysis": "Situation analysis",
  "commonGround": ["point1", "point2"],
  "strategy": "Overall strategy",
  "talkingPoints": ["point1", "point2", "point3"],
  "counterOffers": ["offer1", "offer2"],
  "winWinSolutions": ["solution1", "solution2"],
  "suggestedPhrases": ["phrase1", "phrase2"],
  "redFlags": ["flag1", "flag2"],
  "recommendations": "Final recommendations"
}`;

    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        timeout: 20000
      }
    );

    const aiContent = mistralResponse.data.choices[0].message.content;
    const negotiationAdvice = JSON.parse(aiContent);

    res.json({
      success: true,
      data: negotiationAdvice
    });

  } catch (error) {
    console.error('Negotiation assistance error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate negotiation advice',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-assistant/resolve-dispute
 * @desc    AI provides dispute resolution guidance
 * @access  Private
 */
router.post('/resolve-dispute', authenticate, async (req, res) => {
  try {
    const { disputeDescription, yourSide, theirSide, evidence, orderId } = req.body;

    if (!disputeDescription) {
      return res.status(400).json({
        success: false,
        message: 'Dispute description is required'
      });
    }

    // Get order details if provided
    let orderDetails = null;
    if (orderId) {
      orderDetails = await Order.findById(orderId)
        .select('title budget status timeline requirements');
    }

    const systemPrompt = `You are a fair and impartial dispute resolution advisor for ConnectO marketplace.

Dispute: ${disputeDescription}
User's Side: ${yourSide || 'Not provided'}
Other Party's Side: ${theirSide || 'Not provided'}
Evidence: ${evidence || 'Not provided'}
${orderDetails ? `Order Details: ${JSON.stringify(orderDetails)}` : ''}

Provide fair, unbiased dispute resolution advice including:
1. Objective analysis of the situation
2. Validity assessment of each side's claims
3. Fair resolution options
4. Steps to resolve amicably
5. What evidence is needed
6. Platform policy guidance
7. Preventive measures for future

Be neutral and fair. Focus on win-win outcomes.

Return ONLY valid JSON:
{
  "analysis": "Objective analysis",
  "validityAssessment": {
    "yourClaims": "Assessment",
    "theirClaims": "Assessment"
  },
  "resolutionOptions": [
    {
      "option": "Option description",
      "fairness": "How fair is this",
      "steps": ["step1", "step2"]
    }
  ],
  "recommendedPath": "Best path forward",
  "evidenceNeeded": ["evidence1", "evidence2"],
  "policyGuidance": "Platform policy notes",
  "preventiveMeasures": ["measure1", "measure2"],
  "nextSteps": ["step1", "step2"]
}`;

    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.4, // Lower temperature for more consistent, fair responses
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        timeout: 25000
      }
    );

    const aiContent = mistralResponse.data.choices[0].message.content;
    const disputeResolution = JSON.parse(aiContent);

    res.json({
      success: true,
      data: disputeResolution
    });

  } catch (error) {
    console.error('Dispute resolution error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dispute resolution',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-assistant/analyze-profile
 * @desc    AI analyzes user profile and suggests improvements
 * @access  Private
 */
router.post('/analyze-profile', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get comprehensive user data
    const user = await User.findById(userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's job/order statistics
    let stats = {};
    if (user.userType === 'provider') {
      const completedOrders = await Order.countDocuments({
        provider: userId,
        status: 'completed'
      });
      stats.completedOrders = completedOrders;
    } else {
      const postedJobs = await Job.countDocuments({ client: userId });
      stats.postedJobs = postedJobs;
    }

    const systemPrompt = `You are a profile optimization expert for ConnectO marketplace.

Analyze this user profile and provide detailed improvement suggestions:

User Type: ${user.userType}
Profile Data: ${JSON.stringify({
      name: user.name,
      bio: user.bio,
      skills: user.skills,
      experience: user.experience,
      portfolio: user.portfolio,
      hourlyRate: user.hourlyRate,
      availability: user.availability,
      stats: stats
    })}

Provide comprehensive analysis including:
1. Profile strength score (0-100)
2. What's working well
3. Areas for improvement
4. Specific suggestions for each section
5. Keywords to add
6. Competitive advantages to highlight
7. Red flags to address
8. Industry best practices

Return ONLY valid JSON:
{
  "overallScore": number,
  "strengthAreas": ["area1", "area2"],
  "improvementAreas": [
    {
      "section": "Section name",
      "currentIssue": "What's wrong",
      "suggestion": "How to fix",
      "priority": "high|medium|low"
    }
  ],
  "keywordSuggestions": ["keyword1", "keyword2"],
  "competitiveAdvantages": ["advantage1", "advantage2"],
  "redFlags": ["flag1", "flag2"],
  "quickWins": ["Easy improvement 1", "Easy improvement 2"],
  "longTermGoals": ["Goal 1", "Goal 2"],
  "summary": "Overall assessment and action plan"
}`;

    const mistralResponse = await axios.post(
      'https://api.mistral.ai/v1/chat/completions',
      {
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.6,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        timeout: 20000
      }
    );

    const aiContent = mistralResponse.data.choices[0].message.content;
    const profileAnalysis = JSON.parse(aiContent);

    res.json({
      success: true,
      data: profileAnalysis
    });

  } catch (error) {
    console.error('Profile analysis error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze profile',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai-assistant/quick-tips
 * @desc    Get quick AI-generated tips based on user type
 * @access  Private
 */
router.get('/quick-tips', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('userType name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const tips = user.userType === 'provider' ? [
      "💼 Update your portfolio weekly with recent work to stay relevant",
      "⭐ Respond to messages within 2 hours for 40% higher hire rates",
      "📝 Detailed proposals win 3x more jobs than generic ones",
      "💰 Providers who verify skills earn 25% more on average",
      "🎯 Specialize in 2-3 skills rather than listing everything"
    ] : [
      "🎯 Clear job descriptions get 50% more quality proposals",
      "⏰ Post jobs Tuesday-Thursday for best response rates",
      "💬 Active communication increases project success by 60%",
      "⭐ Check reviews and portfolios before hiring",
      "📊 Use milestones for projects over $500"
    ];

    res.json({
      success: true,
      data: {
        tips: tips,
        personalizedMessage: `Hi ${user.name}! Here are today's tips to boost your success on ConnectO.`
      }
    });

  } catch (error) {
    console.error('Quick tips error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get tips',
      error: error.message
    });
  }
});

export default router;
