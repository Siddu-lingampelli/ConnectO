import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../lib/api';

// Type definitions
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

interface RecentCommand {
  command: string;
  intent: string;
  timestamp: string;
}

interface VoiceIntentResponse {
  intent: string;
  route?: string;
  query?: string;
  action?: string;
  feedback: string;
}

interface ApiResponse {
  success: boolean;
  data?: VoiceIntentResponse;
  message?: string;
}

const AdvancedVoiceNavigator = () => {
  const navigate = useNavigate();
  
  // State management
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [recentCommands, setRecentCommands] = useState<RecentCommand[]>([]);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check browser support
    const SpeechRecognitionConstructor = (window as unknown as Window).SpeechRecognition || 
                                         (window as unknown as Window).webkitSpeechRecognition;
    
    if (!SpeechRecognitionConstructor) {
      setIsSupported(false);
      console.warn('Speech Recognition is not supported in this browser');
      return;
    }

    // Create recognition instance
    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Event handlers
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      console.log('🎤 Voice recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
      
      // If final result, process it
      if (event.results[current].isFinal) {
        console.log('✅ Final transcript:', transcriptText);
        processVoiceCommand(transcriptText);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in your browser settings.');
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Voice recognition ended');
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Process voice command through backend
  const processVoiceCommand = async (command: string) => {
    if (!command || command.trim().length === 0) {
      toast.error('No command detected');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('📤 Sending command to backend:', command);

      // Send to backend for Mistral AI processing
      const response = await api.post<ApiResponse>('/voice-intent', {
        command: command.trim()
      });

      if (response.data.success && response.data.data) {
        const { intent, route, query, action, feedback } = response.data.data;
        
        console.log('✅ Intent received:', { intent, route, query, action });

        // Add to recent commands
        addRecentCommand(command, intent);

        // Provide voice feedback
        if (voiceFeedbackEnabled && feedback) {
          speakFeedback(feedback);
        }

        // Handle different intents
        switch (intent) {
          case 'navigate':
            if (route) {
              toast.success(feedback || `Navigating to ${route}`);
              setTimeout(() => navigate(route), 500);
            } else {
              toast.error('Navigation route not found');
            }
            break;

          case 'search':
            if (query) {
              toast.success(feedback || 'Searching...');
              const searchRoute = route || '/browse-providers';
              setTimeout(() => navigate(`${searchRoute}?query=${encodeURIComponent(query)}`), 500);
            } else {
              toast.error('Search query not found');
            }
            break;

          case 'switch_role':
            toast.success(feedback || 'Switching role...');
            setTimeout(() => navigate('/dashboard'), 500);
            break;

          case 'action':
            if (route) {
              toast.success(feedback || `Performing action: ${action}`);
              setTimeout(() => navigate(route), 500);
            } else {
              toast.info(feedback || 'Action processed');
            }
            break;

          case 'unknown':
          default:
            toast.warning(feedback || 'I did not understand that command. Please try again.');
            speakFeedback(feedback || 'I did not understand that command. Please try again.');
            break;
        }
      } else {
        toast.error(response.data.message || 'Failed to process command');
      }
    } catch (error: unknown) {
      console.error('Voice command processing error:', error);
      
      const err = error as { response?: { status?: number } };
      
      if (err.response?.status === 401) {
        toast.error('Please login to use voice navigation');
      } else if (err.response?.status === 503) {
        toast.error('AI assistant is temporarily unavailable');
      } else {
        toast.error('Failed to process voice command. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Speak feedback using Text-to-Speech
  const speakFeedback = (text: string) => {
    if (!voiceFeedbackEnabled || !text) return;

    try {
      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.lang = 'en-US';

      synthRef.current.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  // Start listening
  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    try {
      recognitionRef.current?.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  // Stop listening
  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Failed to stop recognition:', error);
    }
  };

  // Add command to recent history
  const addRecentCommand = (command: string, intent: string) => {
    const newCommand: RecentCommand = {
      command,
      intent,
      timestamp: new Date().toISOString()
    };

    setRecentCommands(prev => {
      const updated = [newCommand, ...prev.slice(0, 4)];
      localStorage.setItem('voiceCommands', JSON.stringify(updated));
      return updated;
    });
  };

  // Load recent commands from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voiceCommands');
      if (saved) {
        setRecentCommands(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent commands:', error);
    }
  }, []);

  // Toggle voice feedback
  const toggleVoiceFeedback = () => {
    setVoiceFeedbackEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('voiceFeedbackEnabled', JSON.stringify(newValue));
      toast.info(newValue ? 'Voice feedback enabled' : 'Voice feedback disabled');
      return newValue;
    });
  };

  // Load voice feedback preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('voiceFeedbackEnabled');
      if (saved !== null) {
        setVoiceFeedbackEnabled(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load voice feedback preference:', error);
    }
  }, []);

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-sm">
          <p className="text-sm text-red-800">
            Voice navigation is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating Voice Button - Moved to LEFT side */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
        {/* Main Mic Button */}
        <button
          onClick={startListening}
          disabled={isProcessing}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-[#0F870F] hover:bg-[#0D6E0D]'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isListening ? 'Listening... Click to stop' : 'Click to speak'}
        >
          {isProcessing ? (
            <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isListening ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-800 shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center"
          title="Voice settings"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Voice Panel - Moved to LEFT side */}
      {showPanel && (
        <div className="fixed bottom-24 left-6 z-40 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F870F] to-[#0D6E0D] p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">🎤 Voice Navigator</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Current Transcript */}
            {(isListening || transcript) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-1">
                  {isListening ? '🎤 Listening...' : '✅ Recognized:'}
                </p>
                <p className="text-sm text-gray-800">
                  {transcript || 'Say something...'}
                </p>
              </div>
            )}

            {/* Voice Feedback Toggle */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  🔊 Voice Feedback
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={voiceFeedbackEnabled}
                    onChange={toggleVoiceFeedback}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${voiceFeedbackEnabled ? 'bg-[#0F870F]' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${voiceFeedbackEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
              </label>
            </div>

            {/* Example Commands */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Example Commands:</h4>
              <div className="space-y-2">
                {[
                  'Go to my profile',
                  'Find React developers',
                  'Show my messages',
                  'Open dashboard',
                  'Search for web designers in Hyderabad',
                  'Switch to client mode',
                  'Post a new job'
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(example);
                      processVoiceCommand(example);
                    }}
                    className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Commands */}
            {recentCommands.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📜 Recent Commands:</h4>
                <div className="space-y-2">
                  {recentCommands.map((cmd, idx) => (
                    <div key={idx} className="p-2 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-gray-800">{cmd.command}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Intent: {cmd.intent}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-[#0F870F]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-700 font-medium">Processing command...</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvancedVoiceNavigator;
