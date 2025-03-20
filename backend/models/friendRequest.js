import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "senderModel",
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ["User", "Recruiter"]
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "receiverModel",
    required: true
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ["User", "Recruiter"]
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Optimized querying
  }
});

// Indexes for faster queries
friendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });
friendRequestSchema.index({ status: 1 });

export default mongoose.model("FriendRequest", friendRequestSchema);