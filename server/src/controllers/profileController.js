import Profile from '../models/Profile.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

// ─────────────────────────────────────────────
// GET /api/profiles/me
// ─────────────────────────────────────────────
export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id });

    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    return successResponse(res, 200, 'Profile fetched.', { profile });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PUT /api/profiles/me
// ─────────────────────────────────────────────
export const updateMyProfile = async (req, res, next) => {
  try {
    const {
      full_name,
      business_name,
      description,
      industry,
      location,
      services,
      origin_country,
      current_country,
      show_in_diaspora,
      website,
      linkedin,
      whatsapp,
    } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      {
        ...(full_name !== undefined && { full_name }),
        ...(business_name !== undefined && { business_name }),
        ...(description !== undefined && { description }),
        ...(industry !== undefined && { industry }),
        ...(location !== undefined && { location }),
        ...(services !== undefined && { services }),
        ...(origin_country !== undefined && { origin_country }),
        ...(current_country !== undefined && { current_country }),
        ...(show_in_diaspora !== undefined && { show_in_diaspora }),
        ...(website !== undefined && { website }),
        ...(linkedin !== undefined && { linkedin }),
        ...(whatsapp !== undefined && { whatsapp }),
      },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    return successResponse(res, 200, 'Profile updated.', { profile });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/profiles/me/picture
// ─────────────────────────────────────────────
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No image file provided.');
    }

    // Upload buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'luxrear/profiles',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });

    // Save Cloudinary URL to profile
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      { profile_picture: result.secure_url },
      { new: true }
    );

    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    return successResponse(res, 200, 'Profile picture uploaded.', {
      profile_picture: result.secure_url,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/profiles/:id
// ─────────────────────────────────────────────
export const getProfileById = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    return successResponse(res, 200, 'Profile fetched.', { profile });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/profiles
// Query params: ?industry=Tech&country=Nigeria&page=1&limit=20
// ─────────────────────────────────────────────
export const getAllProfiles = async (req, res, next) => {
  try {
    const { industry, country, diaspora, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (industry) filter.industry = { $regex: industry, $options: 'i' };
    if (country) filter.location = { $regex: country, $options: 'i' };
    if (diaspora === 'true') filter.show_in_diaspora = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [profiles, total] = await Promise.all([
      Profile.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Profile.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    return paginatedResponse(res, 'Profiles fetched.', profiles, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/profiles/me/picture
// ─────────────────────────────────────────────
export const removeProfilePicture = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      { profile_picture: null },
      { new: true }
    );

    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    return successResponse(res, 200, 'Profile picture removed.', { profile });
  } catch (error) {
    next(error);
  }
};
