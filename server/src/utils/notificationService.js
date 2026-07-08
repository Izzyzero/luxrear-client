import Notification from '../models/Notification.js';

export const createNotification = async ({ user_id, type, message, reference_id = null, reference_type = null }) => {
  try {
    if (!user_id) return null;

    const notification = await Notification.create({
      user_id,
      type,
      message,
      reference_id,
      reference_type,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};
