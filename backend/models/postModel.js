import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    required: true
  },
  userModel: {
    type: String,
    required: true,
    enum: ['User', 'Recruiter']
  },
  media: [{
    url: String,
    mediaType: {
      type: String,
      enum: ['image', 'video','audio']
    }
  }],
  caption: String,
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userModel: {
      type: String,
      enum: ['User', 'Recruiter'],
      required: true
    },_id: false
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'comments.userModel'
    },
    userModel: {
      type: String,
      enum: ['User', 'Recruiter']
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
 
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

postSchema.index({ createdAt: -1 });
postSchema.index({ likes: -1 });

export default mongoose.model('Post', postSchema);