import api from '../lib/api';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: string[];
}

class ChatService {
  async sendMessage(message: string, conversationHistory: Message[] = []): Promise<ChatResponse> {
    const response = await api.post('/chat', {
      message,
      conversationHistory
    });
    return response.data;
  }

  async getSuggestions(): Promise<string[]> {
    const response = await api.get<SuggestionsResponse>('/chat/suggestions');
    return response.data.suggestions;
  }
}

export default new ChatService();
