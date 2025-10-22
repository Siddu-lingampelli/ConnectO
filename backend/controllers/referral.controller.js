import User from '../models/User.model.js';
import crypto from 'crypto';

// Generate unique referral code
const generateReferralCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Generate referral code for user (if not exists)
export const generateUserReferralCode = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user already has a referral code, return it
    if (user.referralCode) {
      return res.status(200).json({
        referralCode: user.referralCode,
        message: 'Referral code already exists'
      });
    }

    // Generate new unique referral code
    let referralCode;
    let isUnique = false;
    
    while (!isUnique) {
      referralCode = generateReferralCode();
      const existingUser = await User.findOne({ referralCode });
      if (!existingUser) {
        isUnique = true;
      }
    }

    user.referralCode = referralCode;
    await user.save();

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      message: 'Referral code generated successfully'
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating referral code', 
      error: error.message 
    });
  }
};

// Validate referral code
export const validateReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.params;

    if (!referralCode) {
      return res.status(400).json({ 
        success: false,
        message: 'Referral code is required' 
      });
    }

    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
      .select('fullName email role referralCode profilePicture');

    if (!referrer) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid referral code' 
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      referrer: {
        id: referrer._id,
        name: referrer.fullName,
        role: referrer.role,
        profilePicture: referrer.profilePicture
      },
      message: 'Valid referral code'
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error validating referral code', 
      error: error.message 
    });
  }
};

// Apply referral code during signup (called from auth controller)
export const applyReferralCode = async (newUserId, referralCode, newUserRole) => {
  try {
    if (!referralCode) return null;

    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    
    if (!referrer) {
      return { success: false, message: 'Invalid referral code' };
    }

    // Get the new user to check their role
    const newUser = await User.findById(newUserId);
    
    // Update new user with referrer
    await User.findByIdAndUpdate(newUserId, {
      referredBy: referrer._id
    });

    // Dynamic rewards based on referrer and referred user roles
    let referralReward = 50; // Base ₹50 credits
    let xpReward = 100; // Base 100 XP points
    let bonusMessage = '';

    // PROVIDER REFERRING PROVIDER: Extra rewards for building a team
    if (referrer.role === 'provider' && newUser.role === 'provider') {
      referralReward = 75; // ₹75 for provider-to-provider
      xpReward = 150;
      bonusMessage = 'Team Building Bonus! 🤝';
    }
    
    // CLIENT REFERRING CLIENT: Extra rewards for growing client base
    if (referrer.role === 'client' && newUser.role === 'client') {
      referralReward = 100; // ₹100 posting credits
      xpReward = 120;
      bonusMessage = 'Community Builder Bonus! 🌟';
    }
    
    // PROVIDER REFERRING CLIENT: Good for ecosystem growth
    if (referrer.role === 'provider' && newUser.role === 'client') {
      referralReward = 60;
      xpReward = 110;
      bonusMessage = 'Network Expansion Bonus! 🚀';
    }
    
    // CLIENT REFERRING PROVIDER: Brings talent to platform
    if (referrer.role === 'client' && newUser.role === 'provider') {
      referralReward = 80;
      xpReward = 130;
      bonusMessage = 'Talent Scout Bonus! 💼';
    }

    // Apply rewards
    referrer.referralCredits += referralReward;
    referrer.referralCount += 1;
    referrer.referralEarnings += referralReward;
    referrer.xp += xpReward;

    // Check for level up (100 XP per level)
    const newLevel = Math.floor(referrer.xp / 100) + 1;
    if (newLevel > referrer.level) {
      referrer.level = newLevel;
    }

    // Award badges based on milestones
    const badgesToAward = [];
    
    // First Referral Badge
    if (referrer.referralCount === 1) {
      const badge = {
        name: 'First Referral',
        icon: '🎁',
        description: 'Made your first successful referral',
        earnedAt: new Date()
      };
      referrer.badges.push(badge);
      badgesToAward.push(badge);
    }

    // Referral Champion (5 referrals)
    if (referrer.referralCount === 5) {
      const badge = {
        name: 'Referral Champion',
        icon: '🏆',
        description: 'Successfully referred 5 users',
        earnedAt: new Date()
      };
      referrer.badges.push(badge);
      badgesToAward.push(badge);
    }

    // Referral Master (10 referrals)
    if (referrer.referralCount === 10) {
      const badge = {
        name: 'Referral Master',
        icon: '👑',
        description: 'Successfully referred 10 users',
        earnedAt: new Date()
      };
      referrer.badges.push(badge);
      badgesToAward.push(badge);
    }
    
    // Super Referrer (25 referrals)
    if (referrer.referralCount === 25) {
      const badge = {
        name: 'Super Referrer',
        icon: '⭐',
        description: 'Amazing! Referred 25 users',
        earnedAt: new Date()
      };
      referrer.badges.push(badge);
      badgesToAward.push(badge);
    }
    
    // Referral Legend (50 referrals)
    if (referrer.referralCount === 50) {
      const badge = {
        name: 'Referral Legend',
        icon: '💎',
        description: 'Legendary! Referred 50 users',
        earnedAt: new Date()
      };
      referrer.badges.push(badge);
      badgesToAward.push(badge);
    }

    // Role-specific badges
    if (referrer.role === 'provider') {
      // Team Builder Badge (5 provider referrals)
      const providerReferrals = await User.countDocuments({ 
        referredBy: referrer._id, 
        role: 'provider' 
      });
      
      if (providerReferrals === 5 && !referrer.badges.some(b => b.name === 'Team Builder')) {
        const badge = {
          name: 'Team Builder',
          icon: '🤝',
          description: 'Built a team of 5 providers',
          earnedAt: new Date()
        };
        referrer.badges.push(badge);
        badgesToAward.push(badge);
      }
      
      // Network Architect (10 provider referrals)
      if (providerReferrals === 10 && !referrer.badges.some(b => b.name === 'Network Architect')) {
        const badge = {
          name: 'Network Architect',
          icon: '🏗️',
          description: 'Built a network of 10 providers',
          earnedAt: new Date()
        };
        referrer.badges.push(badge);
        badgesToAward.push(badge);
      }
    }

    if (referrer.role === 'client') {
      // Community Builder Badge (5 client referrals)
      const clientReferrals = await User.countDocuments({ 
        referredBy: referrer._id, 
        role: 'client' 
      });
      
      if (clientReferrals === 5 && !referrer.badges.some(b => b.name === 'Community Builder')) {
        const badge = {
          name: 'Community Builder',
          icon: '🌟',
          description: 'Brought 5 clients to the platform',
          earnedAt: new Date()
        };
        referrer.badges.push(badge);
        badgesToAward.push(badge);
      }
      
      // Talent Scout (5 provider referrals from client)
      const providerReferrals = await User.countDocuments({ 
        referredBy: referrer._id, 
        role: 'provider' 
      });
      
      if (providerReferrals === 5 && !referrer.badges.some(b => b.name === 'Talent Scout')) {
        const badge = {
          name: 'Talent Scout',
          icon: '�',
          description: 'Brought 5 talented providers to the platform',
          earnedAt: new Date()
        };
        referrer.badges.push(badge);
        badgesToAward.push(badge);
      }
    }

    // Trusted Referrer status (10+ successful referrals)
    if (referrer.referralCount >= 10 && !referrer.badges.some(b => b.name === 'Trusted Referrer')) {
      const badge = {
        name: 'Trusted Referrer',
        icon: '✅',
        description: 'Verified trusted referrer with 10+ successful referrals',
        earnedAt: new Date()
      };
      referrer.badges.push(badge);
      badgesToAward.push(badge);
      
      // Grant priority verification status for providers
      if (referrer.role === 'provider' && referrer.verification.status === 'unverified') {
        referrer.verification.status = 'pending';
        bonusMessage += ' | Priority Verification Unlocked! ⚡';
      }
    }

    await referrer.save();

    return {
      success: true,
      message: 'Referral applied successfully',
      reward: {
        credits: referralReward,
        xp: xpReward,
        bonusMessage,
        badgesEarned: badgesToAward
      }
    };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { 
      success: false, 
      message: 'Error applying referral code', 
      error: error.message 
    };
  }
};

