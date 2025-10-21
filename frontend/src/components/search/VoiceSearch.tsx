import { useState, useEffect, useRef } from 'react';

interface VoiceSearchProps {
  onSearch: (searchText: string) => void;
  placeholder?: string;
  value?: string;
}

const VoiceSearch = ({ onSearch, placeholder = "Search...", value = "" }: VoiceSearchProps) => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState(value);
  const [language, setLanguage] = useState("en-US");
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setText(speechResult);
      if (onSearch) {
        onSearch(speechResult);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognition.stop();
      }
    };
  }, [onSearch]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
  };

  const handleSearch = () => {
    if (text.trim()) {
      onSearch(text.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const languages = [
    { code: "en-US", name: "🇺🇸 English (US)" },
    { code: "en-IN", name: "🇮🇳 English (India)" },
    { code: "hi-IN", name: "🇮🇳 हिंदी (Hindi)" },
    { code: "te-IN", name: "🇮🇳 తెలుగు (Telugu)" },
    { code: "ta-IN", name: "🇮🇳 தமிழ் (Tamil)" },
    { code: "ml-IN", name: "🇮🇳 മലയാളം (Malayalam)" },
    { code: "kn-IN", name: "🇮🇳 ಕನ್ನಡ (Kannada)" },
    { code: "mr-IN", name: "🇮🇳 मराठी (Marathi)" },
    { code: "gu-IN", name: "🇮🇳 ગુજરાતી (Gujarati)" },
    { code: "bn-IN", name: "🇮🇳 বাংলা (Bengali)" },
    { code: "pa-IN", name: "🇮🇳 ਪੰਜਾਬੀ (Punjabi)" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {/* Language Selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
        title="Select language for voice search"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      {/* Search Input with Voice Button */}
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Voice Button (inside input) */}
          {isSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title={isListening ? "Stop listening" : "Start voice search"}
            >
              {isListening ? (
                <span className="text-lg">🛑</span>
              ) : (
                <span className="text-lg">🎤</span>
              )}
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
        >
          🔍 Search
        </button>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="absolute -bottom-6 left-0 text-sm text-blue-600 flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          Listening...
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
