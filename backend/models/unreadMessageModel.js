import mongoose from 'mongoose';

const unreadMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'toModel' }, // Recipient ID
  toModel: { type: String, enum: ['User', 'Recruiter'], required: true }, // Recipient model type
  from: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'fromModel' }, // Sender ID
  fromModel: { type: String, enum: ['User', 'Recruiter'], required: true }, // Sender model type
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for efficient lookups by recipient and sender
unreadMessageSchema.index({ user: 1, toModel: 1, from: 1, fromModel: 1, messageId: 1 });

export default mongoose.model('UnreadMessage', unreadMessageSchema);