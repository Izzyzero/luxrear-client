import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'misinformation',
        'inappropriate_content',
        'scam',
        'other',
      ],
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    is_resolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

reportSchema.index({ is_resolved: 1, created_at: -1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
