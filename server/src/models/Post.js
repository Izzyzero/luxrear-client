import mongoose from 'mongoose';

// Single collection powering: Feed, Exchange, Community,
// Learning, Diaspora Hub, and Support Board
const POST_TYPES = [
  // Home Feed
  'OPPORTUNITY',
  'UPDATE',
  'DEAL',
  'ANNOUNCEMENT',
  // Learning
  'LEARNING',
  // Business Exchange
  'NEED_HELP',
  'INVESTMENT',
  'PARTNERSHIP',
  'SUPPLIER_REQUEST',
  'BUSINESS_OFFER',
  'JOB',
  // Support Board
  'SUPPORT_REQUEST',
  // Diaspora Hub
  'DIASPORA_PARTNER',
  'DIASPORA_INVESTOR',
];

const postSchema = new mongoose.Schema(
  {
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    type: {
      type: String,
      enum: POST_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    // Media
    image_url: {
      type: String,
      default: null,
    },
    video_url: {
      type: String,
      default: null,
    },
    // Optional metadata
    location: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    // Moderation
    is_flagged: {
      type: Boolean,
      default: false,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    // Counters (denormalized for performance)
    comment_count: {
      type: Number,
      default: 0,
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

// Indexes for common query patterns
postSchema.index({ type: 1, created_at: -1 });
postSchema.index({ profile_id: 1, created_at: -1 });
postSchema.index({ category_id: 1, type: 1, created_at: -1 });
postSchema.index({ is_featured: 1, created_at: -1 });
postSchema.index({ is_flagged: 1 });
postSchema.index({ tags: 1 });

const Post = mongoose.model('Post', postSchema);
export { POST_TYPES };
export default Post;
