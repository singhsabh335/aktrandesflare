import express from 'express';
import {
  createReview,
  getProductReviews,
  markHelpful,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.get('/product/:productId', asyncHandler(getProductReviews));
router.post('/', authenticate, asyncHandler(createReview));
router.post('/:reviewId/helpful', authenticate, asyncHandler(markHelpful));

export default router;

