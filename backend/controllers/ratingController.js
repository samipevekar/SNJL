
import Rating from '../models/ratingModel.js';
import User from '../models/userModel.js';
import Employer from '../models/recruiterModel.js';
import mongoose from 'mongoose';


export const createRating = async (req, res) => {
  try {
    const { ratedTo, rating, comment } = req.body;
    const ratedBy = req.user.id;

    
    if (ratedBy === ratedTo) {
      return res.status(400).json({
        success: false,
        message: "You cannot rate yourself",
      });
    }

  
    const rater = await User.findById(ratedBy) || await Employer.findById(ratedBy);
    const receiver = await User.findById(ratedTo) || await Employer.findById(ratedTo);

    if (!rater || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User to be rated not found",
      });
    }

    
    const raterModel = await User.findById(ratedBy) ? "User" : "Employer";
    const receiverModel = await User.findById(ratedTo) ? "User" : "Employer";

    if (raterModel === receiverModel) {
      return res.status(400).json({
        success: false,
        message: "You can only rate users of the opposite category (Users can rate Employers, and Employers can rate Users).",
      });
    }

    
    const ratingData = {
      ratedBy,
      ratedTo,
      raterModel,
      receiverModel,
      rating,
      comment,
    };

    
    const newRating = await Rating.findOneAndUpdate(
      { ratedBy, ratedTo },
      ratingData,
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      data: newRating,
    });

  } catch (error) {
    if (error.code === 11000) { 
      return res.status(400).json({
        success: false,
        message: "You have already rated this user",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};



// Get all ratings received by a user
export const getReceivedRatings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const ratings = await Rating.find({ ratedTo: userId })
      .populate('ratedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all ratings given by a user
export const getGivenRatings = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const ratings = await Rating.find({ ratedBy: userId })
      .populate('ratedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get average rating for a user
export const getAverageRating = async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await Rating.aggregate([
      { $match: { ratedTo: new mongoose.Types.ObjectId(userId) } }, // ✅ Proper instantiation
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    

    res.status(200).json({
      success: true,
      data: {
        averageRating: result[0]?.averageRating || 0,
        totalRatings: result[0]?.totalRatings || 0
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


