import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  sendConnectionRequest,
  respondToRequest,
  getMyConnections,
  getPendingRequests,
  removeConnection,
} from '../controllers/connectionController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.use(protect);

router.post(
  '/',
  [
    body('receiver_id')
      .isMongoId()
      .withMessage('Valid receiver profile ID is required'),
  ],
  validate,
  sendConnectionRequest
);

router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['pending', 'accepted', 'rejected', 'blocked'])
      .withMessage('Invalid status filter'),
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
  getMyConnections
);

router.get(
  '/pending',
  getPendingRequests
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid connection ID'),
    body('status')
      .isIn(['accepted', 'rejected'])
      .withMessage('Status must be accepted or rejected'),
  ],
  validate,
  respondToRequest
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid connection ID')],
  validate,
  removeConnection
);

export default router;
