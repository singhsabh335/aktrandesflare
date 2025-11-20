import express from 'express';
import {
  searchProducts,
  getProduct,
  getProductBySlug,
  getCategories,
  getBrands,
  getSearchSuggestions,
} from '../controllers/productController';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Search and filter products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: price_min
 *         schema:
 *           type: number
 *       - in: query
 *         name: price_max
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [relevance, price_low, price_high, rating, newest]
 *     responses:
 *       200:
 *         description: Products list
 */
router.get('/', asyncHandler(searchProducts));
router.get('/suggestions', asyncHandler(getSearchSuggestions));
router.get('/categories', asyncHandler(getCategories));
router.get('/brands', asyncHandler(getBrands));
router.get('/:id', asyncHandler(getProduct));
router.get('/slug/:slug', asyncHandler(getProductBySlug));

export default router;

