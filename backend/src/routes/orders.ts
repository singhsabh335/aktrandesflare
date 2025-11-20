import express from 'express';
import {
  createOrder,
  verifyPayment,
  getOrders,
  getOrder,
  trackOrder,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.use(authenticate);

router.post('/', asyncHandler(createOrder));
router.post('/verify', asyncHandler(verifyPayment));
router.get('/', asyncHandler(getOrders));
router.get('/:id', asyncHandler(getOrder));
router.get('/:id/track', asyncHandler(trackOrder));

export default router;

