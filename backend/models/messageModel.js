import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel', index: true },
  senderModel: { type: String, enum: ['User', 'Recruiter'], required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel', index: true },
  receiverModel: { type: String, enum: ['User', 'Recruiter'], required: true },
  message: { type: String, required: false, default:'' },
  media: {
    type: String, // URL of the uploaded media on Cloudinary
    required: false,
  },
  mediaType: {
    type: String, // Type of media (e.g., 'image', 'pdf', 'doc', 'video')
    required: false,
    enum: ['image', 'pdf', 'doc', 'video', 'audio', 'other'],
  },
  status: { type: String, enum: ['unread', 'seen'], default: 'unread' },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

messageSchema.index({ sender: 1, receiver: 1, senderModel: 1, receiverModel: 1, timestamp: -1 });

export default mongoose.model('Message', messageSchema);