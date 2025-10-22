import User from '../models/User.model.js';

// Calculate level from XP (100 XP per level)
const calculateLevel = (xp) => Math.floor(xp / 100) + 1;

// Badge definitions with unlock criteria
const BADGES = {
  FIRST_STEPS: {
    name: 'First Steps',
    icon: '🎯',
    description: 'Complete your first demo project',
    criteria: { completedJobs: 1 }
  },
  RISING_STAR: {
    name: 'Rising Star',
    icon: '⭐',
    description: 'Reach Level 5',
    criteria: { level: 5 }
  },
  TOP_RATED: {
    name: 'Top Rated',
    icon: '🏆',
    description: 'Maintain a 4.5+ rating with 10+ reviews',
    criteria: { rating: 4.5, totalReviews: 10 }
  },
  FAST_RESPONDER: {
    name: 'Fast Responder',
    icon: '⚡',
    description: 'Respond to 20 messages within 10 minutes',
    criteria: { fastResponses: 20 }
  },
  DEDICATED: {
    name: 'Dedicated',
    icon: '🔥',
    description: 'Complete 10 jobs successfully',
    criteria: { completedJobs: 10 }
  },
  PROFESSIONAL: {
    name: 'Professional',
    icon: '💼',
    description: 'Complete 50 jobs successfully',
    criteria: { completedJobs: 50 }
  },
  EXPERT: {
    name: 'Expert',
    icon: '🎓',
    description: 'Reach Level 10',
    criteria: { level: 10 }
  },
  VERIFIED: {
    name: 'Verified Pro',
    icon: '✅',
    description: 'Complete demo verification with 80+ score',
    criteria: { demoScore: 80 }
  },
  CONSISTENT: {
    name: 'Consistent',
    icon: '📅',
    description: 'Stay active for 30 consecutive days',
    criteria: { activeDays: 30 }
  },
  FIVE_STAR: {
    name: 'Five Star',
    icon: '🌟',
    description: 'Receive 5 perfect 5-star reviews',
    criteria: { fiveStarReviews: 5 }
  }
};

// XP rewards for different actions
const XP_REWARDS = {
  DEMO_COMPLETE: 50,
  JOB_COMPLETE: 40,
  GOOD_REVIEW: 30,
  EXCELLENT_REVIEW: 50,
  DAILY_LOGIN: 10,
  FIRST_JOB: 100,
  PROFILE_COMPLETE: 20,
  VERIFICATION_COMPLETE: 75,
  MESSAGE_RESPONSE: 5
};

