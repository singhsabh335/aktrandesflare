import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserStatus,
  createCoupon,
  getAllCoupons,
  getSalesReport,
  getTopProducts,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

// Products
router.get('/products', asyncHandler(getAllProducts));
router.post('/products', asyncHandler(createProduct));
router.put('/products/:id', asyncHandler(updateProduct));
router.delete('/products/:id', asyncHandler(deleteProduct));

// Orders
router.get('/orders', asyncHandler(getAllOrders));
router.put('/orders/:id/status', asyncHandler(updateOrderStatus));

// Users
router.get('/users', asyncHandler(getAllUsers));
router.put('/users/:id/status', asyncHandler(updateUserStatus));

// Coupons
router.get('/coupons', asyncHandler(getAllCoupons));
router.post('/coupons', asyncHandler(createCoupon));

// Reports
router.get('/reports/sales', asyncHandler(getSalesReport));
router.get('/reports/top-products', asyncHandler(getTopProducts));

export default router;

