import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // For nested replies (one level deep only)
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    is_flagged: {
      type: Boolean,
      default: false,
    },
    reaction_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

commentSchema.index({ post_id: 1, created_at: 1 });
commentSchema.index({ profile_id: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
