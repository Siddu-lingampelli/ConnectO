import api from '../lib/api';

export const communicationService = {
  // ==================== VIDEO CALLS ====================
  
  // Initiate video call
  initiateVideoCall: async (data: {
    chatId: string;
    recipientId: string;
  }) => {
    const response = await api.post('/communication/video/initiate', data);
    return response.data;
  },

  // Join video call
  joinVideoCall: async (callId: string) => {
    const response = await api.post(`/communication/video/${callId}/join`);
    return response.data;
  },

  // End video call
  endVideoCall: async (callId: string) => {
    const response = await api.post(`/communication/video/${callId}/end`);
    return response.data;
  },

  // ==================== VOICE CALLS ====================
  
  // Initiate voice call
  initiateVoiceCall: async (data: {
    chatId: string;
    recipientId: string;
  }) => {
    const response = await api.post('/communication/voice/initiate', data);
    return response.data;
  },

  // Join voice call
  joinVoiceCall: async (callId: string) => {
    const response = await api.post(`/communication/voice/${callId}/join`);
    return response.data;
  },

  // End voice call
  endVoiceCall: async (callId: string) => {
    const response = await api.post(`/communication/voice/${callId}/end`);
    return response.data;
  },

  // ==================== SCREEN SHARING ====================
  
  // Initiate screen share
  initiateScreenShare: async (data: {
    chatId: string;
    recipientId: string;
  }) => {
    const response = await api.post('/communication/screen-share/initiate', data);
    return response.data;
  },

  // End screen share
  endScreenShare: async (sessionId: string) => {
    const response = await api.post(`/communication/screen-share/${sessionId}/end`);
    return response.data;
  },

  // ==================== CALL MANAGEMENT ====================
  
  // Get call history
  getCallHistory: async (chatId?: string) => {
    const response = await api.get('/communication/history', {
      params: { chatId }
    });
    return response.data;
  },

  // Decline call
  declineCall: async (callId: string, reason?: string) => {
    const response = await api.post(`/communication/decline/${callId}`, { reason });
    return response.data;
  },

  // Get active call
  getActiveCall: async (chatId: string) => {
    const response = await api.get(`/communication/active/${chatId}`);
    return response.data;
  }
};

export default communicationService;
