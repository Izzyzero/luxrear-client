import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  uploadPostImage,
  getMyPosts,
} from '../controllers/postController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { uploadPostImage as uploadMiddleware } from '../middleware/upload.js';
import validate from '../middleware/validate.js';
import { POST_TYPES } from '../models/Post.js';

const router = Router();

// ── All post routes require authentication ──
router.use(protect);

// ── My Posts ──────────────────────────────────

// GET /api/posts/my
router.get(
  '/my',
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
  getMyPosts
);

// ── Post Image Upload ──────────────────────────

// POST /api/posts/:id/image
router.post(
  '/:id/image',
  [param('id').isMongoId().withMessage('Invalid post ID')],
  validate,
  uploadMiddleware,
  uploadPostImage
);

// ── CRUD ───────────────────────────────────────

// POST /api/posts
router.post(
  '/',
  [
    body('type')
      .isIn(POST_TYPES)
      .withMessage(`Type must be one of: ${POST_TYPES.join(', ')}`),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title max 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description max 5000 characters'),
    body('category_id')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('video_url')
      .optional()
      .trim()
      .isURL()
      .withMessage('Video URL must be a valid URL'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location max 100 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
  ],
  validate,
  createPost
);

// GET /api/posts
router.get(
  '/',
  optionalAuth,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('featured')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Featured must be true or false'),
  ],
  validate,
  getAllPosts
);

// GET /api/posts/:id
router.get(
  '/:id',
  optionalAuth,
  [param('id').isMongoId().withMessage('Invalid post ID')],
  validate,
  getPostById
);

// PUT /api/posts/:id
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid post ID'),
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Title max 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description max 5000 characters'),
    body('category_id')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('video_url')
      .optional()
      .trim()
      .isURL()
      .withMessage('Video URL must be a valid URL'),
    body('location')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Location max 100 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
  ],
  validate,
  updatePost
);

// DELETE /api/posts/:id
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid post ID')],
  validate,
  deletePost
);

export default router;