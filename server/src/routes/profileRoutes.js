import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  removeProfilePicture,
  getProfileById,
  getAllProfiles,
} from '../controllers/profileController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { uploadProfilePicture as uploadMiddleware } from '../middleware/upload.js';
import validate from '../middleware/validate.js';

const router = Router();

// ── All profile routes require authentication ──
router.use(protect);

// ── Own profile ──────────────────────────────

// GET /api/profiles/me
router.get('/me', getMyProfile);

// PUT /api/profiles/me
router.put(
  '/me',
  [
    body('full_name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Full name cannot be empty')
      .isLength({ max: 100 })
      .withMessage('Full name max 100 characters'),
    body('business_name')
      .optional()
      .trim()
      .isLength({ max: 150 })
      .withMessage('Business name max 150 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description max 1000 characters'),
    body('services')
      .optional()
      .isArray()
      .withMessage('Services must be an array'),
    body('show_in_diaspora')
      .optional()
      .isBoolean()
      .withMessage('show_in_diaspora must be true or false'),
    body('website')
      .optional()
      .trim()
      .isURL()
      .withMessage('Invalid website URL'),
  ],
  validate,
  updateMyProfile
);

// POST /api/profiles/me/picture
router.post('/me/picture', uploadMiddleware, uploadProfilePicture);

// DELETE /api/profiles/me/picture
router.delete('/me/picture', removeProfilePicture);

// ── Browse profiles ───────────────────────────

// GET /api/profiles?industry=Tech&country=Nigeria&diaspora=true&page=1&limit=20
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
    query('diaspora')
      .optional()
      .isIn(['true', 'false'])
      .withMessage('Diaspora must be true or false'),
  ],
  validate,
  getAllProfiles
);

// GET /api/profiles/:id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid profile ID')],
  validate,
  getProfileById
);

export default router;
