import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const EnhancedAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>('chat');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const assistantModes: AssistantMode[] = [
    {
      id: 'chat',
      name: 'General Chat',
      icon: '💬',
      description: 'Ask me anything about the platform',
      color: 'bg-blue-500'
    },
    {
      id: 'job-post',
      name: 'Job Post Writer',
      icon: '✍️',
      description: 'Help me write a job posting',
      color: 'bg-purple-500'
    },
    {
      id: 'pricing',
      name: 'Pricing Advisor',
      icon: '💰',
      description: 'Suggest pricing for my project',
      color: 'bg-green-500'
    },
    {
      id: 'negotiate',
      name: 'Negotiation Coach',
      icon: '🤝',
      description: 'Help me negotiate better',
      color: 'bg-orange-500'
    },
    {
      id: 'dispute',
      name: 'Dispute Resolver',
      icon: '⚖️',
      description: 'Help resolve a dispute',
      color: 'bg-red-500'
    },
    {
      id: 'profile',
      name: 'Profile Optimizer',
      icon: '⭐',
      description: 'Analyze and improve my profile',
      color: 'bg-indigo-500'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([{
        role: 'assistant',
        content: "👋 Hello! I'm your Enhanced AI Assistant. I can help you with:\n\n• Answering questions about ConnectO\n• Writing professional job postings\n• Suggesting fair pricing\n• Negotiation strategies\n• Resolving disputes\n• Optimizing your profile\n\nHow can I assist you today?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      switch (currentMode) {
        case 'chat':
          response = await api.post('/ai-assistant/chat', {
            message: inputMessage,
            conversationHistory: conversationHistory
          });
          break;

        case 'job-post':
          response = await api.post('/ai-assistant/generate-job-post', {
            briefDescription: inputMessage
          });
          break;

        case 'pricing':
          response = await api.post('/ai-assistant/suggest-pricing', {
            projectDescription: inputMessage
          });
          break;

        case 'negotiate':
          response = await api.post('/ai-assistant/negotiate', {
            situation: inputMessage,
            yourPosition: 'User seeking advice',
            theirPosition: 'Other party'
          });
          break;

        case 'dispute':
          response = await api.post('/ai-assistant/resolve-dispute', {
            disputeDescription: inputMessage
          });
          break;

        case 'profile':
          response = await api.post('/ai-assistant/analyze-profile');
          break;

        default:
          response = await api.post('/ai-assistant/chat', {
            message: inputMessage,
            conversationHistory: conversationHistory
          });
      }

      if (response.data.success) {
        let assistantContent = '';

        // Format response based on mode
        if (currentMode === 'chat') {
          assistantContent = response.data.data.response;
        } else if (currentMode === 'job-post') {
          const data = response.data.data;
          assistantContent = `📝 **Generated Job Post**\n\n**Title:** ${data.title}\n\n**Description:**\n${data.description}\n\n**Responsibilities:**\n${data.responsibilities?.map((r: string) => `• ${r}`).join('\n')}\n\n**Requirements:**\n${data.requirements?.map((r: string) => `• ${r}`).join('\n')}\n\n**Deliverables:**\n${data.deliverables?.map((d: string) => `• ${d}`).join('\n')}\n\n**Timeline:** ${data.timeline}\n**Communication:** ${data.preferredCommunication}`;
        } else if (currentMode === 'pricing') {
          const data = response.data.data;
          assistantContent = `💰 **Pricing Recommendation**\n\n**Budget Tiers:**\n• Minimum: $${data.pricing.minimum}\n• Recommended: $${data.pricing.recommended} ⭐\n• Premium: $${data.pricing.premium}\n\n**Reasoning:**\n${data.reasoning.recommended}\n\n**Key Factors:**\n${data.factors?.map((f: string) => `• ${f}`).join('\n')}\n\n**Negotiation Tips:**\n${data.negotiationTips?.map((t: string) => `• ${t}`).join('\n')}\n\n**Market Insight:**\n${data.marketInsight}`;
        } else if (currentMode === 'negotiate') {
          const data = response.data.data;
          assistantContent = `🤝 **Negotiation Strategy**\n\n**Analysis:**\n${data.analysis}\n\n**Common Ground:**\n${data.commonGround?.map((g: string) => `• ${g}`).join('\n')}\n\n**Strategy:**\n${data.strategy}\n\n**Talking Points:**\n${data.talkingPoints?.map((p: string) => `• ${p}`).join('\n')}\n\n**Suggested Phrases:**\n${data.suggestedPhrases?.map((p: string) => `"${p}"`).join('\n')}\n\n**Recommendations:**\n${data.recommendations}`;
        } else if (currentMode === 'dispute') {
          const data = response.data.data;
          assistantContent = `⚖️ **Dispute Resolution Guidance**\n\n**Analysis:**\n${data.analysis}\n\n**Recommended Path:**\n${data.recommendedPath}\n\n**Resolution Options:**\n${data.resolutionOptions?.map((o: any) => `• ${o.option}\n  Steps: ${o.steps?.join(', ')}`).join('\n\n')}\n\n**Next Steps:**\n${data.nextSteps?.map((s: string) => `${s}`).join('\n')}\n\n**Policy Guidance:**\n${data.policyGuidance}`;
        } else if (currentMode === 'profile') {
          const data = response.data.data;
          assistantContent = `⭐ **Profile Analysis**\n\n**Overall Score:** ${data.overallScore}/100\n\n**Strength Areas:**\n${data.strengthAreas?.map((a: string) => `✅ ${a}`).join('\n')}\n\n**Areas for Improvement:**\n${data.improvementAreas?.map((i: any) => `⚠️ ${i.section}\nIssue: ${i.currentIssue}\nSuggestion: ${i.suggestion}\nPriority: ${i.priority}`).join('\n\n')}\n\n**Quick Wins:**\n${data.quickWins?.map((w: string) => `🎯 ${w}`).join('\n')}\n\n**Summary:**\n${data.summary}`;
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      
      let errorContent = '❌ Sorry, I encountered an error. Please try again later.';
      
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 60;
        errorContent = `⏳ **Rate limit reached!**\n\nThe AI service is temporarily busy. Please wait ${retryAfter} seconds and try again.\n\n💡 **Tip:** To avoid this, wait a few seconds between messages.`;
        toast.error(`Rate limit reached. Wait ${retryAfter}s`, { autoClose: 5000 });
      } else {
        errorContent = `❌ Sorry, I encountered an error: ${error.response?.data?.message || 'Please try again later.'}`;
        toast.error('Failed to process request');
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModeChange = (modeId: string) => {
    setCurrentMode(modeId);
    setShowModeSelector(false);
    const mode = assistantModes.find(m => m.id === modeId);
    
    const modeMessage: Message = {
      role: 'assistant',
      content: `Switched to **${mode?.name}** mode! ${mode?.description}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, modeMessage]);
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you?",
      timestamp: new Date()
    }]);
  };

  const currentModeInfo = assistantModes.find(m => m.id === currentMode);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-[#0F870F] to-[#0D6E0D] rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        title="Open AI Assistant"
      >
        <span className="text-3xl">🤖</span>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
          AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[450px] h-[650px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className={`${currentModeInfo?.color} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentModeInfo?.icon}</span>
            <div>
              <h3 className="font-bold text-lg">AI Assistant</h3>
              <p className="text-sm opacity-90">{currentModeInfo?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModeSelector(!showModeSelector)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Change mode"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mode Selector Dropdown */}
        {showModeSelector && (
          <div className="mt-3 bg-white rounded-lg p-2 shadow-lg max-h-80 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {assistantModes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  className={`p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                    currentMode === mode.id ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{mode.icon}</span>
                    <span className="font-semibold text-gray-800 text-sm">{mode.name}</span>
                  </div>
                  <p className="text-xs text-gray-600">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-[#0F870F] text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${currentModeInfo?.name}...`}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F870F] focus:border-transparent text-sm max-h-32"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-[#0F870F] text-white p-3 rounded-xl hover:bg-[#0D6E0D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default EnhancedAIAssistant;
