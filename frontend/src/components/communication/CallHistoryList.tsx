import React, { useState, useEffect } from 'react';
import { Video, Phone, Monitor, Clock, Search, Filter, ArrowRight } from 'lucide-react';
import communicationService from '../../services/communicationService';

interface CallRecord {
  _id: string;
  type: 'video_call' | 'voice_call' | 'screen_share';
  participants: Array<{
    userId: string;
    name: string;
    avatar?: string;
    joinedAt?: string;
    leftAt?: string;
  }>;
  startedAt: string;
  endedAt?: string;
  duration: number;
  status: 'completed' | 'missed' | 'declined' | 'failed';
}

const CallHistoryList: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'video' | 'voice' | 'screen'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCallHistory();
  }, []);

  const loadCallHistory = async () => {
    try {
      const response = await communicationService.getCallHistory();
      setCalls(response.data || []);
    } catch (error) {
      console.error('Failed to load call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'video_call':
        return <Video className="w-5 h-5" />;
      case 'voice_call':
        return <Phone className="w-5 h-5" />;
      case 'screen_share':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Phone className="w-5 h-5" />;
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case 'video_call':
        return 'Video Call';
      case 'voice_call':
        return 'Voice Call';
      case 'screen_share':
        return 'Screen Share';
      default:
        return 'Call';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      missed: 'bg-red-100 text-red-800',
      declined: 'bg-gray-100 text-gray-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleCallAgain = (call: CallRecord) => {
    // Implement call again functionality
    console.log('Call again:', call);
  };

  const filteredCalls = calls.filter(call => {
    // Apply type filter
    if (filter !== 'all') {
      const filterMap = {
        video: 'video_call',
        voice: 'voice_call',
        screen: 'screen_share'
      };
      if (call.type !== filterMap[filter as keyof typeof filterMap]) {
        return false;
      }
    }

    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return call.participants.some(p => 
        p.name.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-900">Call History</h2>
        </div>
        <span className="text-sm text-gray-500">{filteredCalls.length} calls</span>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            {['all', 'video', 'voice', 'screen'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Call List */}
      {filteredCalls.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {searchQuery ? 'No calls found' : 'No call history yet'}
          </p>
          <p className="text-gray-400 text-sm">
            {searchQuery ? 'Try a different search term' : 'Your call history will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCalls.map((call) => {
            const otherParticipant = call.participants.find(p => p.userId !== 'currentUserId'); // Replace with actual user ID
            
            return (
              <div
                key={call._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  {/* Left: Call Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icon */}
                    <div className={`p-3 rounded-full ${
                      call.type === 'video_call' ? 'bg-blue-100 text-blue-600' :
                      call.type === 'voice_call' ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {getCallIcon(call.type)}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {/* Participant */}
                        <div className="flex items-center gap-2">
                          {otherParticipant?.avatar ? (
                            <img
                              src={otherParticipant.avatar}
                              alt={otherParticipant.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                              {otherParticipant?.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-gray-900">
                            {otherParticipant?.name || 'Unknown'}
                          </span>
                        </div>

                        {/* Type Label */}
                        <span className="text-sm text-gray-500">
                          {getCallTypeLabel(call.type)}
                        </span>

                        {/* Status Badge */}
                        {getStatusBadge(call.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatTimestamp(call.startedAt)}</span>
                        {call.status === 'completed' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDuration(call.duration)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  {call.status === 'completed' && (
                    <button
                      onClick={() => handleCallAgain(call)}
                      className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      {getCallIcon(call.type)}
                      <span className="text-sm font-medium">Call Again</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination (if needed) */}
      {filteredCalls.length > 20 && (
        <div className="mt-6 flex justify-center">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default CallHistoryList;
