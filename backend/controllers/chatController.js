import Recruiter from "../models/recruiterModel.js";
import User from '../models/userModel.js'
import Chat from "../models/chatModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { senderId, senderType, receiverId, receiverType, message } =
      req.body;

      console.log("senderId",senderId,"senderType",senderType,"receiverId",receiverId,"receiverType",receiverType,"message",message)

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // if sender is recruiter then no need to accept the invite
    if(senderType == "Recruiter"){
      const recruiter = await Recruiter.findById(senderId);  
      if (!recruiter) {
        return res.status(404).json({ message: "Recruiter not found" });
      }
      recruiter.invites.push(receiverId)
      await recruiter.save()
    }

    // If a user is messaging a recruiter, check invite status
    if (senderType === "User" && receiverType === "Recruiter") {
      const recruiter = await Recruiter.findById(receiverId);

      if (!recruiter) {
        return res.status(404).json({ message: "Recruiter not found" });
      }

      // check if user is added to invites
      const hasInvite = recruiter.invites.includes(senderId);
      const previousMessages = await Chat.findOne({
        sender: senderId,
        senderType: "User",
        receiver: receiverId,
        receiverType: "Recruiter",
      });

      if (previousMessages && !hasInvite) {
        return res
          .status(403)
          .json({ message: "Recruiter has not accepted the invite yet" });
      }
    }


    // Create message
    const newMessage = new Chat({
      sender: senderId,
      senderType,
      receiver: receiverId,
      receiverType,
      message,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("receiverSocketId",receiverSocketId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recruiter Accepts Invite
export const acceptInvite = async (req, res) => {
  try {
    const { recruiterId, userId } = req.body;

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }

    if (!recruiter.invites.includes(userId)) {
      recruiter.invites.push(userId);
      await recruiter.save();
    }

    res.status(200).json({ message: "Invite accepted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Chat History
export const getChatHistory = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Chat.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getChatUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find all messages where user is sender or receiver
    const messages = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    // Extract unique user IDs with types
    const userSet = new Set();

    messages.forEach((msg) => {
      if (msg.sender.toString() !== userId) {
        userSet.add(JSON.stringify({ id: msg.sender.toString(), type: msg.senderType }));
      }
      if (msg.receiver.toString() !== userId) {
        userSet.add(JSON.stringify({ id: msg.receiver.toString(), type: msg.receiverType }));
      }
    });

    // Convert Set to Array
    const chatUserIds = Array.from(userSet).map((item) => JSON.parse(item));

    // Fetch user details from both schemas
    const employers = await Recruiter.find({
      _id: { $in: chatUserIds.filter((u) => u.type === "Recruiter").map((u) => u.id) },
    }).select("name email profileImage");

    const workers = await User.find({
      _id: { $in: chatUserIds.filter((u) => u.type === "User").map((u) => u.id) },
    }).select("name email profileImage");

    // Merge both users
    const chatUsers = [...employers, ...workers];

    res.status(200).json(chatUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};