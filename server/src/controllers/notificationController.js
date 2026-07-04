import Notification from '../models/Notification.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread } = req.query;

    const filter = { user_id: req.user._id };
    if (unread === 'true') filter.is_read = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ is_read: 1, created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user_id: req.user._id, is_read: false }),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    return paginatedResponse(res, 'Notifications fetched.', notifications, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found.');
    }

    notification.is_read = true;
    await notification.save();

    return successResponse(res, 200, 'Notification marked as read.', { notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { is_read: true }
    );

    return successResponse(res, 200, 'All notifications marked as read.');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found.');
    }

    return successResponse(res, 200, 'Notification deleted.');
  } catch (error) {
    next(error);
  }
};
