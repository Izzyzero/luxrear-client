import User from '../models/User.js';
import Profile from '../models/Profile.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateSecureToken,
  hashToken,
} from '../utils/jwt.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { email, phone, password, full_name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (existingUser) {
      return errorResponse(
        res,
        409,
        email && existingUser.email === email
          ? 'An account with this email already exists.'
          : 'An account with this phone number already exists.'
      );
    }

    // Generate email verification token
    const rawToken = generateSecureToken();
    const hashedToken = hashToken(rawToken);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Create user
    const user = await User.create({
      email,
      phone,
      password,
      email_verification_token: hashedToken,
      email_verification_expires: tokenExpiry,
    });

    // Create a minimal profile linked to this user
    await Profile.create({
      user_id: user._id,
      full_name,
    });

    // Send verification email (only if email provided)
    // Non-blocking in development — email config may not be set yet
    if (email) {
      sendVerificationEmail(email, rawToken).catch((err) => {
        console.warn('⚠️  Email sending failed (non-blocking):', err.message);
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token
    user.refresh_token = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 201, 'Account created. Please verify your email.', {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        onboarding_complete: user.onboarding_complete,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    // Find user by email or phone — explicitly select password
    const query = email ? { email } : { phone };
    const user = await User.findOne(query).select('+password +refresh_token');

    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 401, 'Invalid credentials.');
    }

    if (user.is_banned) {
      return errorResponse(res, 403, 'Your account has been suspended.');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store hashed refresh token
    user.refresh_token = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, 'Login successful.', {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_verified: user.is_verified,
        onboarding_complete: user.onboarding_complete,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return errorResponse(res, 400, 'Refresh token is required.');
    }

    // Verify the token signature
    const decoded = verifyRefreshToken(refresh_token);

    // Find user and check stored refresh token matches
    const user = await User.findById(decoded.id).select('+refresh_token');
    if (!user || user.refresh_token !== hashToken(refresh_token)) {
      return errorResponse(res, 401, 'Invalid or expired refresh token.');
    }

    // Issue new access token
    const accessToken = generateAccessToken(user._id);

    return successResponse(res, 200, 'Token refreshed.', {
      access_token: accessToken,
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return errorResponse(res, 401, 'Invalid or expired refresh token.');
    }
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    // Invalidate refresh token by clearing it
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refresh_token: 1 },
    });

    return successResponse(res, 200, 'Logged out successfully.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/verify-email?token=xxx
// ─────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = hashToken(req.query.token);

    const user = await User.findOne({
      email_verification_token: hashedToken,
      email_verification_expires: { $gt: Date.now() },
    }).select('+email_verification_token +email_verification_expires');

    if (!user) {
      return errorResponse(res, 400, 'Verification link is invalid or has expired.');
    }

    user.is_verified = true;
    user.email_verification_token = undefined;
    user.email_verification_expires = undefined;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, 200, 'Email verified successfully.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent user enumeration
    if (!user) {
      return successResponse(
        res,
        200,
        'If that email exists, a reset link has been sent.'
      );
    }

    const rawToken = generateSecureToken();
    user.password_reset_token = hashToken(rawToken);
    user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save({ validateBeforeSave: false });

    sendPasswordResetEmail(email, rawToken).catch((err) => {
      console.warn('⚠️  Email sending failed (non-blocking):', err.message);
    });

    return successResponse(
      res,
      200,
      'If that email exists, a reset link has been sent.'
    );
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/auth/reset-password
// ─────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = hashToken(token);

    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: Date.now() },
    }).select('+password_reset_token +password_reset_expires');

    if (!user) {
      return errorResponse(res, 400, 'Reset link is invalid or has expired.');
    }

    user.password = password;
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    user.refresh_token = undefined; // Invalidate all sessions
    await user.save();

    return successResponse(res, 200, 'Password reset successful. Please log in.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/auth/change-password  (authenticated)
// ─────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(current_password))) {
      return errorResponse(res, 401, 'Current password is incorrect.');
    }

    user.password = new_password;
    await user.save();

    return successResponse(res, 200, 'Password updated successfully.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/auth/onboarding  (authenticated)
// ─────────────────────────────────────────────
export const completeOnboarding = async (req, res, next) => {
  try {
    const { country, business_type, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { country, business_type, role, onboarding_complete: true },
      { new: true, runValidators: true }
    );

    return successResponse(res, 200, 'Onboarding complete.', {
      user: {
        id: user._id,
        role: user.role,
        country: user.country,
        business_type: user.business_type,
        onboarding_complete: user.onboarding_complete,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/auth/me  (authenticated)
// ─────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id });

    return successResponse(res, 200, 'Current user fetched.', {
      user: {
        id: req.user._id,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        country: req.user.country,
        business_type: req.user.business_type,
        is_verified: req.user.is_verified,
        onboarding_complete: req.user.onboarding_complete,
        created_at: req.user.created_at,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};
