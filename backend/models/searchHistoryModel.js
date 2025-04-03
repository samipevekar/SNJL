// models/searchHistoryModel.js
import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true, // Index for faster queries
    refPath: "userType", // Dynamically reference the model based on userType
  },
  userType: {
    type: String,
    required: true,
    enum: ["User", "Recruiter"], // Restrict to valid model names
  },
  query: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SearchHistory", searchHistorySchema);