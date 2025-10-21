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

    console.log('📬 Fetching conversations for user:', userId);

    // Find all conversations involving this user
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'fullName profilePicture email role city')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    console.log(`✅ Found ${conversations.length} conversations`);

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

    console.log('💬 Fetching messages between:', currentUserId, 'and', otherUserId);

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

    console.log(`✅ Found ${messages.length} messages`);

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
    const { receiverId, content, type = 'text' } = req.body;

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

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content,
      type
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
