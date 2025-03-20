// socket.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';
import Message from '../models/messageModel.js';
import Invitation from '../models/invitationModel.js';
import UnreadMessage from '../models/unreadMessageModel.js';

let io = null;
export const activeSockets = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || "*", methods: ['GET', 'POST'], credentials: true },
    connectionStateRecovery: { maxDisconnectionDuration: 2 * 60 * 1000, skipMiddlewares: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('Authentication required');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, modelType: decoded.modelType || decoded.role };
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    try {
      const { id, modelType } = socket.user;
      const key = `${modelType}_${id}`;

      const user = modelType === 'User' ? await User.findById(id).lean() : await Recruiter.findById(id).lean();
      if (!user) {
        socket.disconnect(true);
        return;
      }

      // Add user to activeSockets (store an array of sockets per user)
      if (!activeSockets.has(key)) {
        activeSockets.set(key, []);
      }
      activeSockets.get(key).push(socket);
      console.log(`User connected: ${key} with socket ID: ${socket.id}, total sockets: ${activeSockets.get(key).length}`);
      socket.join(`user_${key}`);

      // Emit onlineStatus to all clients when the user connects
      io.emit('onlineStatus', { userId: id, status: 'online' });
      console.log(`Emitted onlineStatus: { userId: ${id}, status: 'online' }`);

      // Handle userActive event (if the client emits it)
      socket.on('userActive', (data) => {
        const { userId, userType } = data;
        const userKey = `${userType}_${userId}`;
        if (!activeSockets.has(userKey)) {
          activeSockets.set(userKey, []);
        }
        if (!activeSockets.get(userKey).some(s => s.id === socket.id)) {
          activeSockets.get(userKey).push(socket);
        }
        console.log(`User ${userId} (${userType}) is active, total sockets: ${activeSockets.get(userKey).length}`);
        io.emit('onlineStatus', { userId, status: 'online' });
      });

      socket.on('sendMessage', async (data) => {
        const { receiverId, receiverType, message } = data;
        const senderId = socket.user.id;
        const senderType = socket.user.modelType;

        const invitationRequired = (senderType === 'User' && receiverType === 'Recruiter') ||
                                  (senderType === 'Recruiter' && receiverType === 'Recruiter');
        if (invitationRequired) {
          const invitation = await Invitation.findOne({
            sender: senderId, senderModel: senderType, receiver: receiverId, receiverModel: receiverType, status: 'accepted'
          }).lean();
          if (!invitation) {
            socket.emit('error', { message: 'Invitation required and must be accepted' });
            return;
          }
        }

        const newMessage = new Message({
          sender: senderId, senderModel: senderType, receiver: receiverId, receiverModel: receiverType, message
        });
        await newMessage.save();

        const receiverKey = `${receiverType}_${receiverId}`;
        const receiverSockets = activeSockets.get(receiverKey) || [];
        if (receiverSockets.length === 0) {
          const unread = new UnreadMessage({
            user: receiverId, toModel: receiverType, from: senderId, fromModel: senderType, messageId: newMessage._id
          });
          await unread.save();

          const receiverModel = receiverType === 'User' ? User : Recruiter;
          await receiverModel.findByIdAndUpdate(receiverId, { $push: { unreadMessages: unread._id } }, { new: true, runValidators: true }).lean();
        }

        receiverSockets.forEach((receiverSocket) => {
          receiverSocket.emit('newMessage', {
            ...newMessage.toObject(), senderName: user.name, senderImage: user.profileImage
          });
        });
      });

      socket.on('messageSeen', async (data) => {
        const { messageId } = data;
        const userId = socket.user.id;
        const userType = socket.user.modelType;

        const message = await Message.findOneAndUpdate(
          { _id: messageId, receiver: userId, receiverModel: userType },
          { status: 'seen' },
          { new: true, runValidators: true }
        ).lean();
        if (message) {
          await UnreadMessage.findOneAndDelete({ user: userId, toModel: userType, messageId }).lean();
          const userModel = userType === 'User' ? User : Recruiter;
          await userModel.findByIdAndUpdate(userId, { $pull: { unreadMessages: messageId } }, { new: true, runValidators: true }).lean();

          const senderKey = `${message.senderModel}_${message.sender}`;
          const senderSockets = activeSockets.get(senderKey) || [];
          senderSockets.forEach((senderSocket) => {
            senderSocket.emit('messageSeen', { messageId, timestamp: new Date() });
          });
        }
      });

      socket.on('typing', (data) => {
        const { receiverId, receiverType } = data;
        const receiverKey = `${receiverType}_${receiverId}`;
        const receiverSockets = activeSockets.get(receiverKey) || [];
        receiverSockets.forEach((receiverSocket) => {
          receiverSocket.emit('typing', { senderId: socket.user.id, senderType: socket.user.modelType });
        });
      });

      socket.on('sendInvitation', async (data) => {
        const { receiverId, receiverType } = data;
        const senderId = socket.user.id;
        const senderType = socket.user.modelType;

        const existingInvitation = await Invitation.findOne({
          sender: senderId, senderModel: senderType, receiver: receiverId, receiverModel: receiverType, status: 'pending'
        }).lean();
        if (existingInvitation) {
          socket.emit('error', { message: 'Invitation already sent' });
          return;
        }

        const invitation = new Invitation({
          sender: senderId, senderModel: senderType, receiver: receiverId, receiverModel: receiverType
        });
        await invitation.save();

        const receiverKey = `${receiverType}_${receiverId}`;
        const receiverSockets = activeSockets.get(receiverKey) || [];
        receiverSockets.forEach((receiverSocket) => {
          receiverSocket.emit('newInvitation', {
            invitationId: invitation._id, senderId, senderType, senderName: user.name, senderImage: user.profileImage
          });
        });
      });

      socket.on('acceptInvitation', async (data) => {
        const { invitationId } = data;
        const userId = socket.user.id;
        const userType = socket.user.modelType;

        const invitation = await Invitation.findOneAndUpdate(
          { _id: invitationId, receiver: userId, receiverModel: userType, status: 'pending' },
          { status: 'accepted' },
          { new: true, runValidators: true }
        ).lean();
        if (invitation) {
          const senderKey = `${invitation.senderModel}_${invitation.sender}`;
          const senderSockets = activeSockets.get(senderKey) || [];
          senderSockets.forEach((senderSocket) => {
            senderSocket.emit('invitationAccepted', { invitationId, receiverId: userId, receiverType: userType });
          });
        }
      });

      socket.on('disconnect', () => {
        const sockets = activeSockets.get(key) || [];
        const updatedSockets = sockets.filter(s => s.id !== socket.id);
        if (updatedSockets.length > 0) {
          activeSockets.set(key, updatedSockets);
          console.log(`User ${key} still connected, remaining sockets: ${updatedSockets.length}`);
        } else {
          activeSockets.delete(key);
          console.log(`User disconnected: ${key}, no remaining sockets`);
          io.emit('onlineStatus', { userId: id, status: 'offline' });
          console.log(`Emitted onlineStatus: { userId: ${id}, status: 'offline' }`);
        }
      });

    } catch (error) {
      console.error('Connection error:', error.message);
      socket.disconnect(true);
    }
  });
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export const emitNotification = (recipientType, recipientId, event, data) => {
  const key = `${recipientType}_${recipientId}`;
  const sockets = activeSockets.get(key) || [];
  sockets.forEach((socket) => {
    socket.emit(event, data);
    socket.to(`user_${key}`).emit(event, data);
  });
  if (sockets.length === 0) {
    console.log(`No socket found for ${key} to emit ${event}`);
  }
};