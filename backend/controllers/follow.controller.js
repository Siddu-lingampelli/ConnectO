import Follow from '../models/Follow.js';
import User from '../models/User.model.js';

// Follow a user
export const followUser = async (req, res) => {
  try {
    const followerId = req.user._id || req.user.id;
    const { userId } = req.params;

    // Validate user IDs
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if trying to follow self
    if (followerId.toString() === userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Check if user to follow exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: followerId,
      following: userId
    });

    res.status(201).json({
      message: 'Successfully followed user',
      follow
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Failed to follow user', error: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user._id || req.user.id;
    const { userId } = req.params;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find and delete the follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId
    });

    if (!follow) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    res.status(200).json({
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Failed to unfollow user', error: error.message });
  }
};

// Get followers list
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get followers with user details
    const followers = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('follower', 'fullName email profilePicture city skills hourlyRate providerType isVerified role');

    const totalFollowers = await Follow.countDocuments({ following: userId });

    res.status(200).json({
      followers: followers.map(f => f.follower),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowers / limit),
        totalFollowers,
        hasMore: skip + followers.length < totalFollowers
      }
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Failed to get followers', error: error.message });
  }
};

// Get following list
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get following with user details
    const following = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('following', 'fullName email profilePicture city skills hourlyRate providerType isVerified role');

    const totalFollowing = await Follow.countDocuments({ follower: userId });

    res.status(200).json({
      following: following.map(f => f.following),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFollowing / limit),
        totalFollowing,
        hasMore: skip + following.length < totalFollowing
      }
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Failed to get following', error: error.message });
  }
};

// Check if current user follows another user
export const checkFollowStatus = async (req, res) => {
  try {
    const followerId = req.user._id || req.user.id;
    const { userId } = req.params;

    const isFollowing = await Follow.exists({
      follower: followerId,
      following: userId
    });

    res.status(200).json({
      isFollowing: !!isFollowing
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({ message: 'Failed to check follow status', error: error.message });
  }
};

// Get follow statistics for a user
export const getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get follower and following counts
    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: userId }),
      Follow.countDocuments({ follower: userId })
    ]);

    // If requesting current user's stats, also check mutual follows
    let mutualFollowsCount = 0;
    const currentUserId = (req.user._id || req.user.id).toString();
    if (currentUserId === userId) {
      // Get users that both follow each other
      const following = await Follow.find({ follower: userId }).select('following');
      const followingIds = following.map(f => f.following.toString());
      
      mutualFollowsCount = await Follow.countDocuments({
        follower: { $in: followingIds },
        following: userId
      });
    }

    res.status(200).json({
      followersCount,
      followingCount,
      mutualFollowsCount
    });
  } catch (error) {
    console.error('Get follow stats error:', error);
    res.status(500).json({ message: 'Failed to get follow stats', error: error.message });
  }
};

// Get mutual followers (users who follow each other)
export const getMutualFollows = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.id;
    const { userId } = req.params;

    // Get users that the target user follows
    const targetUserFollowing = await Follow.find({ follower: userId }).select('following');
    const targetFollowingIds = targetUserFollowing.map(f => f.following.toString());

    // Get users that also follow the target user
    const mutualFollows = await Follow.find({
      follower: { $in: targetFollowingIds },
      following: userId
    }).populate('follower', 'fullName email profilePicture city skills hourlyRate providerType isVerified role');

    res.status(200).json({
      mutualFollows: mutualFollows.map(f => f.follower)
    });
  } catch (error) {
    console.error('Get mutual follows error:', error);
    res.status(500).json({ message: 'Failed to get mutual follows', error: error.message });
  }
};
