import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  [
    body('post_id').isMongoId().withMessage('Invalid post ID'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 2000 })
      .withMessage('Content max 2000 characters'),
    body('parent_id')
      .optional()
      .isMongoId()
      .withMessage('Invalid parent comment ID'),
  ],
  validate,
  createComment
);

router.get(
  '/',
  [
    query('post_id').isMongoId().withMessage('Invalid post ID'),
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
  getCommentsByPost
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid comment ID')],
  validate,
  getCommentById
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid comment ID'),
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 2000 })
      .withMessage('Content max 2000 characters'),
  ],
  validate,
  updateComment
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid comment ID')],
  validate,
  deleteComment
);

export default router;
