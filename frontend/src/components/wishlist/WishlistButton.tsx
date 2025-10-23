import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../../store/authSlice';
import api from '../../lib/api';

interface WishlistButtonProps {
  itemType: 'provider' | 'client' | 'job';
  itemId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const WishlistButton = ({ 
  itemType, 
  itemId, 
  size = 'md', 
  showLabel = false,
  className = ''
}: WishlistButtonProps) => {
  const currentUser = useSelector(selectCurrentUser);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && itemId) {
      checkWishlistStatus();
    }
  }, [currentUser, itemId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await api.get(`/wishlist/check/${itemId}`);
      setIsInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error('Check wishlist error:', error);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await api.delete(`/wishlist/${itemId}`);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await api.post('/wishlist', { itemType, itemId });
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`
        ${sizeClasses[size]}
        rounded-full 
        flex items-center justify-center
        transition-all duration-300
        ${isInWishlist 
          ? 'bg-gradient-to-r from-[#345635] to-[#6B8F71] text-white shadow-lg' 
          : 'bg-white border-2 border-[#AEC3B0] text-[#6B8F71] hover:border-[#6B8F71]'
        }
        hover:scale-110
        disabled:opacity-50 disabled:cursor-not-allowed
        ${showLabel ? 'px-4 gap-2 w-auto' : ''}
        ${className}
      `}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      ) : (
        <>
          <span className={isInWishlist ? 'text-xl' : 'text-xl'}>
            {isInWishlist ? '❤️' : '🤍'}
          </span>
          {showLabel && (
            <span className="font-medium whitespace-nowrap">
              {isInWishlist ? 'Saved' : 'Save'}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default WishlistButton;
