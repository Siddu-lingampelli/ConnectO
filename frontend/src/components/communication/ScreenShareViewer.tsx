import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Maximize, Minimize, X, User } from 'lucide-react';
import communicationService from '../../services/communicationService';

interface ScreenShareViewerProps {
  sessionId: string;
  sharerName: string;
  sharerAvatar?: string;
  onEnd: () => void;
}

const ScreenShareViewer: React.FC<ScreenShareViewerProps> = ({
  sessionId,
  sharerName,
  sharerAvatar,
  onEnd
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [fps, setFps] = useState(30);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Start duration timer
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    // Initialize screen share stream
    initializeScreenShare();

    return () => {
      clearInterval(timer);
      cleanup();
    };
  }, []);

  const initializeScreenShare = async () => {
    try {
      // In a real implementation, this would receive the stream via WebRTC
      // For now, we'll just set up the video element
      
      // Simulate FPS monitoring
      const fpsInterval = setInterval(() => {
        const currentFps = 25 + Math.random() * 10;
        setFps(Math.round(currentFps));
        
        // Adjust quality based on FPS
        if (currentFps > 28) setQuality('high');
        else if (currentFps > 20) setQuality('medium');
        else setQuality('low');
      }, 2000);

      return () => clearInterval(fpsInterval);
    } catch (error) {
      console.error('Failed to initialize screen share:', error);
    }
  };

  const cleanup = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
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

  const handleEndSession = async () => {
    try {
      await communicationService.endScreenShare(sessionId);
      cleanup();
      onEnd();
    } catch (error) {
      console.error('Failed to end screen share:', error);
      onEnd();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gray-900 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Sharer Info */}
          <div className="flex items-center gap-3">
            {sharerAvatar ? (
              <img
                src={sharerAvatar}
                alt={sharerName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{sharerName}'s Screen</h3>
              <p className="text-sm text-gray-400">{formatDuration(sessionDuration)}</p>
            </div>
          </div>

          {/* Quality Indicator */}
          <div className="ml-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-gray-400" />
              <span className={`text-sm font-medium ${getQualityColor()}`}>
                {quality.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {fps} FPS
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={handleEndSession}
            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            title="Stop viewing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Screen Share Content */}
      <div className="flex-1 bg-black flex items-center justify-center relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="max-w-full max-h-full"
        />

        {/* Placeholder when no stream */}
        {!videoRef.current?.srcObject && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <Monitor className="w-24 h-24 text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">Connecting to screen share...</p>
            <div className="mt-4 flex gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        {/* Connection Status Overlay */}
        <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-75 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm">Live</span>
        </div>

        {/* Quality Warning */}
        {quality === 'low' && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-600 bg-opacity-90 text-white px-4 py-2 rounded-lg">
            <p className="text-sm">Connection quality is low</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 text-white p-3 text-center">
        <p className="text-sm text-gray-400">
          You are viewing {sharerName}'s screen • Click the X button to stop viewing
        </p>
      </div>

      <style>{`
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default ScreenShareViewer;
