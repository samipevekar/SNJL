import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import winston from 'winston';
import mongoose from 'mongoose';
// Create new post






const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'error.log' })],
});
export const createPost = async (req, res) => {
    try {
      const { caption } = req.body;
      const userId = req.user.id; // Authenticated user
      const role = req.user.role
      const file = req.file; // Uploaded files from frontend

      if (!file || file.length === 0) {
        return res.status(400).json({ success: false, message: "No media uploaded" });
      }
  

      // Upload file to Cloudinary
          const result = await uploadOnCloudinary(file.path, "auto");
          let uploadedMedia = {
            url: result.secure_url,
            mediaType: file.mimetype.startsWith("video")
              ? "video"
              : file.mimetype.startsWith("audio")
              ? "audio"
              : "image", // Default image
            publicId: result.public_id // Save publicId for deletion later
          };
      
  
      // Create new post
      const post = await Post.create({
        user: userId,
        userModel: role,
        media: uploadedMedia,
        caption
      });
  
      res.status(201).json({ success: true, post });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

// Like/unlike post
export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;
    const userRole = req.user.role;
    // console.log("Toggling like:", { userId, postId, userRole });

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Check if user has already liked (handles both structures)
    const isLiked = post.likes.some(like => {
      if (like.userId) return like.userId.toString() === userId; // New structure
      return like.toString() === userId; // Old structure
    });
    // console.log("Before update:", { isLiked, likes: post.likes });

    if (isLiked) {
      // Unlike: Remove the like
      post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { 
            likes: { userId: { $in: [userId] } } // New structure
          }
        },
        { new: true }
      );

      // If old ObjectId remains, remove it
      if (post.likes.some(like => like.toString && like.toString() === userId)) {
        post = await Post.findByIdAndUpdate(
          postId,
          { $pull: { likes: userId } }, // Old structure
          { new: true }
        );
      }
    } else {
      // Like: Ensure no duplicate by pulling first, then pushing
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { 
            likes: { userId: { $in: [userId] } } // Remove any existing new-structure like
          }
        }
      );
      post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { 
            likes: { 
              userId, 
              userModel: userRole 
            } 
          }
        },
        { new: true }
      );
    }

    // console.log("After update:", { likes: post.likes });

    res.status(200).json({ 
      success: true, 
      likes: post.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate('comments.user');
    const { text } = req.body;

    post.comments.push({
      user: req.user.id,
      userModel: req.user.role,
      text
    });

    await post.save();
    res.status(201).json({ success: true, comment: post.comments[post.comments.length-1] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get trending posts
export const getTrendingPosts = async (req, res) => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    const posts = await Post.aggregate([
      { $match: { createdAt: { $gte: threeDaysAgo } } },
      { $addFields: { likesCount: { $size: "$likes" } } },
      { $sort: { likesCount: -1 } },
      { $limit: 20 },
      { $project: { media: 1, caption: 1, likesCount: 1, commentsCount: { $size: "$comments" } } }
    ]);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get random posts
export const getRandomPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $sample: { size: 10 } },
      { $project: { media: 1, caption: 1, likesCount: { $size: "$likes" } } }
    ]);
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get friend posts
export const getFriendPosts = async (req, res) => {
  try {
    const user = await (req.user.role === 'User' ? User : Recruiter)
      .findById(req.user.id)
      .select('friends');

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    const posts = await Post.aggregate([
      { $match: { 
        user: { $in: user.friends },
        createdAt: { $gte: twoDaysAgo }
      }},
      { $sample: { size: 10 } },
      { $project: { media: 1, caption: 1, likesCount: { $size: "$likes" } } }
    ]);

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// delete post
export const deletePost = async (req,res)=>{
    try {
        const userId = req.user.id
        const postId = req.params.postId

        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({success:false, message:'Post not found'})

        if(userId.toString() === post.user.toString()){
            await Post.findByIdAndDelete(postId,{new:true})
        }else{
            return res.status(403).json({success:false, message:'You are not the owner of this post'})
        }

        res.status(200).json({messge:"post deleted successfully"})
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        console.log(error.message)
    }
}

// get own posts
// export const getPostById = async(req,res)=>{
//     try {
//         const userId = req.params.id

//         let ownPosts = await Post.find({user:userId})

//         res.status(200).json(ownPosts)

//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//         console.log("Error in getOwnPosts controller",error.message)
//     }
// }


export const getPostById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    console.log("djj",userId)
    const { offset = 0, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    
    // Validate query parameters
    if (isNaN(Number(offset)) || isNaN(Number(limit))) {
      return res.status(400).json({ success: false, error: 'Offset and limit must be numbers' });
    }
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Sort order must be asc or desc' });
    }

    // Define sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Fetch posts with pagination, sorting, and selected fields
    const ownPosts = await Post.find({ user: userId })
      // .select('content image likes comments isSaved createdAt -_id') // Exclude unnecessary fields
      .skip(Number(offset))
      .limit(Number(limit))
      .sort(sortOptions)
      .lean(); // Return plain JavaScript objects for better performance
console.log("ownasbjb",ownPosts)
    // Check if there are more posts for pagination
    const totalPosts = await Post.countDocuments({ user: userId });
    const nextOffset = Number(offset) + Number(limit) < totalPosts ? Number(offset) + Number(limit) : null;

    // Return 404 if no posts found
    if (ownPosts.length === 0) {
      return res.status(404).json({ success: false, error: 'No posts found for this user' });
    }

    const response = {
      success: true,
      posts: ownPosts,
      nextOffset,
      total: totalPosts,
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error in getPostById controller:', { message: error.message, stack: error.stack }); // Structured logging
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
const getUserByRole = async (userId, role) => {
  console.log("role",role)
  const Model = role === 'Recruiter' ? Recruiter : User;
  console.log("Model",Model)
  const user = await Model.findById(userId);
 
  return user;
};


// Toggle Save Post (Save or Unsave)
export const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // From auth middleware
    const userRole = req.user.role; // 'User' or 'Recruiter'

    // Validate post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    // Dynamically fetch user based on role
    const user = await getUserByRole(userId, userRole);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check if post is already saved
    const isSaved = user.savedPosts.includes(postId);

    if (isSaved) {
      // Unsave: Remove postId from savedPosts
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    } else {
      // Save: Add postId to savedPosts
      user.savedPosts.push(postId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isSaved ? 'Post unsaved' : 'Post saved',
      isSaved: !isSaved
    });
  } catch (error) {
    console.error('Error toggling save post:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get Saved Posts
export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 10 } = req.query;
    console.log("page", page, userId, userRole, limit);

    const user = await getUserByRole(userId, userRole);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const modelMap = {
      'User': User,
      'Recruiter': Recruiter
    };

    // Populate savedPosts with userModel and likesModel for accurate resolution
    await user.populate({
      path: 'savedPosts',
      select: 'user media caption likes comments createdAt userModel likesModel',
      options: {
        sort: { createdAt: -1 },
        skip: (page - 1) * limit,
        limit: parseInt(limit)
      }
    });

    // Debug data to identify invalid userModel values
    console.log("Saved Posts:", user.savedPosts.map(post => ({
      _id: post._id,
      userModel: post.userModel,
      likesModel: post.likesModel,
      comments: post.comments.map(c => ({ userModel: c.userModel }))
    })));

    // Nested population with proper model resolution
    await Promise.all([
      Post.populate(user.savedPosts, {
        path: 'user',
        select: 'name username profileImage',
        model: doc => modelMap[doc.userModel] || User // Fallback to User
      }),
      Post.populate(user.savedPosts, {
        path: 'likes',
        select: 'name',
        model: doc => modelMap[doc.likesModel] || User // Fallback to User
      }),
      Post.populate(user.savedPosts, {
        path: 'comments.user',
        select: 'name username',
        model: comment => modelMap[comment.userModel] || User // Fallback to User
      })
    ]);

    const totalSavedPosts = user.savedPosts.length;
    const savedPosts = user.savedPosts;

    res.status(200).json({
      success: true,
      savedPosts,
      total: totalSavedPosts,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalSavedPosts / limit)
    });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
