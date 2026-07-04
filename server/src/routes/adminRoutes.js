import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  getDashboardStats,
  getUsers,
  toggleUserBan,
  toggleUserVerify,
  getPosts,
  togglePostFlag,
  togglePostFeature,
  deletePost,
  getReports,
  resolveReport,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getDashboardStats);

router.get(
  '/users',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  getUsers
);

router.patch(
  '/users/:id/ban',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  toggleUserBan
);

router.patch(
  '/users/:id/verify',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  toggleUserVerify
);

router.get(
  '/posts',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  getPosts
);

router.patch(
  '/posts/:id/flag',
  [param('id').isMongoId().withMessage('Invalid post ID')],
  validate,
  togglePostFlag
);

router.patch(
  '/posts/:id/feature',
  [param('id').isMongoId().withMessage('Invalid post ID')],
  validate,
  togglePostFeature
);

router.delete(
  '/posts/:id',
  [param('id').isMongoId().withMessage('Invalid post ID')],
  validate,
  deletePost
);

router.get(
  '/reports',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  getReports
);

router.patch(
  '/reports/:id/resolve',
  [param('id').isMongoId().withMessage('Invalid report ID')],
  validate,
  resolveReport
);

export default router;
