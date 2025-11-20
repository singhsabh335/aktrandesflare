import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Coupon } from '../models/Coupon';
import { createError } from '../middleware/errorHandler';

export const validateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const { code, cartValue } = req.body;

  if (!code || !cartValue) {
    throw createError('Coupon code and cart value are required', 400);
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
  });

  if (!coupon) {
    throw createError('Invalid or expired coupon', 404);
  }

  if (coupon.minCartValue > cartValue) {
    throw createError(
      `Minimum cart value of ₹${coupon.minCartValue} required`,
      400
    );
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw createError('Coupon usage limit exceeded', 400);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (cartValue * coupon.discountValue) / 100;
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  res.json({
    success: true,
    data: {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        maxDiscount: coupon.maxDiscount,
      },
    },
  });
};

