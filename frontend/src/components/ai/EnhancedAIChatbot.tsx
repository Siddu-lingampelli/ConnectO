import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'chat' | 'job-post' | 'pricing' | 'negotiation' | 'dispute' | 'profile';
}

interface ConversationHistory {
  role: string;
  content: string;
}

const EnhancedAIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string>('chat');
  const [conversationId, setConversationId] = useState<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "👋 Hi! I'm your AI assistant on ConnectO. I can help you with:\n\n• 💬 Answer questions\n• 📝 Write job postings\n• 💰 Suggest pricing\n• 🤝 Negotiation strategies\n• ⚖️ Resolve disputes\n• 📊 Analyze your profile\n\nWhat can I help you with today?",
          timestamp: new Date(),
          type: 'chat'
        }
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: activeFeature as any
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      
      // Build conversation history for context
      const conversationHistory: ConversationHistory[] = messages
        .slice(-6) // Last 6 messages for context
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      switch (activeFeature) {
        case 'chat':
          response = await api.post('/ai-assistant/chat', {
            message: inputMessage,
            context: 'general',
            conversationHistory,
            conversationId
          });
          break;

        case 'job-post':
          response = await api.post('/ai-assistant/generate-job-post', {
            briefDescription: inputMessage,
            category: 'General',
            budget: '',
            skills: []
          });
          break;

        case 'pricing':
          response = await api.post('/ai-assistant/suggest-pricing', {
            projectDescription: inputMessage,
            category: 'General',
            complexity: 'Medium',
            timeline: '',
            skills: []
          });
          break;

        case 'negotiation':
          response = await api.post('/ai-assistant/negotiate', {
            situation: inputMessage,
            yourPosition: 'User seeking advice',
            theirPosition: 'Not specified',
            desiredOutcome: 'Fair deal'
          });
          break;

        case 'dispute':
          response = await api.post('/ai-assistant/resolve-dispute', {
            disputeDescription: inputMessage,
            yourSide: 'User side',
            theirSide: 'Not specified',
            evidence: ''
          });
          break;

        case 'profile':
          response = await api.post('/ai-assistant/analyze-profile');
          break;

        default:
          response = await api.post('/ai-assistant/chat', {
            message: inputMessage,
            conversationHistory,
            conversationId
          });
      }

      if (response.data.success) {
        let assistantContent = '';

        // Format response based on feature type
        if (activeFeature === 'job-post' && response.data.data.title) {
          const data = response.data.data;
          assistantContent = `# ${data.title}\n\n## Description\n${data.description}\n\n## Responsibilities\n${data.responsibilities?.map((r: string) => `• ${r}`).join('\n')}\n\n## Requirements\n${data.requirements?.map((r: string) => `• ${r}`).join('\n')}\n\n## Deliverables\n${data.deliverables?.map((d: string) => `• ${d}`).join('\n')}\n\n⏰ Timeline: ${data.timeline}\n💬 Communication: ${data.preferredCommunication}`;
        } else if (activeFeature === 'pricing' && response.data.data.pricing) {
          const data = response.data.data;
          assistantContent = `💰 **Pricing Recommendations**\n\n**Budget-Friendly:** $${data.pricing.minimum}\n${data.reasoning.minimum}\n\n**Recommended:** $${data.pricing.recommended} ⭐\n${data.reasoning.recommended}\n\n**Premium:** $${data.pricing.premium}\n${data.reasoning.premium}\n\n**Factors Affecting Price:**\n${data.factors?.map((f: string) => `• ${f}`).join('\n')}\n\n**Negotiation Tips:**\n${data.negotiationTips?.map((t: string) => `• ${t}`).join('\n')}\n\n**Market Insight:** ${data.marketInsight}`;
        } else if (activeFeature === 'negotiation' && response.data.data.strategy) {
          const data = response.data.data;
          assistantContent = `🤝 **Negotiation Strategy**\n\n**Analysis:** ${data.analysis}\n\n**Common Ground:**\n${data.commonGround?.map((g: string) => `• ${g}`).join('\n')}\n\n**Strategy:** ${data.strategy}\n\n**Key Talking Points:**\n${data.talkingPoints?.map((p: string) => `• ${p}`).join('\n')}\n\n**Suggested Phrases:**\n${data.suggestedPhrases?.map((p: string) => `💬 "${p}"`).join('\n')}\n\n**Win-Win Solutions:**\n${data.winWinSolutions?.map((s: string) => `✅ ${s}`).join('\n')}\n\n**Recommendations:** ${data.recommendations}`;
        } else if (activeFeature === 'dispute' && response.data.data.analysis) {
          const data = response.data.data;
          assistantContent = `⚖️ **Dispute Resolution Analysis**\n\n**Analysis:** ${data.analysis}\n\n**Validity Assessment:**\n• Your Claims: ${data.validityAssessment?.yourClaims}\n• Their Claims: ${data.validityAssessment?.theirClaims}\n\n**Resolution Options:**\n${data.resolutionOptions?.map((opt: any, i: number) => `${i + 1}. **${opt.option}**\n   Fairness: ${opt.fairness}\n   Steps: ${opt.steps?.join(', ')}`).join('\n\n')}\n\n**Recommended Path:** ${data.recommendedPath}\n\n**Next Steps:**\n${data.nextSteps?.map((s: string) => `• ${s}`).join('\n')}`;
        } else if (activeFeature === 'profile' && response.data.data.overallScore) {
          const data = response.data.data;
          assistantContent = `📊 **Profile Analysis**\n\n**Overall Score:** ${data.overallScore}/100\n\n**Strengths:**\n${data.strengthAreas?.map((s: string) => `✅ ${s}`).join('\n')}\n\n**Areas for Improvement:**\n${data.improvementAreas?.map((area: any) => `🔸 **${area.section}** (${area.priority} priority)\n   Issue: ${area.currentIssue}\n   💡 ${area.suggestion}`).join('\n\n')}\n\n**Quick Wins:**\n${data.quickWins?.map((w: string) => `⚡ ${w}`).join('\n')}\n\n**Keyword Suggestions:**\n${data.keywordSuggestions?.join(', ')}\n\n${data.summary}`;
        } else {
          assistantContent = response.data.data.response || JSON.stringify(response.data.data, null, 2);
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
          type: activeFeature as any
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        toast.error('Failed to get AI response');
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      toast.error(error.response?.data?.message || 'Failed to communicate with AI assistant');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
        type: 'chat'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Chat cleared! How can I help you?",
        timestamp: new Date(),
        type: 'chat'
      }
    ]);
    setConversationId(Date.now());
  };

  const features = [
    { id: 'chat', icon: '💬', label: 'Chat', desc: 'General questions' },
    { id: 'job-post', icon: '📝', label: 'Job Post', desc: 'Generate job posting' },
    { id: 'pricing', icon: '💰', label: 'Pricing', desc: 'Get pricing advice' },
    { id: 'negotiation', icon: '🤝', label: 'Negotiate', desc: 'Negotiation help' },
    { id: 'dispute', icon: '⚖️', label: 'Dispute', desc: 'Resolve conflicts' },
    { id: 'profile', icon: '📊', label: 'Profile', desc: 'Analyze profile' }
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
        title="AI Assistant"
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
              AI
            </span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-44 right-6 z-40 w-[450px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-purple-100">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Feature Selector */}
          <div className="p-3 bg-gray-50 border-b overflow-x-auto">
            <div className="flex gap-2">
              {features.map(feature => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFeature === feature.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                  title={feature.desc}
                >
                  <span className="mr-1">{feature.icon}</span>
                  {feature.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask about ${features.find(f => f.id === activeFeature)?.desc}...`}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by Mistral AI • Press Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedAIChatbot;
