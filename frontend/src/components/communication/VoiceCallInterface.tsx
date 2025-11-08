import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import communicationService from '../../services/communicationService';

interface VoiceCallInterfaceProps {
  roomId: string;
  chatId: string;
  onEnd: () => void;
  receiverName?: string;
}

const VoiceCallInterface: React.FC<VoiceCallInterfaceProps> = ({ 
  roomId, 
  chatId,
  onEnd,
  receiverName = 'Contact'
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recipientName] = useState(receiverName);
  const [recipientAvatar] = useState<string | undefined>(undefined);

  // Note: roomId can be used for WebRTC room identification in future
  console.log('Voice call room:', roomId);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Initialize audio
    initializeAudio();

    return () => {
      clearInterval(timer);
      cleanupAudio();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // Setup audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      visualizeAudio();

    } catch (error) {
      console.error('Failed to access microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255 * 100);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const toggleMute = () => {
    // Toggle microphone
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = async () => {
    try {
      // End the call - chatId is used as messageId in the backend
      await communicationService.endVoiceCall(chatId);
      cleanupAudio();
      onEnd();
    } catch (error) {
      console.error('Failed to end call:', error);
      onEnd();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 to-blue-600 z-50 flex flex-col items-center justify-center p-6">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Voice Call Active</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Avatar */}
        <div className="relative mb-8">
          {recipientAvatar ? (
            <img
              src={recipientAvatar}
              alt={recipientName}
              className="w-32 h-32 rounded-full border-4 border-white shadow-2xl"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-emerald-600 text-5xl font-bold shadow-2xl">
              {recipientName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Audio Level Ring */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-white opacity-50 transition-transform duration-100"
            style={{ 
              transform: `scale(${1 + audioLevel / 200})`,
              borderWidth: audioLevel > 10 ? '4px' : '2px'
            }}
          />
        </div>

        {/* Recipient Name */}
        <h2 className="text-3xl font-bold text-white mb-2">{recipientName}</h2>

        {/* Call Duration */}
        <p className="text-xl text-white text-opacity-90 mb-8">
          {formatDuration(callDuration)}
        </p>

        {/* Audio Waveform Visualization */}
        <div className="flex items-center justify-center gap-1 mb-12 h-16">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-white rounded-full transition-all duration-100"
              style={{
                height: `${Math.random() * audioLevel + 10}%`,
                opacity: 0.7
              }}
            />
          ))}
        </div>

        {/* Status Text */}
        <div className="text-center text-white text-opacity-80">
          {isMuted && (
            <p className="flex items-center gap-2 justify-center mb-2">
              <MicOff className="w-4 h-4" />
              <span>Microphone muted</span>
            </p>
          )}
          {!isSpeakerOn && (
            <p className="flex items-center gap-2 justify-center">
              <VolumeX className="w-4 h-4" />
              <span>Speaker muted</span>
            </p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="pb-8">
        <div className="flex items-center justify-center gap-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-5 rounded-full shadow-xl transition-all transform hover:scale-110 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white bg-opacity-30 hover:bg-opacity-40'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-7 h-7 text-white" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-6 bg-red-500 hover:bg-red-600 rounded-full shadow-2xl transition-all transform hover:scale-110"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={toggleSpeaker}
            className={`p-5 rounded-full shadow-xl transition-all transform hover:scale-110 ${
              !isSpeakerOn 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white bg-opacity-30 hover:bg-opacity-40'
            }`}
          >
            {isSpeakerOn ? (
              <Volume2 className="w-7 h-7 text-white" />
            ) : (
              <VolumeX className="w-7 h-7 text-white" />
            )}
          </button>
        </div>

        <p className="text-center text-white text-sm mt-6 opacity-80">
          Tap the red button to end the call
        </p>
      </div>
    </div>
  );
};

export default VoiceCallInterface;
