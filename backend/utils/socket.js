// utils/socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';

let io = null;
const activeSockets = new Map(); // Stores active connections: key = "model_id"

// Initialize Socket.IO with HTTP server
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET', 'POST'],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      // console.log("token",token)
      if (!token) throw new Error('Authentication required');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        modelType: decoded.modelType // 'User' or 'HiringUser'
      };
      
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    try {
      const { id, modelType } = socket.user;
      const key = `${modelType}_${id}`;

      // Check user existence
      const user = modelType === 'User' 
        ? await User.findById(id)
        : await Recruiter.findById(id);

      if (!user) {
        socket.disconnect(true);
        return;
      }

      // Store socket reference
      activeSockets.set(key, socket);
      console.log(`User connected: ${key}`);

      // Join user-specific room
      socket.join(`user_${key}`);

      // Friend request notifications
      socket.on('friend_request', async (data) => {
        const receiverKey = `${data.receiverModel}_${data.receiverId}`;
        const receiverSocket = activeSockets.get(receiverKey);
        
        if (receiverSocket) {
          receiverSocket.emit('new_friend_request', {
            senderId: id,
            senderModel: modelType,
            senderName: user.name,
            senderImage: user.profileImage,
            timestamp: new Date()
          });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        activeSockets.delete(key);
        console.log(`User disconnected: ${key}`);
      });

    } catch (error) {
      console.error('Connection error:', error);
      socket.disconnect(true);
    }
  });
};

// Get IO instance
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Send notification helper
export const emitNotification = (recipientType, recipientId, event, data) => {
  const key = `${recipientType}_${recipientId}`;
  const socket = activeSockets.get(key);
  
  if (socket) {
    socket.emit(event, data);
    socket.to(`user_${key}`).emit(event, data); // Broadcast to user room
  }
};