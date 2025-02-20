// models/ratingModel.js
import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  // Who gave the rating
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'raterModel'
  },
  // Who received the rating
  ratedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel'
  },
  // To distinguish between user and recruiter
  raterModel: {
    type: String,
    required: true,
    enum: ['User', 'Recruiter']
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['User', 'Recruiter']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Prevent multiple ratings for the same user pair
ratingSchema.index({ ratedBy: 1, ratedTo: 1 }, { unique: true });

export default mongoose.model('Rating', ratingSchema);
