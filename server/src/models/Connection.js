import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    requester_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Prevent duplicate connection requests
connectionSchema.index(
  { requester_id: 1, receiver_id: 1 },
  { unique: true }
);
connectionSchema.index({ receiver_id: 1, status: 1 });

const Connection = mongoose.model('Connection', connectionSchema);
export default Connection;
