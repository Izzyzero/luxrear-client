import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    business_name: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    profile_picture: {
      type: String, // Cloudinary URL
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    industry: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    // Diaspora-specific fields
    origin_country: {
      type: String,
      trim: true,
    },
    current_country: {
      type: String,
      trim: true,
    },
    show_in_diaspora: {
      type: Boolean,
      default: false,
    },
    // Social / contact
    website: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    whatsapp: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Index for diaspora listing queries
profileSchema.index({ show_in_diaspora: 1, current_country: 1 });
profileSchema.index({ industry: 1 });

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
