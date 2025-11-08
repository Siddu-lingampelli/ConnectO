import Message from '../models/Message.model.js';
import Conversation from '../models/Conversation.model.js';
import User from '../models/User.model.js';
import notificationHelper from '../utils/notificationHelper.js';

// Helper to get or create conversation ID
const getConversationId = (userId1, userId2) => {
  const ids = [userId1.toString(), userId2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    if (process.env.ENABLE_DEBUG_LOGS === 'true') {
      console.log('📬 Fetching conversations for user:', userId);
    }

    // Find all conversations involving this user
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'fullName profilePicture email role city')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    if (process.env.ENABLE_DEBUG_LOGS === 'true') {
      console.log(`✅ Found ${conversations.length} conversations`);
    }

    res.status(200).json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    if (process.env.ENABLE_DEBUG_LOGS === 'true') {
      console.log('💬 Fetching messages between:', currentUserId, 'and', otherUserId);
    }

    const conversationId = getConversationId(currentUserId, otherUserId);

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName profilePicture email')
      .populate('receiver', 'fullName profilePicture email')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Update unread count in conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    });

    if (conversation) {
      conversation.unreadCount.set(currentUserId.toString(), 0);
      await conversation.save();
    }

    if (process.env.ENABLE_DEBUG_LOGS === 'true') {
      console.log(`✅ Found ${messages.length} messages`);
    }

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content, type = 'text', attachments } = req.body;

    console.log('📤 Sending message from:', senderId, 'to:', receiverId);

    // Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    const conversationId = getConversationId(senderId, receiverId);

    // Parse attachments if sent as string
    let parsedAttachments = [];
    if (attachments) {
      parsedAttachments = typeof attachments === 'string' ? JSON.parse(attachments) : attachments;
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content: content || '',
      type,
      attachments: parsedAttachments
    });

    // Populate sender and receiver info
    await message.populate('sender', 'fullName profilePicture email');
    await message.populate('receiver', 'fullName profilePicture email');

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessage: message._id,
        lastMessageAt: new Date(),
        unreadCount: {
          [senderId.toString()]: 0,
          [receiverId.toString()]: 1
        }
      });
    } else {
      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      
      const receiverUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
      conversation.unreadCount.set(receiverId.toString(), receiverUnread + 1);
      
      await conversation.save();
    }

    console.log('✅ Message sent successfully');

    // Send notification to receiver
    try {
      await notificationHelper.messageReceived(
        receiverId,
        req.user.fullName,
        senderId,
        conversationId
      );
      console.log('📬 Notification sent to receiver');
    } catch (notifError) {
      console.error('⚠️ Error sending notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update online status
// @route   PUT /api/messages/status/online
// @access  Private
export const updateOnlineStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isOnline } = req.body;

    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Online status updated'
    });
  } catch (error) {
    console.error('❌ Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update typing status
// @route   PUT /api/messages/status/typing
// @access  Private
export const updateTypingStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId, isTyping } = req.body;

    await User.findByIdAndUpdate(userId, {
      typingTo: isTyping ? receiverId : null
    });

    res.status(200).json({
      success: true,
      message: 'Typing status updated'
    });
  } catch (error) {
    console.error('❌ Update typing status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user status (online, typing)
// @route   GET /api/messages/status/:userId
// @access  Private
export const getUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const user = await User.findById(userId).select('isOnline lastSeen typingTo');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isTypingToMe = user.typingTo && user.typingTo.toString() === currentUserId.toString();

    res.status(200).json({
      success: true,
      data: {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        isTyping: isTypingToMe
      }
    });
  } catch (error) {
    console.error('❌ Get user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Upload file attachment
// @route   POST /api/messages/upload
// @access  Private
export const uploadAttachment = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.file;
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit'
      });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'File type not allowed'
      });
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const uploadPath = `uploads/messages/${filename}`;

    // Move file to upload directory
    await file.mv(uploadPath);

    // Return file info
    const fileInfo = {
      filename,
      originalName: file.name,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/messages/${filename}`
    };

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: { file: fileInfo }
    });
  } catch (error) {
    console.error('❌ Upload attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
