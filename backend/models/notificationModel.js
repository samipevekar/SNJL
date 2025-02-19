import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "recipientModel",
    required: true
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ["User", "Recruiter"]
  },
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
  type: {
    type: String,
    enum: ["friend_request"],
    required: true
  },
  message: String,
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);