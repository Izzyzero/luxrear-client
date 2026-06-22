import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  completeOnboarding,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// ── Public routes ────────────────────────────

router.post(
  '/register',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone number'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
    body().custom((_, { req }) => {
      if (!req.body.email && !req.body.phone) {
        throw new Error('Either email or phone is required');
      }
      return true;
    }),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body().custom((_, { req }) => {
      if (!req.body.email && !req.body.phone) {
        throw new Error('Either email or phone is required');
      }
      return true;
    }),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/refresh',
  [body('refresh_token').notEmpty().withMessage('Refresh token is required')],
  validate,
  refreshAccessToken
);

router.get(
  '/verify-email',
  [query('token').notEmpty().withMessage('Verification token is required')],
  validate,
  verifyEmail
);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')],
  validate,
  forgotPassword
);

router.patch(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
  ],
  validate,
  resetPassword
);

// ── Protected routes ─────────────────────────

router.use(protect);

router.get('/me', getMe);

router.post('/logout', logout);

router.patch(
  '/change-password',
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain uppercase, lowercase, and a number'),
  ],
  validate,
  changePassword
);

router.patch(
  '/onboarding',
  [
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('business_type').trim().notEmpty().withMessage('Business type is required'),
    body('role')
      .isIn(['founder', 'investor', 'service_provider', 'student'])
      .withMessage('Invalid role'),
  ],
  validate,
  completeOnboarding
);

export default router;
