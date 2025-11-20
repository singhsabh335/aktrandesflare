import express from 'express';
import { validateCoupon } from '../controllers/couponController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.post('/validate', authenticate, asyncHandler(validateCoupon));

export default router;

