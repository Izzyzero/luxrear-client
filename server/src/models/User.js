import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true, // allows null (phone-only users)
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['founder', 'investor', 'service_provider', 'student', 'admin'],
      default: 'founder',
    },
    country: {
      type: String,
      trim: true,
    },
    business_type: {
      type: String,
      trim: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    is_banned: {
      type: Boolean,
      default: false,
    },
    // Email verification
    email_verification_token: {
      type: String,
      select: false,
    },
    email_verification_expires: {
      type: Date,
      select: false,
    },
    // Password reset
    password_reset_token: {
      type: String,
      select: false,
    },
    password_reset_expires: {
      type: Date,
      select: false,
    },
    // Onboarding
    onboarding_complete: {
      type: Boolean,
      default: false,
    },
    // Refresh token (stored hashed)
    refresh_token: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Validate: at least email or phone must be present
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone is required'));
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: check if password was changed after a JWT was issued
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (this.updated_at) {
    const changedAt = parseInt(this.updated_at.getTime() / 1000, 10);
    return jwtIssuedAt < changedAt;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;