// Add XP to user
export const addXP = async (req, res) => {
  try {
    const { userId } = req.params;
    const { xpGained, reason } = req.body;

    if (!xpGained || xpGained <= 0) {
      return res.status(400).json({ message: 'Invalid XP amount' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldLevel = user.level;
    user.xp += xpGained;
    user.level = calculateLevel(user.xp);
    user.lastActive = new Date();

    await user.save();

    // Check if user leveled up
    const leveledUp = user.level > oldLevel;
    const newBadges = await checkAndAwardBadges(user);

    res.json({
      success: true,
      message: 'XP added successfully',
      user: {
        xp: user.xp,
        level: user.level,
        badges: user.badges
      },
      leveledUp,
      gainedLevels: user.level - oldLevel,
      newBadges,
      reason
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add badge to user
export const addBadge = async (req, res) => {
  try {
    const { userId } = req.params;
    const { badgeKey } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const badge = BADGES[badgeKey];
    if (!badge) {
      return res.status(400).json({ message: 'Invalid badge key' });
    }

    // Check if user already has this badge
    const hasBadge = user.badges.some(b => b.name === badge.name);
    if (hasBadge) {
      return res.status(400).json({ message: 'User already has this badge' });
    }

    user.badges.push({
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      earnedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Badge awarded!',
      badge: user.badges[user.badges.length - 1],
      totalBadges: user.badges.length
    });
  } catch (error) {
    console.error('Error adding badge:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check and award eligible badges
const checkAndAwardBadges = async (user) => {
  const newBadges = [];

  for (const [key, badge] of Object.entries(BADGES)) {
    // Check if user already has this badge
    const hasBadge = user.badges.some(b => b.name === badge.name);
    if (hasBadge) continue;

    // Check criteria
    let eligible = true;
    if (badge.criteria.completedJobs && user.completedJobs < badge.criteria.completedJobs) {
      eligible = false;
    }
    if (badge.criteria.level && user.level < badge.criteria.level) {
      eligible = false;
    }
    if (badge.criteria.rating && user.rating < badge.criteria.rating) {
      eligible = false;
    }
    if (badge.criteria.totalReviews && user.totalReviews < badge.criteria.totalReviews) {
      eligible = false;
    }
    if (badge.criteria.demoScore && 
        (!user.demoVerification?.score || user.demoVerification.score < badge.criteria.demoScore)) {
      eligible = false;
    }

    if (eligible) {
      user.badges.push({
        name: badge.name,
        icon: badge.icon,
        description: badge.description,
        earnedAt: new Date()
      });
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
};

// Get user's gamification stats
export const getGamificationStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('xp level badges lastActive completedJobs rating totalReviews');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate XP needed for next level
    const currentLevelXP = (user.level - 1) * 100;
    const nextLevelXP = user.level * 100;
    const progressXP = user.xp - currentLevelXP;
    const progressPercentage = (progressXP / 100) * 100;

    res.json({
      success: true,
      stats: {
        xp: user.xp,
        level: user.level,
        progressXP,
        xpToNextLevel: nextLevelXP - user.xp,
        progressPercentage: Math.min(progressPercentage, 100),
        badges: user.badges,
        totalBadges: user.badges.length,
        completedJobs: user.completedJobs,
        rating: user.rating,
        totalReviews: user.totalReviews,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Award XP for specific action
export const awardXP = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    const xpAmount = XP_REWARDS[action];
    if (!xpAmount) {
      return res.status(400).json({ message: 'Invalid action type' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldLevel = user.level;
    user.xp += xpAmount;
    user.level = calculateLevel(user.xp);
    user.lastActive = new Date();

    await user.save();

    const leveledUp = user.level > oldLevel;
    const newBadges = await checkAndAwardBadges(user);

    res.json({
      success: true,
      message: `Earned ${xpAmount} XP for ${action}!`,
      xpGained: xpAmount,
      user: {
        xp: user.xp,
        level: user.level,
        badges: user.badges
      },
      leveledUp,
      newBadges
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all available badges
export const getAvailableBadges = async (req, res) => {
  try {
    const badgesList = Object.entries(BADGES).map(([key, badge]) => ({
      key,
      ...badge
    }));

    res.json({
      success: true,
      badges: badgesList
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update last active timestamp
export const updateLastActive = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if it's a new day (daily login reward)
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActiveDay = user.lastActive ? new Date(user.lastActive).setHours(0, 0, 0, 0) : null;
    const isNewDay = !lastActiveDay || today > lastActiveDay;

    if (isNewDay) {
      const oldLevel = user.level;
      user.xp += XP_REWARDS.DAILY_LOGIN;
      user.level = calculateLevel(user.xp);
      
      await user.save();
      
      const leveledUp = user.level > oldLevel;
      const newBadges = await checkAndAwardBadges(user);

      return res.json({
        success: true,
        message: 'Daily login bonus earned!',
        dailyBonus: true,
        xpGained: XP_REWARDS.DAILY_LOGIN,
        user: {
          xp: user.xp,
          level: user.level,
          badges: user.badges
        },
        leveledUp,
        newBadges
      });
    }

    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Last active updated',
      dailyBonus: false
    });
  } catch (error) {
    console.error('Error updating last active:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { XP_REWARDS, BADGES };
