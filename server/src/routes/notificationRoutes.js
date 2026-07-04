import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('unread')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Unread must be true or false'),
  ],
  validate,
  getMyNotifications
);

router.patch(
  '/read-all',
  markAllAsRead
);

router.patch(
  '/:id/read',
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  validate,
  markAsRead
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid notification ID')],
  validate,
  deleteNotification
);

export default router;
