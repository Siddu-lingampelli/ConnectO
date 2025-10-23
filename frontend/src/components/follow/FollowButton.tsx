import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { followService } from '../../services/followService';
import { selectCurrentUser } from '../../store/authSlice';

interface FollowButtonProps {
  userId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

const FollowButton = ({ 
  userId, 
  showLabel = true, 
  size = 'md',
  className = '',
  onFollowChange
}: FollowButtonProps) => {
  const currentUser = useSelector(selectCurrentUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Check if already following
  useEffect(() => {
    const checkStatus = async () => {
      if (!currentUser || !userId || currentUser._id === userId) {
        setChecking(false);
        return;
      }

      try {
        const { isFollowing: status } = await followService.checkFollowStatus(userId);
        setIsFollowing(status);
      } catch (error: any) {
        console.error('Error checking follow status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, [userId, currentUser]);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error('Please login to follow users');
      return;
    }

    if (currentUser._id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    setLoading(true);

    try {
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        toast.success('Unfollowed successfully');
        onFollowChange?.(false);
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        toast.success('Following successfully');
        onFollowChange?.(true);
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user is viewing their own profile
  if (!currentUser || currentUser._id === userId) {
    return null;
  }

  if (checking) {
    return (
      <button
        disabled
        className={`${sizeClasses[size]} rounded-lg font-medium bg-gray-200 text-gray-400 cursor-not-allowed ${className}`}
      >
        <span className="inline-block animate-spin mr-1">⏳</span>
        {showLabel && 'Loading...'}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        rounded-lg font-medium transition-all duration-200
        hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isFollowing 
          ? 'bg-white text-[#345635] border-2 border-[#345635] hover:bg-[#E3EFD3]' 
          : 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white hover:from-[#0D2B1D] hover:to-[#345635]'
        }
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="inline-block animate-spin mr-1">⏳</span>
          {showLabel && 'Processing...'}
        </>
      ) : (
        <>
          {isFollowing ? (
            <>
              <span className="mr-1">✓</span>
              {showLabel && 'Following'}
            </>
          ) : (
            <>
              <span className="mr-1">➕</span>
              {showLabel && 'Follow'}
            </>
          )}
        </>
      )}
    </button>
  );
};

export default FollowButton;
