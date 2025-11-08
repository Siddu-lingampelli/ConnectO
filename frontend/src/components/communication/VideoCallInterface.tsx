import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize, Monitor } from 'lucide-react';
import communicationService from '../../services/communicationService';

interface VideoCallInterfaceProps {
  roomId: string;
  chatId: string;
  onEnd: () => void;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({ roomId, chatId, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recipientName] = useState('Contact'); // Default name, can be passed as prop

  // Note: roomId can be used for WebRTC room identification in future
  console.log('Video call room:', roomId);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Initialize WebRTC connection
    initializeWebRTC();

    return () => {
      clearInterval(timer);
      cleanupWebRTC();
    };
  }, []);

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Here you would set up WebRTC peer connection
      // This is a simplified version - full WebRTC implementation requires:
      // - ICE candidates
      // - Signaling server
      // - STUN/TURN servers
      // - Peer connection setup
      
    } catch (error) {
      console.error('Failed to access media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const cleanupWebRTC = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = async () => {
    try {
      // End the call - chatId is used as messageId in the backend
      await communicationService.endVideoCall(chatId);
      cleanupWebRTC();
      onEnd();
    } catch (error) {
      console.error('Failed to end call:', error);
      onEnd();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Log fullscreen status for debugging
  console.log('Fullscreen available:', isFullscreen);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gray-900 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{recipientName}</h2>
          <p className="text-sm text-gray-300">{formatDuration(callDuration)}</p>
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Connected
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-white" />
            ) : (
              <Video className="w-6 h-6 text-white" />
            )}
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>

          {/* Screen Share Button (Future) */}
          <button
            className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            title="Screen share (Coming soon)"
            disabled
          >
            <Monitor className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          Click the red button to end the call
        </p>
      </div>
    </div>
  );
};

export default VideoCallInterface;
