import FriendRequest from "../models/friendRequest.js";
import Notification from "../models/notificationModel.js";
import { getIO } from "../utils/socket.js";
import WorkerUser from "../models/workerUser.js"; // Import User model
import HiringUser from "../models/hiringUser.js"; // Import HiringUser model

export const sendFriendRequest = async (req, res) => {
  try {
    
    const senderId = req.user.id;// Get sender's id
    const receiverId = req.params.receiverId;// Get receiver's id
    const { senderModel, receiverModel } = req.body;

    // Prevent self-request
    if (senderId.toString() === receiverId.toString() && senderModel === receiverModel) {
      return res.status(400).json({ success: false, error: "Cannot send request to yourself" });
    }

    // Check existing request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Request already exists" });
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

    res.status(201).json(newRequest);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};


export const respondToRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id; // Current user's ID
    const userModelType = req.user.role; // From authentication middleware

    // Find the request with proper authorization
    const request = await FriendRequest.findOne({
      _id: requestId,
      $or: [
        { 
          receiver: userId,
          receiverModel: userModelType // Ensure model type matches
        },
        { 
          sender: userId,
          senderModel: userModelType // Allow users to cancel their own requests
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found or unauthorized" });
    }

    // Authorization check - only receiver can accept/reject
    if (status !== "pending" && 
        !(request.receiver.equals(userId) && request.receiverModel === userModelType)) {
      return res.status(403).json({success: false, error: "Unauthorized to modify this request" });
    }

    // Update request status
    request.status = status;
    await request.save();

    // If accepted, update both users' friend lists
    if (status === "accepted") {
      const senderModel = request.senderModel === "User" ? WorkerUser : HiringUser;
      const receiverModel = request.receiverModel === "User" ? WorkerUser : HiringUser;

      await Promise.all([
        senderModel.findByIdAndUpdate(request.sender, {
          $addToSet: { friends: request.receiver }
        }),
        receiverModel.findByIdAndUpdate(request.receiver, {
          $addToSet: { friends: request.sender }
        })
      ]);
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      model: userModelType === 'User' ? WorkerUser : HiringUser // ✅ Fix model selection
    })
    .populate({
      path: 'receiver',
      select: 'name profileImage',
      model: userModelType === 'User' ? WorkerUser : HiringUser // ✅ Fix model selection
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
    res.status(500).json({ error: error.message });
  }
};


export const getRecommendations = async (req, res) => {
  try {
    const { userId, modelType } = req.params;
    const userModel = modelType === "User" ? WorkerUser : HiringUser;

    // Get user's friends
    const user = await userModel.findById(userId).select("friends");
    
    // Get friends of friends
    const recommendations = await userModel.aggregate([
      { $match: { 
        _id: { $nin: [userId, ...user.friends] }, // Exclude self and existing friends
        friends: { $in: user.friends } // Mutual friends
      }},
      { $sample: { size: 10 } }, // Random 10 recommendations
      { $project: { name: 1, profileImage: 1 } }
    ]);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const userModel = modelType === 'User' ? User : HiringUser;
    
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
      error: 'Failed to fetch friend list',
      details: error.message
    });
  }
};