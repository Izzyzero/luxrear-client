import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProfiles,
      totalPosts,
      totalComments,
      totalReports,
      pendingReports,
      verifiedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Profile.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Report.countDocuments(),
      Report.countDocuments({ is_resolved: false }),
      User.countDocuments({ is_verified: true }),
    ]);

    return successResponse(res, 200, 'Dashboard stats fetched.', {
      stats: {
        totalUsers,
        totalProfiles,
        totalPosts,
        totalComments,
        totalReports,
        pendingReports,
        verifiedUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, is_verified, is_banned, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (is_verified === 'true') filter.is_verified = true;
    if (is_verified === 'false') filter.is_verified = false;
    if (is_banned === 'true') filter.is_banned = true;
    if (is_banned === 'false') filter.is_banned = false;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    const userIds = users.map((u) => u._id);
    const profiles = await Profile.find({ user_id: { $in: userIds } });
    const profileMap = {};
    for (const p of profiles) {
      profileMap[p.user_id.toString()] = p;
    }

    const data = users.map((user) => {
      const u = user.toObject();
      const profile = profileMap[user._id.toString()] || null;
      return { ...u, profile };
    });

    return paginatedResponse(res, 'Users fetched.', data, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserBan = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    if (user.role === 'admin') {
      return errorResponse(res, 403, 'Cannot ban another admin.');
    }

    user.is_banned = !user.is_banned;
    await user.save();

    return successResponse(res, 200, user.is_banned ? 'User banned.' : 'User unbanned.', {
      user: { _id: user._id, is_banned: user.is_banned },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserVerify = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    user.is_verified = !user.is_verified;
    await user.save();

    return successResponse(res, 200, user.is_verified ? 'User verified.' : 'User unverified.', {
      user: { _id: user._id, is_verified: user.is_verified },
    });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, is_flagged, is_featured, type, search } = req.query;

    const filter = {};
    if (is_flagged === 'true') filter.is_flagged = true;
    if (is_flagged === 'false') filter.is_flagged = false;
    if (is_featured === 'true') filter.is_featured = true;
    if (is_featured === 'false') filter.is_featured = false;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('profile_id', 'full_name business_name profile_picture'),
      Post.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    return paginatedResponse(res, 'Posts fetched.', posts, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

export const togglePostFlag = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    post.is_flagged = !post.is_flagged;
    await post.save();

    return successResponse(res, 200, post.is_flagged ? 'Post flagged.' : 'Post unflagged.', {
      post: { _id: post._id, is_flagged: post.is_flagged },
    });
  } catch (error) {
    next(error);
  }
};

export const togglePostFeature = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    post.is_featured = !post.is_featured;
    await post.save();

    return successResponse(res, 200, post.is_featured ? 'Post featured.' : 'Post unfeatured.', {
      post: { _id: post._id, is_featured: post.is_featured },
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    return successResponse(res, 200, 'Post deleted by admin.');
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, is_resolved } = req.query;

    const filter = {};
    if (is_resolved === 'true') filter.is_resolved = true;
    if (is_resolved === 'false') filter.is_resolved = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('profile_id', 'full_name business_name')
        .populate('post_id', 'title type is_flagged')
        .populate('comment_id', 'content is_flagged'),
      Report.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    return paginatedResponse(res, 'Reports fetched.', reports, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { is_resolved: true },
      { new: true }
    );

    if (!report) {
      return errorResponse(res, 404, 'Report not found.');
    }

    return successResponse(res, 200, 'Report resolved.', { report });
  } catch (error) {
    next(error);
  }
};
