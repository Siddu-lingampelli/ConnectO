import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import communicationService from '../../services/communicationService';

interface IncomingCallModalProps {
  callId: string;
  callType: 'video' | 'voice';
  callerName: string;
  callerAvatar?: string;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callId,
  callType,
  callerName,
  callerAvatar,
  onAccept,
  onDecline
}) => {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    // Play ringtone sound (you would add actual audio file)
    // const audio = new Audio('/ringtone.mp3');
    // audio.loop = true;
    // audio.play();

    return () => {
      // audio.pause();
      // audio.currentTime = 0;
    };
  }, []);

  const handleAccept = async () => {
    setRinging(false);
    try {
      if (callType === 'video') {
        await communicationService.joinVideoCall(callId);
      } else {
        await communicationService.joinVoiceCall(callId);
      }
      onAccept();
    } catch (error) {
      console.error('Failed to accept call:', error);
      alert('Failed to join call');
    }
  };

  const handleDecline = async () => {
    setRinging(false);
    try {
      await communicationService.declineCall(callId, 'User declined');
      onDecline();
    } catch (error) {
      console.error('Failed to decline call:', error);
      onDecline();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-bounce-subtle">
        {/* Caller Avatar */}
        <div className="mb-6">
          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-24 h-24 rounded-full mx-auto border-4 border-emerald-500 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {callerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Caller Name */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{callerName}</h2>
        
        {/* Call Type */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {callType === 'video' ? (
            <>
              <Video className="w-5 h-5 text-emerald-600" />
              <p className="text-gray-600">Incoming video call...</p>
            </>
          ) : (
            <>
              <Phone className="w-5 h-5 text-emerald-600" />
              <p className="text-gray-600">Incoming voice call...</p>
            </>
          )}
        </div>

        {/* Ringing Animation */}
        {ringing && (
          <div className="mb-6">
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Decline Button */}
          <button
            onClick={handleDecline}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
              <PhoneOff className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Decline</span>
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all group-hover:scale-110 shadow-lg animate-pulse">
              {callType === 'video' ? (
                <Video className="w-8 h-8 text-white" />
              ) : (
                <Phone className="w-8 h-8 text-white" />
              )}
            </div>
            <span className="text-sm font-medium text-gray-700">Accept</span>
          </button>
        </div>

        {/* Quick Message (Optional) */}
        <button
          onClick={handleDecline}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          I can't talk right now
        </button>
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
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

export default IncomingCallModal;
