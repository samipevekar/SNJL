import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';
import Message from '../models/messageModel.js';
import Invitation from '../models/invitationModel.js';
import UnreadMessage from '../models/unreadMessageModel.js';
import { activeSockets, getIO } from '../utils/socket.js';
import mongoose from 'mongoose';

// Helper function to get user details
const getUserDetails = async (id, modelType) => {
  const model = modelType === 'User' ? User : Recruiter;
  const user = await model.findById(id).select('name profileImage').lean();
  return {
    name: user?.name || 'Unknown',
    profileImage: user?.profileImage || ''
  };
};

// Send Invitation
export const sendInvitation = async (req, res) => {
  try {
    const { receiverId, receiverType } = req.body;
    const senderId = req.user.id;
    const senderType = req.user.role;

    const receiver = receiverType === 'User'
      ? await User.findById(receiverId).select('name profileImage').lean()
      : await Recruiter.findById(receiverId).select('name profileImage').lean();
    if (!receiver) return res.status(404).json({ success: false, message: 'Receiver not found' });

    const existingInvitation = await Invitation.findOne({
      sender: senderId,
      senderModel: senderType,
      receiver: receiverId,
      receiverModel: receiverType,
      status: 'pending'
    }).lean();
    if (existingInvitation) return res.status(400).json({ success: false, message: 'Invitation already sent' });

    const invitation = new Invitation({
      sender: senderId,
      senderModel: senderType,
      receiver: receiverId,
      receiverModel: receiverType
    });
    await invitation.save();

    const senderDetails = await getUserDetails(senderId, senderType);
    const receiverKey = `${receiverType}_${receiverId}`;
    const receiverSockets = activeSockets.get(receiverKey) || [];
    if (receiverSockets.length > 0) {
      receiverSockets.forEach((socket) => {
        socket.emit('newInvitation', {
          invitationId: invitation._id,
          senderId,
          senderType,
          senderName: senderDetails.name,
          senderImage: senderDetails.profileImage
        });
        console.log(`Emitted newInvitation to receiver socket ${socket.id}`);
      });
    }

    res.status(201).json({ success: true, invitation });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Accept Invitation
export const acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;
    const userId = req.user.id;
    const userType = req.user.role;

    const invitation = await Invitation.findOneAndUpdate(
      { _id: invitationId, receiver: userId, receiverModel: userType, status: 'pending' },
      { status: 'accepted' },
      { new: true, runValidators: true }
    ).lean();
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found or already processed' });

    const senderDetails = await getUserDetails(invitation.sender, invitation.senderModel);
    const receiverDetails = await getUserDetails(userId, userType);

    const senderKey = `${invitation.senderModel}_${invitation.sender}`;
    const senderSockets = activeSockets.get(senderKey) || [];
    if (senderSockets.length > 0) {
      senderSockets.forEach((socket) => {
        socket.emit('invitationAccepted', {
          invitationId,
          receiverId: userId,
          receiverType: userType,
          receiverName: receiverDetails.name,
          receiverImage: receiverDetails.profileImage
        });
        console.log(`Emitted invitationAccepted to sender socket ${socket.id}`);
      });
    }

    res.status(200).json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, receiverType, message } = req.body;
    const senderId = req.user.id;
    const senderType = req.user.role;
    console.log("receiverId:", receiverId, receiverType, senderId, senderType);

    if (!receiverId || !message) {
      return res.status(400).json({ success: false, message: 'Receiver ID and message are required' });
    }

    // Validate receiver
    const receiver = receiverType === 'User'
      ? await User.findById(receiverId).select('name profileImage').lean()
      : await Recruiter.findById(receiverId).select('name profileImage').lean();
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    // Check if invitation is required and accepted
    const invitationRequired = (senderType === 'User' && receiverType === 'Recruiter') ||
                              (senderType === 'Recruiter' && receiverType === 'Recruiter');
    if (invitationRequired) {
      const invitation = await Invitation.findOne({
        sender: senderId,
        senderModel: senderType,
        receiver: receiverId,
        receiverModel: receiverType,
        status: 'accepted'
      }).lean();
      if (!invitation) {
        return res.status(403).json({ success: false, message: 'Invitation required and must be accepted' });
      }
    }

    // Create and save the new message
    const newMessage = new Message({
      sender: senderId,
      senderModel: senderType,
      receiver: receiverId,
      receiverModel: receiverType,
      message,
    });
    await newMessage.save();

    // Get sender details
    const senderDetails = await getUserDetails(senderId, senderType);

    // Check if receiver is online and emit the message
    const receiverKey = `${receiverType}_${receiverId}`;
    console.log("receiverKey", receiverKey);
    const receiverSockets = activeSockets.get(receiverKey) || [];
    console.log("receiverSockets", receiverSockets);

    if (receiverSockets.length === 0) {
      // Receiver is offline, save as unread message
      const unread = new UnreadMessage({
        user: receiverId,
        toModel: receiverType,
        from: senderId,
        fromModel: senderType,
        messageId: newMessage._id
      });
      await unread.save();

      const receiverModel = receiverType === 'User' ? User : Recruiter;
      await receiverModel.findByIdAndUpdate(receiverId, {
        $push: { unreadMessages: unread._id }
      }, { new: true, runValidators: true }).lean();
      console.log(`Receiver ${receiverKey} is offline, saved unread message`);
    } else {
      // Receiver is online, emit to all their sockets
      receiverSockets.forEach((socket) => {
        socket.emit('newMessage', {
          ...newMessage.toObject(),
          senderName: senderDetails.name,
          senderImage: senderDetails.profileImage
        });
        console.log(`Emitted newMessage to receiver socket ${socket.id}`);
      });
    }

    // Emit the message back to the sender to confirm it was sent
    const senderKey = `${senderType}_${senderId}`;
    const senderSockets = activeSockets.get(senderKey) || [];
    senderSockets.forEach((socket) => {
      socket.emit('newMessage', {
        ...newMessage.toObject(),
        senderName: senderDetails.name,
        senderImage: senderDetails.profileImage
      });
      console.log(`Emitted newMessage to sender socket ${socket.id}`);
    });

    // Respond to the client
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark Message as Seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.body;
    const userId = req.user.id;
    const userType = req.user.role;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: userId, receiverModel: userType },
      { status: 'seen' },
      { new: true, runValidators: true }
    ).lean();
    if (!message) return res.status(404).json({ success: false, message: 'Message not found or unauthorized' });

    const unread = await UnreadMessage.findOneAndDelete({
      user: userId,
      toModel: userType,
      messageId
    }).lean();
    if (unread) {
      const userModel = userType === 'User' ? User : Recruiter;
      await userModel.findByIdAndUpdate(userId, {
        $pull: { unreadMessages: messageId }
      }, { new: true, runValidators: true }).lean();
    }

    const senderDetails = await getUserDetails(message.sender, message.senderModel);
    const senderKey = `${message.senderModel}_${message.sender}`;
    const senderSockets = activeSockets.get(senderKey) || [];
    if (senderSockets.length > 0) {
      senderSockets.forEach((socket) => {
        socket.emit('messageSeen', {
          messageId,
          timestamp: new Date(),
          senderName: senderDetails.name,
          senderImage: senderDetails.profileImage
        });
        console.log(`Emitted messageSeen to sender socket ${socket.id}`);
      });
    }

    res.status(200).json({ success: true, message: 'Message marked as seen' });
  } catch (error) {
    console.error('Mark message as seen error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Typing Indicator
export const typing = async (req, res) => {
  try {
    const { receiverId, receiverType } = req.body;
    const senderId = req.user.id;
    const senderType = req.user.role;

    const senderDetails = await getUserDetails(senderId, senderType);
    const receiverKey = `${receiverType}_${receiverId}`;
    const receiverSockets = activeSockets.get(receiverKey) || [];
    if (receiverSockets.length > 0) {
      receiverSockets.forEach((socket) => {
        socket.emit('typing', {
          senderId,
          senderType,
          senderName: senderDetails.name
        });
        console.log(`Emitted typing to receiver socket ${socket.id}`);
      });
    }

    res.status(200).json({ success: true, message: 'Typing status sent' });
  } catch (error) {
    console.error('Typing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Chat History
export const getChatHistory = async (req, res) => {
  try {
    const { userId: receiverId } = req.params;
    console.log("receiverId:", receiverId);

    const senderId = req.user.id;
    const senderType = req.user.role;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ success: false, message: 'Invalid receiver ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ success: false, message: 'Invalid sender ID' });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: senderId,
          senderModel: senderType,
          receiver: receiverId,
          receiverModel: { $in: ['User', 'Recruiter'] },
        },
        {
          sender: receiverId,
          senderModel: { $in: ['User', 'Recruiter'] },
          receiver: senderId,
          receiverModel: senderType,
        },
      ],
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .populate({
        path: 'sender',
        select: 'name profileImage _id',
      })
      .populate({
        path: 'receiver',
        select: 'name profileImage _id',
      });

    const totalMessages = await Message.countDocuments({
      $or: [
        {
          sender: senderId,
          senderModel: senderType,
          receiver: receiverId,
          receiverModel: { $in: ['User', 'Recruiter'] },
        },
        {
          sender: receiverId,
          senderModel: { $in: ['User', 'Recruiter'] },
          receiver: senderId,
          receiverModel: senderType,
        },
      ],
    });

    console.log(`Fetched ${messages.length} messages (page ${page}, limit ${limit})`);

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        limit,
      },
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};