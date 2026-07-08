import Post from '../models/Post.js';
import Profile from '../models/Profile.js';
import Reaction from '../models/Reaction.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

// ─────────────────────────────────────────────
// POST /api/posts
// Create a new post
// ─────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { type, title, description, category_id, video_url, location, tags } = req.body;

    // Get the user's profile
    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found. Please complete your profile first.');
    }

    const post = await Post.create({
      profile_id: profile._id,
      category_id: category_id || null,
      type,
      title,
      description: description || '',
      video_url: video_url || null,
      location: location || null,
      tags: tags || [],
    });

    // Populate profile info for the response
    await post.populate('profile_id', 'full_name business_name profile_picture');
    await post.populate('category_id', 'name slug type');

    return successResponse(res, 201, 'Post created.', { post });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/posts
// Get all posts with pagination and filters
// Query: ?page=1&limit=20&type=OPPORTUNITY&category=slug&tags=ai,tech&location=Lagos&search=keyword
// ─────────────────────────────────────────────
export const getAllPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      tags,
      location,
      search,
      featured,
    } = req.query;

    // Build filter
    const filter = {};

    if (type) {
      // Support multiple types: ?type=OPPORTUNITY,ANNOUNCEMENT
      const types = type.split(',').map(t => t.trim().toUpperCase());
      if (types.length === 1) {
        filter.type = types[0];
      } else {
        filter.type = { $in: types };
      }
    }

    if (category) {
      // Look up category by slug
      const Category = (await import('../models/Category.js')).default;
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.category_id = cat._id;
      }
    }

    if (tags) {
      // Support multiple tags: ?tags=ai,tech,startup
      const tagList = tags.split(',').map(t => t.trim().toLowerCase());
      filter.tags = { $all: tagList };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (featured === 'true') {
      filter.is_featured = true;
    }

    // Don't show flagged posts in the feed
    filter.is_flagged = { $ne: true };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ is_featured: -1, created_at: -1 }) // Featured posts first, then newest
        .skip(skip)
        .limit(parseInt(limit))
        .populate('profile_id', 'full_name business_name profile_picture')
        .populate('category_id', 'name slug type'),
      Post.countDocuments(filter),
    ]);

    // Attach the current user's reaction per post so the frontend doesn't
    // need a second API call per post — fixes likes disappearing on navigation.
    if (req.user && posts.length > 0) {
      const profile = await Profile.findOne({ user_id: req.user._id });
      if (profile) {
        const postIds = posts.map(p => p._id);
        const userReactions = await Reaction.find({
          post_id: { $in: postIds },
          profile_id: profile._id,
        });
        const reactionMap = {};
        for (const r of userReactions) {
          reactionMap[r.post_id.toString()] = r.type;
        }
        for (const post of posts) {
          post._doc.my_reaction = reactionMap[post._id.toString()] || null;
        }
      }
    }

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

// ─────────────────────────────────────────────
// GET /api/posts/:id
// Get a single post by ID
// ─────────────────────────────────────────────
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('profile_id', 'full_name business_name profile_picture')
      .populate('category_id', 'name slug type');

    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    // Attach the current user's reaction if authenticated
    if (req.user) {
      const profile = await Profile.findOne({ user_id: req.user._id });
      if (profile) {
        const reaction = await Reaction.findOne({
          post_id: post._id,
          profile_id: profile._id,
        });
        post._doc.my_reaction = reaction ? reaction.type : null;
      }
    }

    return successResponse(res, 200, 'Post fetched.', { post });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// PUT /api/posts/:id
// Update a post (only the owner)
// ─────────────────────────────────────────────
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    // Check ownership — get user's profile
    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile || post.profile_id.toString() !== profile._id.toString()) {
      return errorResponse(res, 403, 'You can only edit your own posts.');
    }

    const { title, description, category_id, video_url, location, tags } = req.body;

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category_id !== undefined && { category_id }),
        ...(video_url !== undefined && { video_url }),
        ...(location !== undefined && { location }),
        ...(tags !== undefined && { tags }),
      },
      { new: true, runValidators: true }
    )
      .populate('profile_id', 'full_name business_name profile_picture')
      .populate('category_id', 'name slug type');

    return successResponse(res, 200, 'Post updated.', { post: updatedPost });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/posts/:id
// Delete a post (only the owner)
// ─────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    // Check ownership
    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile || post.profile_id.toString() !== profile._id.toString()) {
      return errorResponse(res, 403, 'You can only delete your own posts.');
    }

    await Post.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Post deleted.');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// POST /api/posts/:id/image
// Upload an image to a post
// ─────────────────────────────────────────────
export const uploadPostImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'No image file provided.');
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    // Check ownership
    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile || post.profile_id.toString() !== profile._id.toString()) {
      return errorResponse(res, 403, 'You can only upload images to your own posts.');
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'luxrear/posts',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto' },
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    });

    post.image_url = result.secure_url;
    await post.save();

    return successResponse(res, 200, 'Post image uploaded.', {
      image_url: result.secure_url,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// GET /api/posts/my
// Get current user's posts
// ─────────────────────────────────────────────
export const getMyPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    const filter = { profile_id: profile._id };
    if (type) {
      const types = type.split(',').map(t => t.trim().toUpperCase());
      if (types.length === 1) {
        filter.type = types[0];
      } else {
        filter.type = { $in: types };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category_id', 'name slug type'),
      Post.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    return paginatedResponse(res, 'My posts fetched.', posts, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
    });
  } catch (error) {
    next(error);
  }
};