import { Router } from 'express';
import { body, query } from 'express-validator';
import { toggleReaction, getReactions } from '../controllers/reactionController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.post(
  '/',
  protect,
  [
    body('type')
      .isIn(['like', 'love', 'insightful', 'support'])
      .withMessage('Type must be: like, love, insightful, or support'),
    body('post_id')
      .optional()
      .isMongoId()
      .withMessage('Invalid post ID'),
    body('comment_id')
      .optional()
      .isMongoId()
      .withMessage('Invalid comment ID'),
  ],
  validate,
  toggleReaction
);

router.get(
  '/',
  [
    query('post_id')
      .optional()
      .isMongoId()
      .withMessage('Invalid post ID'),
    query('comment_id')
      .optional()
      .isMongoId()
      .withMessage('Invalid comment ID'),
  ],
  validate,
  getReactions
);

export default router;
