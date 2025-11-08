import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || ['http://localhost:3011', 'http://localhost:3012', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      
      // Fetch user details for better logging
      const user = await User.findById(decoded.userId).select('fullName email');
      if (user) {
        socket.userName = user.fullName || user.email;
      } else {
        socket.userName = 'Unknown User';
      }
      
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Broadcast user online status
    io.emit('user_status_change', {
      userId: socket.userId,
      status: 'online'
    });

    // ============ CALL EVENTS ============

    // Video call initiated
    socket.on('initiate_video_call', async (data) => {
      const { chatId, recipientId, callId, roomId } = data;
      
      console.log(`📹 Video call initiated:`, {
        from: socket.userName,
        fromId: socket.userId,
        to: recipientId,
        callId,
        roomId
      });
      
      // Send to recipient
      io.to(`user:${recipientId}`).emit('incoming_video_call', {
        callId,
        chatId,
        roomId,
        caller: {
          id: socket.userId,
          name: socket.userName,
          avatar: data.callerAvatar
        }
      });

      console.log(`� Sent incoming_video_call to user:${recipientId}`);
    });

    // Voice call initiated
    socket.on('initiate_voice_call', async (data) => {
      const { chatId, recipientId, callId, roomId } = data;
      
      io.to(`user:${recipientId}`).emit('incoming_voice_call', {
        callId,
        chatId,
        roomId,
        caller: {
          id: socket.userId,
          name: socket.userName,
          avatar: data.callerAvatar
        }
      });

      console.log(`📞 Voice call from ${socket.userName} to user ${recipientId}`);
    });

    // Screen share initiated
    socket.on('initiate_screen_share', async (data) => {
      const { chatId, recipientId, sessionId } = data;
      
      io.to(`user:${recipientId}`).emit('incoming_screen_share', {
        sessionId,
        chatId,
        sharer: {
          id: socket.userId,
          name: socket.userName,
          avatar: data.sharerAvatar
        }
      });

      console.log(`🖥️ Screen share from ${socket.userName} to user ${recipientId}`);
    });

    // Call accepted
    socket.on('accept_call', (data) => {
      const { callId, callerId } = data;
      
      io.to(`user:${callerId}`).emit('call_accepted', {
        callId,
        participantId: socket.userId,
        participantName: socket.userName
      });

      console.log(`✅ Call ${callId} accepted by ${socket.userName}`);
    });

    // Call declined
    socket.on('decline_call', (data) => {
      const { callId, callerId, reason } = data;
      
      io.to(`user:${callerId}`).emit('call_declined', {
        callId,
        reason
      });

      console.log(`❌ Call ${callId} declined by ${socket.userName}`);
    });

    // Call ended
    socket.on('end_call', (data) => {
      const { callId, participantIds, duration } = data;
      
      // Notify all participants
      participantIds.forEach(participantId => {
        if (participantId !== socket.userId) {
          io.to(`user:${participantId}`).emit('call_ended', {
            callId,
            endedBy: socket.userId,
            duration
          });
        }
      });

      console.log(`🔴 Call ${callId} ended by ${socket.userName}`);
    });

    // Participant joined
    socket.on('participant_joined', (data) => {
      const { callId, roomId, otherParticipantIds } = data;
      
      // Join call room
      socket.join(`call:${callId}`);
      
      // Notify others in the call
      socket.to(`call:${callId}`).emit('participant_joined', {
        callId,
        participant: {
          id: socket.userId,
          name: socket.userName
        }
      });
    });

    // Participant left
    socket.on('participant_left', (data) => {
      const { callId } = data;
      
      socket.to(`call:${callId}`).emit('participant_left', {
        callId,
        participantId: socket.userId
      });

      socket.leave(`call:${callId}`);
    });

    // ============ WEBRTC SIGNALING ============

    // WebRTC offer
    socket.on('webrtc_offer', (data) => {
      const { callId, targetUserId, offer } = data;
      
      io.to(`user:${targetUserId}`).emit('webrtc_offer', {
        callId,
        fromUserId: socket.userId,
        offer
      });

      console.log(`📡 WebRTC offer sent to user ${targetUserId}`);
    });

    // WebRTC answer
    socket.on('webrtc_answer', (data) => {
      const { callId, targetUserId, answer } = data;
      
      io.to(`user:${targetUserId}`).emit('webrtc_answer', {
        callId,
        fromUserId: socket.userId,
        answer
      });

      console.log(`📡 WebRTC answer sent to user ${targetUserId}`);
    });

    // ICE candidate
    socket.on('ice_candidate', (data) => {
      const { callId, targetUserId, candidate } = data;
      
      io.to(`user:${targetUserId}`).emit('ice_candidate', {
        callId,
        fromUserId: socket.userId,
        candidate
      });
    });

    // ============ CHAT EVENTS ============

    // Typing indicator
    socket.on('typing', (data) => {
      const { chatId, recipientId } = data;
      
      io.to(`user:${recipientId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        userName: socket.userName
      });
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
      const { chatId, recipientId } = data;
      
      io.to(`user:${recipientId}`).emit('user_stop_typing', {
        chatId,
        userId: socket.userId
      });
    });

    // New message (you can emit this from your message controller)
    socket.on('send_message', (data) => {
      const { chatId, recipientId, message } = data;
      
      io.to(`user:${recipientId}`).emit('new_message', {
        chatId,
        message
      });
    });

    // ============ NOTIFICATION EVENTS ============

    // Mark notification as read
    socket.on('mark_notification_read', async (data) => {
      const { notificationId } = data;
      // Update notification in database
      console.log(`Notification ${notificationId} marked as read by ${socket.userName}`);
    });

    // ============ USER STATUS ============

    // Update status
    socket.on('update_status', (data) => {
      const { status } = data;
      
      io.emit('user_status_change', {
        userId: socket.userId,
        status
      });

      console.log(`User ${socket.userName} status: ${status}`);
    });

    // ============ DISCONNECTION ============

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName}`);
      
      // Broadcast user offline status
      io.emit('user_status_change', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

// Helper function to emit to specific user
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Helper function to emit notification
export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

// Get io instance
export const getIO = () => io;

export default { initializeSocket, emitToUser, emitNotification, getIO };
