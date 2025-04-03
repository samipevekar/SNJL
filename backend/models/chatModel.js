import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "senderType"
    },
    senderType: { 
        type: String, 
        enum: ["User", "Recruiter"] 
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: "receiverType" 
    },
    receiverType: { 
        type: String,
        enum: ["User", "Recruiter"]
    },
    message: {
        type: String,
    },
    media: {
    type: String, // URL of the uploaded media on Cloudinary
    required: false,
  },
  mediaType: {
    type: String, // Type of media (e.g., 'image', 'pdf', 'doc', 'video')
    required: false,
    enum: ['image', 'pdf', 'doc', 'video', 'audio', 'other'],
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent',
  },
},{timestamps:true});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat
