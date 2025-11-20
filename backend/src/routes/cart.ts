import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(getCart));
router.post('/', asyncHandler(addToCart));
router.put('/', asyncHandler(updateCartItem));
router.delete('/', asyncHandler(removeFromCart));
router.delete('/clear', asyncHandler(clearCart));

export default router;

