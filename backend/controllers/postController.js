import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Recruiter from '../models/recruiterModel.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// Create new post
export const createPost = async (req, res) => {
    try {
      const { caption } = req.body;
<<<<<<< HEAD
      const user = req.user; // Authenticated user
      const files = req.files; // Uploaded files from frontend
      console.log("files", files)
  
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: "No media uploaded" });
      }
  
      // Upload each file to Cloudinary
      const uploadedMedia = await Promise.all(
        files.map(async (file) => {
          const result = await uploadOnCloudinary(file.path, "auto");
          return {
            url: result.secure_url, 
            mediaType: file.mimetype.startsWith("video") ? "video" : "image",
            publicId: result.public_id // Save publicId for deletion later
          };
        })
      );
  
      // Create new post
      const post = await Post.create({
        user: user.id,
=======
      const userId = req.user.id; // Authenticated user
      const file = req.file; // Uploaded files from frontend

      if (!file || file.length === 0) {
        return res.status(400).json({ success: false, message: "No media uploaded" });
      }
  
      let user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found"})
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
>>>>>>> c4a33076ffea3ea32ee7263582d0720d45db6b97
        userModel: user.role,
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
<<<<<<< HEAD
    const post = await Post.findById(req.params.postId);
    const user = req.user;
    
    const likeIndex = post.likes.findIndex(id => id.equals(user.id));
    if (likeIndex === -1) {
      post.likes.push(user.id);
      post.likesModel = user.role;
    } else {
      post.likes.splice(likeIndex, 1);
    }
    
    await post.save();
    res.json({ success: true, likes: post.likes.length });
=======
    const postId = req.params.postId;
    const userId = req.user?.id;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true } // To return the updated document
      );
    } else {
      post = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } }, // $addToSet prevents duplicate entries
        { new: true }
      );
    }

    res.status(200).json({ success: true, likes: post.likes.length });
>>>>>>> c4a33076ffea3ea32ee7263582d0720d45db6b97
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add comment
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
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
<<<<<<< HEAD
};
=======
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
export const getPostById = async(req,res)=>{
    try {
        const userId = req.params.id

        let ownPosts = await Post.find({user:userId})

        res.status(200).json(ownPosts)

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
        console.log("Error in getOwnPosts controller",error.message)
    }
}
>>>>>>> c4a33076ffea3ea32ee7263582d0720d45db6b97
