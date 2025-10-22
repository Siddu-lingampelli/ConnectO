import React from 'react';
import { User } from '../../types';
import { gamificationService } from '../../services/gamificationService';

interface ProfileCardProps {
  user: User;
  showBadges?: boolean;
  compact?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, showBadges = true, compact = false }) => {
  const progress = user.xp ? (user.xp % 100) : 0; // XP progress to next level
  const level = user.level || 1;
  const xp = user.xp || 0;
  const badges = user.badges || [];

  const levelColor = gamificationService.getLevelColor(level);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${levelColor} flex items-center justify-center text-white font-bold shadow-lg`}>
          {level}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className={`bg-gradient-to-r ${levelColor} h-1.5 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{xp} XP</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.fullName}
              className="w-16 h-16 rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-100">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Level Badge */}
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${levelColor} flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white`}>
            {level}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
          <p className="text-sm text-gray-600 capitalize">{user.role}</p>
          {user.city && <p className="text-xs text-gray-500">📍 {user.city}</p>}
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Level {level}</span>
          <span className="text-sm font-semibold text-gray-700">Level {level + 1}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className={`bg-gradient-to-r ${levelColor} h-3 rounded-full transition-all duration-500 relative`}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">{xp} XP</p>
          <p className="text-xs text-gray-500">{100 - progress} XP to next level</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
          <p className="text-xs text-gray-600">XP</p>
          <p className="text-lg font-bold text-blue-600">{xp}</p>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
          <p className="text-xs text-gray-600">Jobs</p>
          <p className="text-lg font-bold text-green-600">{user.completedJobs || 0}</p>
        </div>
        <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
          <p className="text-xs text-gray-600">Rating</p>
          <p className="text-lg font-bold text-yellow-600">{user.rating?.toFixed(1) || '0.0'} ⭐</p>
        </div>
      </div>

      {/* Badges */}
      {showBadges && badges.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>🏆</span>
            <span>Badges ({badges.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, i) => (
              <div
                key={i}
                className="group relative"
                title={badge.description}
              >
                <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 px-3 py-1.5 rounded-full text-sm font-semibold text-yellow-800 border border-yellow-300 shadow-sm transition-all cursor-pointer">
                  <span className="text-base">{badge.icon}</span>
                  <span className="text-xs">{badge.name}</span>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    {badge.description}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && showBadges && (
        <div className="text-center py-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">🎯 Complete tasks to earn badges!</p>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
