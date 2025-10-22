import User from '../models/User.model.js';

// Get top users by XP (Weekly/Monthly/All-Time)
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', limit = 10, providerType } = req.query;
    
    let query = { role: 'provider' }; // Only show providers in leaderboard
    
    // Filter by provider type if specified
    if (providerType && providerType !== 'all') {
      query.providerType = providerType;
    }
    
    // Note: We're not filtering by lastActive for period because:
    // 1. Existing providers may not have this field populated
    // 2. Leaderboard should show all-time rankings
    // The period filter can be enhanced later when lastActive is tracked consistently
    
    const topUsers = await User.find(query)
      .select('fullName profilePicture xp level badges completedJobs rating totalReviews city providerType lastActive')
      .sort({ xp: -1, level: -1 })
      .limit(parseInt(limit));

    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      user: {
        _id: user._id,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        city: user.city,
        providerType: user.providerType
      },
      xp: user.xp || 0,
      level: user.level || 1,
      badges: user.badges ? user.badges.length : 0,
      completedJobs: user.completedJobs || 0,
      rating: user.rating || 0,
      totalReviews: user.totalReviews || 0
    }));

    res.json({
      success: true,
      period,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's rank
export const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Count how many users have more XP
    const usersAbove = await User.countDocuments({
      role: 'provider',
      xp: { $gt: user.xp }
    });

    const rank = usersAbove + 1;

    // Get total providers
    const totalProviders = await User.countDocuments({ role: 'provider' });

    // Get nearby users (3 above and 3 below)
    const usersAboveList = await User.find({
      role: 'provider',
      xp: { $gt: user.xp }
    })
      .select('fullName profilePicture xp level badges city')
      .sort({ xp: 1 })
      .limit(3);

    const usersBelowList = await User.find({
      role: 'provider',
      xp: { $lt: user.xp }
    })
      .select('fullName profilePicture xp level badges city')
      .sort({ xp: -1 })
      .limit(3);

    res.json({
      success: true,
      rank,
      totalProviders,
      percentile: ((totalProviders - rank + 1) / totalProviders * 100).toFixed(1),
      user: {
        xp: user.xp,
        level: user.level,
        badges: user.badges.length
      },
      nearby: {
        above: usersAboveList.reverse().map((u, i) => ({
          rank: rank - usersAboveList.length + i,
          ...u.toObject()
        })),
        below: usersBelowList.map((u, i) => ({
          rank: rank + i + 1,
          ...u.toObject()
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get top performers by category
export const getTopPerformers = async (req, res) => {
  try {
    const { category = 'xp' } = req.query;
    
    let sortField = {};
    let selectFields = 'fullName profilePicture city providerType';
    
    switch (category) {
      case 'xp':
        sortField = { xp: -1 };
        selectFields += ' xp level';
        break;
      case 'rating':
        sortField = { rating: -1, totalReviews: -1 };
        selectFields += ' rating totalReviews';
        break;
      case 'jobs':
        sortField = { completedJobs: -1 };
        selectFields += ' completedJobs';
        break;
      case 'earnings':
        sortField = { totalEarnings: -1 };
        selectFields += ' totalEarnings';
        break;
      default:
        sortField = { xp: -1 };
        selectFields += ' xp level';
    }
    
    const topPerformers = await User.find({ role: 'provider' })
      .select(selectFields)
      .sort(sortField)
      .limit(5);

    res.json({
      success: true,
      category,
      performers: topPerformers
    });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get leaderboard statistics
export const getLeaderboardStats = async (req, res) => {
  try {
    const totalProviders = await User.countDocuments({ role: 'provider' });
    
    // Get highest level
    const highestLevel = await User.findOne({ role: 'provider' })
      .sort({ level: -1 })
      .select('fullName level xp');
    
    // Get most badges - handle cases where badges field might not exist
    const mostBadges = await User.aggregate([
      { $match: { role: 'provider' } },
      { 
        $project: { 
          fullName: 1, 
          badgeCount: { 
            $cond: {
              if: { $isArray: '$badges' },
              then: { $size: '$badges' },
              else: 0
            }
          } 
        } 
      },
      { $sort: { badgeCount: -1 } },
      { $limit: 1 }
    ]);
    
    // Get average stats - handle null/undefined values
    const avgStats = await User.aggregate([
      { $match: { role: 'provider' } },
      {
        $group: {
          _id: null,
          avgXP: { $avg: { $ifNull: ['$xp', 0] } },
          avgLevel: { $avg: { $ifNull: ['$level', 1] } },
          avgRating: { $avg: { $ifNull: ['$rating', 0] } },
          avgJobs: { $avg: { $ifNull: ['$completedJobs', 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalProviders,
        highestLevel: highestLevel ? {
          name: highestLevel.fullName,
          level: highestLevel.level,
          xp: highestLevel.xp
        } : null,
        mostBadges: mostBadges[0] || null,
        averages: avgStats[0] || {
          avgXP: 0,
          avgLevel: 1,
          avgRating: 0,
          avgJobs: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