// Get referral stats for user
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get list of referred users
    const referredUsers = await User.find({ referredBy: userId })
      .select('fullName email role createdAt profilePicture')
      .sort({ createdAt: -1 });

    // Get referrer info (if user was referred by someone)
    let referredByUser = null;
    if (user.referredBy) {
      referredByUser = await User.findById(user.referredBy)
        .select('fullName email profilePicture referralCode');
    }

    res.status(200).json({
      success: true,
      stats: {
        referralCode: user.referralCode,
        referralCount: user.referralCount || 0,
        referralCredits: user.referralCredits || 0,
        referralEarnings: user.referralEarnings || 0,
        referredBy: referredByUser,
        referredUsers: referredUsers.map(u => ({
          id: u._id,
          name: u.fullName,
          email: u.email,
          role: u.role,
          joinedAt: u.createdAt,
          profilePicture: u.profilePicture
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching referral stats', 
      error: error.message 
    });
  }
};

// Get referral leaderboard
export const getReferralLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topReferrers = await User.find({ referralCount: { $gt: 0 } })
      .select('fullName email role referralCount referralEarnings referralCredits profilePicture')
      .sort({ referralCount: -1, referralEarnings: -1 })
      .limit(limit);

    const leaderboard = topReferrers.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.fullName,
      role: user.role,
      profilePicture: user.profilePicture,
      referralCount: user.referralCount,
      totalEarnings: user.referralEarnings,
      credits: user.referralCredits
    }));

    res.status(200).json({
      success: true,
      leaderboard,
      total: topReferrers.length
    });
  } catch (error) {
    console.error('Error fetching referral leaderboard:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching leaderboard', 
      error: error.message 
    });
  }
};

// Redeem referral credits (convert to wallet balance or discount)
export const redeemReferralCredits = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid redemption amount' 
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (user.referralCredits < amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient referral credits' 
      });
    }

    // Deduct credits
    user.referralCredits -= amount;
    await user.save();

    // TODO: Add to wallet or apply discount
    // This would integrate with your payment/wallet system

    res.status(200).json({
      success: true,
      message: `Successfully redeemed ₹${amount} credits`,
      remainingCredits: user.referralCredits
    });
  } catch (error) {
    console.error('Error redeeming credits:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error redeeming credits', 
      error: error.message 
    });
  }
};

export default {
  generateUserReferralCode,
  validateReferralCode,
  applyReferralCode,
  getReferralStats,
  getReferralLeaderboard,
  redeemReferralCredits
};
