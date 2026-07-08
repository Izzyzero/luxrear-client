import Reaction from '../models/Reaction.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { createNotification } from '../utils/notificationService.js';

export const toggleReaction = async (req, res, next) => {
  try {
    const { post_id, comment_id, type } = req.body;

    if (!post_id && !comment_id) {
      return errorResponse(res, 400, 'Either post_id or comment_id is required.');
    }
    if (post_id && comment_id) {
      return errorResponse(res, 400, 'Cannot react to both a post and a comment at once.');
    }

    if (post_id) {
      const post = await Post.findById(post_id);
      if (!post) return errorResponse(res, 404, 'Post not found.');
    }
    if (comment_id) {
      const comment = await Comment.findById(comment_id);
      if (!comment) return errorResponse(res, 404, 'Comment not found.');
    }

    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile) {
      return errorResponse(res, 404, 'Profile not found.');
    }

    const filter = { profile_id: profile._id };
    if (post_id) filter.post_id = post_id;
    if (comment_id) filter.comment_id = comment_id;

    const existing = await Reaction.findOne(filter);

    if (existing) {
      if (existing.type === type) {
        await Reaction.findByIdAndDelete(existing._id);
        const target = post_id ? 'post' : 'comment';
        if (target === 'post') {
          await Post.findByIdAndUpdate(post_id, { $inc: { reaction_count: -1 } });
        }
        return successResponse(res, 200, 'Reaction removed.', { reacted: false });
      }
      existing.type = type;
      await existing.save();
      return successResponse(res, 200, 'Reaction updated.', { reacted: true, reaction: existing });
    }

    const reaction = await Reaction.create({
      post_id: post_id || null,
      comment_id: comment_id || null,
      profile_id: profile._id,
      type,
    });

    if (post_id) {
      await Post.findByIdAndUpdate(post_id, { $inc: { reaction_count: 1 } });

      // Notify post owner
      const post = await Post.findById(post_id);
      if (post) {
        const postOwnerProfile = await Profile.findById(post.profile_id);
        if (postOwnerProfile && postOwnerProfile.user_id.toString() !== req.user._id.toString()) {
          const postOwner = await User.findById(postOwnerProfile.user_id);
          if (postOwner) {
            await createNotification({
              user_id: postOwner._id,
              type: 'post_reaction',
              message: `${profile.full_name || 'A member'} reacted with ${type} to your post: "${post.title.substring(0, 50)}"`,
              reference_id: reaction._id,
              reference_type: 'Post',
            });
          }
        }
      }
    }

    if (comment_id) {
      const reactedComment = await Comment.findById(comment_id);
      if (reactedComment) {
        const commentOwnerProfile = await Profile.findById(reactedComment.profile_id);
        if (commentOwnerProfile && commentOwnerProfile.user_id.toString() !== req.user._id.toString()) {
          const commentOwner = await User.findById(commentOwnerProfile.user_id);
          if (commentOwner) {
            await createNotification({
              user_id: commentOwner._id,
              type: 'post_reaction',
              message: `${profile.full_name || 'A member'} reacted with ${type} to your comment.`,
              reference_id: reaction._id,
              reference_type: 'Comment',
            });
          }
        }
      }
    }

    return successResponse(res, 201, 'Reaction added.', { reacted: true, reaction });
  } catch (error) {
    next(error);
  }
};

export const getReactions = async (req, res, next) => {
  try {
    const { post_id, comment_id } = req.query;

    if (!post_id && !comment_id) {
      return errorResponse(res, 400, 'Either post_id or comment_id query param is required.');
    }

    const filter = {};
    if (post_id) filter.post_id = post_id;
    if (comment_id) filter.comment_id = comment_id;

    const reactions = await Reaction.find(filter)
      .populate('profile_id', 'full_name business_name profile_picture');

    const counts = {};
    for (const r of reactions) {
      counts[r.type] = (counts[r.type] || 0) + 1;
    }

    return successResponse(res, 200, 'Reactions fetched.', {
      reactions,
      counts,
      total: reactions.length,
    });
  } catch (error) {
    next(error);
  }
};
