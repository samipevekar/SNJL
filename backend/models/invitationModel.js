import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel', index: true },
  senderModel: { type: String, enum: ['User', 'Recruiter'], required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel', index: true },
  receiverModel: { type: String, enum: ['User', 'Recruiter'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

invitationSchema.index({ sender: 1, receiver: 1, status: 1 });

export default mongoose.model('Invitation', invitationSchema);