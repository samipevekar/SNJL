import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel', index: true },
  senderModel: { type: String, enum: ['User', 'Recruiter'], required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel', index: true },
  receiverModel: { type: String, enum: ['User', 'Recruiter'], required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'seen'], default: 'unread' },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

messageSchema.index({ sender: 1, receiver: 1, senderModel: 1, receiverModel: 1, timestamp: -1 });

export default mongoose.model('Message', messageSchema);