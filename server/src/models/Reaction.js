import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    // Either post_id OR comment_id — not both (validated below)
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
    type: {
      type: String,
      enum: ['like', 'love', 'insightful', 'support'],
      default: 'like',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Enforce: either post_id or comment_id, not both, not neither
reactionSchema.pre('validate', function (next) {
  if (!this.post_id && !this.comment_id) {
    return next(new Error('Either post_id or comment_id is required'));
  }
  if (this.post_id && this.comment_id) {
    return next(new Error('Cannot react to both a post and a comment at once'));
  }
  next();
});

// One reaction per user per target
reactionSchema.index(
  { post_id: 1, profile_id: 1 },
  { unique: true, sparse: true }
);
reactionSchema.index(
  { comment_id: 1, profile_id: 1 },
  { unique: true, partialFilterExpression: { comment_id: { $type: 'objectId' } } }
);

const Reaction = mongoose.model('Reaction', reactionSchema);
export default Reaction;
