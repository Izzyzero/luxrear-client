import { Router } from 'express';
import { param, query } from 'express-validator';
import {
  getAllCategories,
  getCategoryById,
} from '../controllers/categoryController.js';
import { optionalAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// GET /api/categories
router.get(
  '/',
  optionalAuth,
  [
    query('type')
      .optional()
      .isIn(['community', 'learning', 'exchange'])
      .withMessage('Type must be community, learning, or exchange'),
  ],
  validate,
  getAllCategories
);

// GET /api/categories/:id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid category ID')],
  validate,
  getCategoryById
);

export default router;