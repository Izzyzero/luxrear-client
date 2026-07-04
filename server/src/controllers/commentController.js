import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { createNotification } from '../utils/notificationService.js';

export const createComment = async (req, res, next) => {
  try {
    const { post_id, content, parent_id } = req.body;

    const post = await Post.findById(post_id);
    if (!post) {
      return errorResponse(res, 404, 'Post not found.');
    }

    if (parent_id) {
      const parent = await Comment.findById(parent_id);
      if (!parent) {
        return errorResponse(res, 404, 'Parent comment not found.');
      }
      if (parent.parent_id) {
        return errorResponse(res, 400, 'Replies can only be one level deep.');
      }
    }

    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found. Please complete your profile first.');
    }

    const comment = await Comment.create({
      post_id,
      profile_id: profile._id,
      content,
      parent_id: parent_id || null,
    });

    await Post.findByIdAndUpdate(post_id, { $inc: { comment_count: 1 } });

    await comment.populate('profile_id', 'full_name business_name profile_picture');

    // Notify post owner
    const postOwnerProfile = await Profile.findById(post.profile_id);
    if (postOwnerProfile && postOwnerProfile.user_id.toString() !== req.user._id.toString()) {
      const postOwner = await User.findById(postOwnerProfile.user_id);
      if (postOwner) {
        await createNotification({
          user_id: postOwner._id,
          type: parent_id ? 'comment_reply' : 'post_comment',
          message: `${profile.full_name || 'A member'} ${parent_id ? 'replied to a comment on' : 'commented on'} your post: "${post.title.substring(0, 50)}"`,
          reference_id: comment._id,
          reference_type: 'Comment',
        });
      }
    }

    return successResponse(res, 201, 'Comment created.', { comment });
  } catch (error) {
    next(error);
  }
};

export const getCommentsByPost = async (req, res, next) => {
  try {
    const { post_id, page = 1, limit = 20 } = req.query;

    if (!post_id) {
      return errorResponse(res, 400, 'post_id is required.');
    }

    const filter = { post_id, parent_id: null };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('profile_id', 'full_name business_name profile_picture'),
      Comment.countDocuments(filter),
    ]);

    const commentIds = comments.map((c) => c._id);
    const replies = await Comment.find({ parent_id: { $in: commentIds } })
      .sort({ created_at: 1 })
      .populate('profile_id', 'full_name business_name profile_picture');

    const repliesMap = {};
    for (const reply of replies) {
      const key = reply.parent_id.toString();
      if (!repliesMap[key]) repliesMap[key] = [];
      repliesMap[key].push(reply);
    }

    const data = comments.map((c) => ({
      ...c.toObject(),
      replies: repliesMap[c._id.toString()] || [],
    }));

    const pages = Math.ceil(total / parseInt(limit));

    return paginatedResponse(res, 'Comments fetched.', data, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentById = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('profile_id', 'full_name business_name profile_picture');

    if (!comment) {
      return errorResponse(res, 404, 'Comment not found.');
    }

    const replies = await Comment.find({ parent_id: comment._id })
      .sort({ created_at: 1 })
      .populate('profile_id', 'full_name business_name profile_picture');

    return successResponse(res, 200, 'Comment fetched.', {
      comment: { ...comment.toObject(), replies },
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return errorResponse(res, 404, 'Comment not found.');
    }

    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile || comment.profile_id.toString() !== profile._id.toString()) {
      return errorResponse(res, 403, 'You can only edit your own comments.');
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return errorResponse(res, 400, 'Content cannot be empty.');
    }

    comment.content = content;
    await comment.save();

    await comment.populate('profile_id', 'full_name business_name profile_picture');

    return successResponse(res, 200, 'Comment updated.', { comment });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return errorResponse(res, 404, 'Comment not found.');
    }

    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile || comment.profile_id.toString() !== profile._id.toString()) {
      return errorResponse(res, 403, 'You can only delete your own comments.');
    }

    const replyCount = await Comment.countDocuments({ parent_id: comment._id });

    await Comment.deleteMany({ parent_id: comment._id });
    await Comment.findByIdAndDelete(req.params.id);

    await Post.findByIdAndUpdate(comment.post_id, {
      $inc: { comment_count: -(1 + replyCount) },
    });

    return successResponse(res, 200, 'Comment deleted.');
  } catch (error) {
    next(error);
  }
};
