import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { createError } from '../middleware/errorHandler';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, orderId, rating, title, comment, images } = req.body;

  if (!productId || !rating || !comment) {
    throw createError('Product ID, rating, and comment are required', 400);
  }

  if (rating < 1 || rating > 5) {
    throw createError('Rating must be between 1 and 5', 400);
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    userId: req.userId,
    productId,
  });

  if (existingReview) {
    throw createError('You have already reviewed this product', 409);
  }

  // Check if it's a verified purchase
  let isVerifiedPurchase = false;
  if (orderId) {
    const order = await Order.findOne({
      _id: orderId,
      userId: req.userId,
      'items.productId': productId,
      status: 'delivered',
    });

    if (order) {
      isVerifiedPurchase = true;
    }
  }

  const review = new Review({
    userId: req.userId,
    productId,
    orderId,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase,
  });

  await review.save();

  // Update product rating
  const product = await Product.findById(productId);
  if (product) {
    const reviews = await Review.find({ productId, isActive: true });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    product.rating = avgRating;
    product.reviewCount = reviews.length;
    await product.save();
  }

  res.status(201).json({
    success: true,
    data: { review },
  });
};

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  const { sort = 'latest', page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  let sortOption: any = { createdAt: -1 };
  if (sort === 'helpful') {
    sortOption = { helpfulCount: -1, createdAt: -1 };
  } else if (sort === 'rating_high') {
    sortOption = { rating: -1, createdAt: -1 };
  } else if (sort === 'rating_low') {
    sortOption = { rating: 1, createdAt: -1 };
  }

  const reviews = await Review.find({ productId, isActive: true })
    .populate('userId', 'name')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum);

  const total = await Review.countDocuments({ productId, isActive: true });

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

export const markHelpful = async (req: AuthRequest, res: Response): Promise<void> => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw createError('Review not found', 404);
  }

  review.helpfulCount += 1;
  await review.save();

  res.json({
    success: true,
    data: { review },
  });
};

