import FriendRequest from "../models/friendRequest.js";
import Notification from "../models/notificationModel.js";
import { getIO } from "../utils/socket.js";
import User from "../models/userModel.js"; // Import User model
import Recruiter from "../models/recruiterModel.js"; // Import HiringUser model
import mongoose from "mongoose";

export const sendFriendRequest = async (req, res) => {
  try {
    
    const senderId = req.user.id;// Get sender's id
    const receiverId = req.params.receiverId;// Get receiver's id
    const senderModel  = req.user.role;
    console.log("senderModel",senderModel)
    const {receiverModel } = req.body;

    // Prevent self-request
    if (senderId.toString() === receiverId.toString() && senderModel === receiverModel) {
      return res.status(400).json({ success: false, message: "Cannot send request to yourself" });
    }

    // Check existing request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: "Request already exists" });
    }

    // Create request
    const newRequest = await FriendRequest.create({
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel,
      status: "pending"
    });
   

    // Create notification
    const notification = await Notification.create({
      recipient: receiverId,
      recipientModel: receiverModel,
      sender: senderId,
      senderModel: senderModel,
      type: "friend_request",
      message: "Sent you a friend request"
    });
console.log("notification",notification)
    // Real-time notification
    const io = getIO();
    io.to(receiverId.toString()).emit("new_notification", notification);

    res.status(201).json({ success: true,message:"Request sent successfully", data: newRequest });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id; // Authenticated user ID
    const userModelType = req.user.role; // From authentication middleware

    // ✅ Validate requestId format
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ success: false, message: "Invalid request ID" });
    }

    // ✅ Find the friend request with proper authorization
    const request = await FriendRequest.findOne({
      _id: requestId,
      $or: [
        { receiver: userId, receiverModel: userModelType },
        { sender: userId, senderModel: userModelType } // Allows users to cancel their own requests
      ]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found or unauthorized" });
    }

    // ✅ Only the receiver can accept/reject (sender can only cancel)
    if (status !== "pending" && !(request.receiver.equals(userId) && request.receiverModel === userModelType)) {
      return res.status(403).json({ success: false, message: "Unauthorized to modify this request" });
    }

    // ✅ If the request is rejected or canceled, delete it
    if (status === "rejected" || status === "canceled") {
      await FriendRequest.findByIdAndDelete(requestId);
      return res.status(200).json({ success: true, message: `Request ${status} successfully` });
    }

    // ✅ If the request is accepted, update both users' friends list
    if (status === "accepted") {
      const senderModel = request.senderModel === "User" ? User : Recruiter;
const receiverModel = request.receiverModel === "User" ? User : Recruiter;

await Promise.all([
  senderModel.findByIdAndUpdate(request.sender, {
    $addToSet: { friends: { friendId: request.receiver, friendModel: request.receiverModel } }
  }),
  receiverModel.findByIdAndUpdate(request.receiver, {
    $addToSet: { friends: { friendId: request.sender, friendModel: request.senderModel } }
  })
]);

      // ✅ Remove the friend request after acceptance
      await FriendRequest.findByIdAndDelete(requestId);

      // ✅ Send notification to sender about acceptance
      const notification = await Notification.create({
        recipient: request.sender,
        recipientModel: request.senderModel,
        sender: userId,
        senderModel: userModelType,
        type: "friend_request_accepted",
        message: "Your friend request has been accepted!"
      });

      // ✅ Emit real-time notification
      const io = getIO();
      io.to(request.sender.toString()).emit("new_notification", notification);

      return res.status(200).json({ success: true, message: "Friend request accepted", data: request });
    }

    res.status(400).json({ success: false, message: "Invalid status update" });

  } catch (error) {
    console.error("Error in respondToRequest:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// Add this new controller to get filtered requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const userModelType = req.user.role;

    const requests = await FriendRequest.find({
      $or: [
        { receiver: userId, receiverModel: userModelType },
        { sender: userId, senderModel: userModelType }
      ]
    })
    .populate({
      path: 'sender',
      select: 'name profileImage',
      model: userModelType === 'User' ? User : Recruiter // ✅ Fix model selection
    })
    .populate({
      path: 'receiver',
      select: 'name profileImage',
      model: userModelType === 'User' ? User : Recruiter // ✅ Fix model selection
    })
    .sort({ createdAt: -1 })
    .lean();

    // Manual filtering to avoid Mongoose document issues
    const incoming = requests.filter(r => 
      r.receiver._id.toString() === userId.toString() &&
      r.receiverModel === userModelType
    );

    const outgoing = requests.filter(r => 
      r.sender._id.toString() === userId.toString() &&
      r.senderModel === userModelType
    );

    res.json({ 
      success: true,
      incoming,
      outgoing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




export const getRecommendations = async (req, res) => {
  try {
    const { userId, modelType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    // Get user model
    const userModel = modelType === "User" ? User : Recruiter;

    // Get user's friends list
    const user = await userModel.findById(userId).select("friends");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const friendsList = user.friends || [];

    // Aggregate recommendations
    const recommendations = await userModel.aggregate([
      {
        $match: {
          _id: { $nin: [userId, ...friendsList] }, // Exclude self & existing friends
          friends: { $in: friendsList } // Mutual friends
        }
      },
      { $project: { name: 1, profileImage: 1,role:1 } }, // Select relevant fields
      { $skip: skip },
      { $limit: limit }
    ]);

    res.status(200).json({
      success: true,
      data: recommendations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(recommendations.length / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};





const FRIENDS_PER_PAGE = 20;

export const getFriendList = async (req, res) => {
  try {
    const { userId, modelType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * FRIENDS_PER_PAGE;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get user model
    const userModel = modelType === 'User' ? User : Recruiter;
    
    // Single aggregation query for data + count
    const result = await userModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          metadata: [
            { $project: { totalFriends: { $size: "$friends" } } }
          ],
          data: [
            { $project: { friends: 1 } },
            { $unwind: "$friends" },
            { $skip: skip },
            { $limit: FRIENDS_PER_PAGE },
            {
              $lookup: {
                from: "users",
                let: { friendId: "$friends" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$friendId"] } } },
                  { $project: { name: 1, profileImage: 1, modelType: 1 } }
                ],
                as: "userFriend"
              }
            },
            {
              $lookup: {
                from: "hiringusers",
                let: { friendId: "$friends" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$friendId"] } } },
                  { $project: { name: 1, profileImage: 1, modelType: 1 } }
                ],
                as: "hiringFriend"
              }
            },
            {
              $replaceRoot: {
                newRoot: {
                  $cond: [
                    { $gt: [{ $size: "$userFriend" }, 0] },
                    { $arrayElemAt: ["$userFriend", 0] },
                    { $arrayElemAt: ["$hiringFriend", 0] }
                  ]
                }
              }
            },
            { $match: { name: { $exists: true } } }
          ]
        }
      },
      {
        $project: {
          friends: "$data",
          totalFriends: { $arrayElemAt: ["$metadata.totalFriends", 0] },
          totalPages: {
            $ceil: {
              $divide: [
                { $arrayElemAt: ["$metadata.totalFriends", 0] }, 
                FRIENDS_PER_PAGE
              ]
            }
          },
          currentPage: page
        }
      }
    ]);

    if (!result[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      friends: result[0].friends,
      pagination: {
        currentPage: result[0].currentPage,
        totalPages: result[0].totalPages,
        totalFriends: result[0].totalFriends
      }
    });
  } catch (error) {
    console.error('Error fetching friend list:', error);
    res.status(500).json({ 
      message: 'Failed to fetch friend list',
      details: error.message
    });
  }
};