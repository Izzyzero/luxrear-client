import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'new_opportunity',
        'post_comment',
        'comment_reply',
        'post_reaction',
        'connection_request',
        'connection_accepted',
        'member_verified',
        'post_featured',
        'system',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    // Generic reference — could be a post, comment, connection, etc.
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    reference_type: {
      type: String,
      enum: ['Post', 'Comment', 'Connection', 'Profile', null],
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
