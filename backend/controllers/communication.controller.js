import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import notificationHelper from '../utils/notificationHelper.js';
import crypto from 'crypto';

// ==================== VIDEO CALL ====================

// @desc    Initiate video call
// @route   POST /api/communication/video-call/initiate
// @access  Private
export const initiateVideoCall = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Generate unique room ID
    const roomId = `video_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create conversation ID
    const conversationId = [sender._id, receiver._id].sort().join('_');

    // Create call message
    const message = new Message({
      conversation: conversationId,
      sender: sender._id,
      receiver: receiver._id,
      type: 'video_call',
      content: `📹 Video call initiated by ${sender.fullName}`,
      callData: {
        status: 'initiated',
        roomId,
        startedAt: new Date(),
        participants: [{
          userId: sender._id,
          joinedAt: new Date()
        }]
      }
    });

    await message.save();

    // Notify receiver
    try {
      await notificationHelper.createNotification({
        user: receiver._id,
        type: 'video_call_incoming',
        message: `📹 ${sender.fullName} is calling you`,
        relatedUser: sender._id
      });
    } catch (notifError) {
      console.log('⚠️ Could not send notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Video call initiated',
      data: {
        messageId: message._id,
        roomId,
        callData: message.callData
      }
    });
  } catch (error) {
    console.error('❌ Initiate video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Join video call
// @route   PUT /api/communication/video-call/:messageId/join
// @access  Private
export const joinVideoCall = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message || message.type !== 'video_call') {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is authorized
    if (message.receiver.toString() !== req.user._id.toString() && 
        message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to join this call'
      });
    }

    // Update call status
    message.callData.status = 'answered';
    message.callData.participants.push({
      userId: req.user._id,
      joinedAt: new Date()
    });

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Joined call successfully',
      data: {
        roomId: message.callData.roomId,
        callData: message.callData
      }
    });
  } catch (error) {
    console.error('❌ Join video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    End video call
// @route   PUT /api/communication/video-call/:messageId/end
// @access  Private
export const endVideoCall = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { duration, recordingUrl } = req.body;

    const message = await Message.findById(messageId);

    if (!message || message.type !== 'video_call') {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Update participant left time
    const participant = message.callData.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (participant) {
      participant.leftAt = new Date();
    }

    // If all participants left, mark call as ended
    const allLeft = message.callData.participants.every(p => p.leftAt);
    
    if (allLeft) {
      message.callData.status = 'ended';
      message.callData.endedAt = new Date();
    }

    if (duration) {
      message.callData.duration = duration;
    }

    if (recordingUrl) {
      message.callData.recordingUrl = recordingUrl;
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Call ended',
      data: message.callData
    });
  } catch (error) {
    console.error('❌ End video call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== VOICE CALL ====================

// @desc    Initiate voice call
// @route   POST /api/communication/voice-call/initiate
// @access  Private
export const initiateVoiceCall = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Generate unique room ID
    const roomId = `voice_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create conversation ID
    const conversationId = [sender._id, receiver._id].sort().join('_');

    // Create call message
    const message = new Message({
      conversation: conversationId,
      sender: sender._id,
      receiver: receiver._id,
      type: 'voice_call',
      content: `📞 Voice call initiated by ${sender.fullName}`,
      callData: {
        status: 'initiated',
        roomId,
        startedAt: new Date(),
        participants: [{
          userId: sender._id,
          joinedAt: new Date()
        }]
      }
    });

    await message.save();

    // Notify receiver
    try {
      await notificationHelper.createNotification({
        user: receiver._id,
        type: 'voice_call_incoming',
        message: `📞 ${sender.fullName} is calling you`,
        relatedUser: sender._id
      });
    } catch (notifError) {
      console.log('⚠️ Could not send notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Voice call initiated',
      data: {
        messageId: message._id,
        roomId,
        callData: message.callData
      }
    });
  } catch (error) {
    console.error('❌ Initiate voice call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Join voice call (reuse video call logic with type check)
// @route   PUT /api/communication/voice-call/:messageId/join
// @access  Private
export const joinVoiceCall = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message || message.type !== 'voice_call') {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is authorized
    if (message.receiver.toString() !== req.user._id.toString() && 
        message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to join this call'
      });
    }

    // Update call status
    message.callData.status = 'answered';
    message.callData.participants.push({
      userId: req.user._id,
      joinedAt: new Date()
    });

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Joined call successfully',
      data: {
        roomId: message.callData.roomId,
        callData: message.callData
      }
    });
  } catch (error) {
    console.error('❌ Join voice call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    End voice call (reuse video call logic)
// @route   PUT /api/communication/voice-call/:messageId/end
// @access  Private
export const endVoiceCall = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { duration, recordingUrl } = req.body;

    const message = await Message.findById(messageId);

    if (!message || message.type !== 'voice_call') {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Update participant left time
    const participant = message.callData.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (participant) {
      participant.leftAt = new Date();
    }

    // If all participants left, mark call as ended
    const allLeft = message.callData.participants.every(p => p.leftAt);
    
    if (allLeft) {
      message.callData.status = 'ended';
      message.callData.endedAt = new Date();
    }

    if (duration) {
      message.callData.duration = duration;
    }

    if (recordingUrl) {
      message.callData.recordingUrl = recordingUrl;
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Call ended',
      data: message.callData
    });
  } catch (error) {
    console.error('❌ End voice call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== SCREEN SHARE ====================

// @desc    Initiate screen share
// @route   POST /api/communication/screen-share/initiate
// @access  Private
export const initiateScreenShare = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID is required'
      });
    }

    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Generate unique room ID
    const roomId = `screen_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create conversation ID
    const conversationId = [sender._id, receiver._id].sort().join('_');

    // Create screen share message
    const message = new Message({
      conversation: conversationId,
      sender: sender._id,
      receiver: receiver._id,
      type: 'screen_share',
      content: `🖥️ Screen sharing session started by ${sender.fullName}`,
      callData: {
        status: 'initiated',
        roomId,
        startedAt: new Date(),
        participants: [{
          userId: sender._id,
          joinedAt: new Date()
        }]
      }
    });

    await message.save();

    // Notify receiver
    try {
      await notificationHelper.createNotification({
        user: receiver._id,
        type: 'screen_share_request',
        message: `🖥️ ${sender.fullName} wants to share their screen`,
        relatedUser: sender._id
      });
    } catch (notifError) {
      console.log('⚠️ Could not send notification:', notifError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Screen share session initiated',
      data: {
        messageId: message._id,
        roomId,
        callData: message.callData
      }
    });
  } catch (error) {
    console.error('❌ Initiate screen share error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    End screen share
// @route   PUT /api/communication/screen-share/:messageId/end
// @access  Private
export const endScreenShare = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { duration } = req.body;

    const message = await Message.findById(messageId);

    if (!message || message.type !== 'screen_share') {
      return res.status(404).json({
        success: false,
        message: 'Screen share session not found'
      });
    }

    message.callData.status = 'ended';
    message.callData.endedAt = new Date();
    
    if (duration) {
      message.callData.duration = duration;
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Screen share session ended',
      data: message.callData
    });
  } catch (error) {
    console.error('❌ End screen share error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// ==================== CALL HISTORY ====================

// @desc    Get call history
// @route   GET /api/communication/call-history
// @access  Private
export const getCallHistory = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    const query = {
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ],
      type: { $in: ['video_call', 'voice_call', 'screen_share'] }
    };

    if (type) {
      query.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const calls = await Message.find(query)
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: calls,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCalls: total
      }
    });
  } catch (error) {
    console.error('❌ Get call history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Decline call
// @route   PUT /api/communication/call/:messageId/decline
// @access  Private
export const declineCall = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    message.callData.status = 'declined';
    message.callData.endedAt = new Date();

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Call declined',
      data: message.callData
    });
  } catch (error) {
    console.error('❌ Decline call error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
