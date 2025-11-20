import { Response } from 'express';
// import Razorpay from 'razorpay';
import { AuthRequest } from '../middleware/auth';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { getRedisClient } from '../config/redis';
import { createError } from '../middleware/errorHandler';
import { generateOrderNumber } from '../utils/orderNumber';

// Razorpay initialization - commented out for development
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || '',
//   key_secret: process.env.RAZORPAY_KEY_SECRET || '',
// });

const getCartKey = (userId: string) => `cart:${userId}`;

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;

  if (!shippingAddress || !paymentMethod) {
    throw createError('Shipping address and payment method are required', 400);
  }

  const redis = getRedisClient();
  const cartKey = getCartKey(req.userId!);
  const cartData = await redis.get(cartKey);

  if (!cartData) {
    throw createError('Cart is empty', 400);
  }

  const cart = JSON.parse(cartData);
  if (cart.items.length === 0) {
    throw createError('Cart is empty', 400);
  }

  const productIds = cart.items.map((item: any) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = productMap.get(item.productId);
    if (!product) continue;

    const variant = product.variants.find(
      (v) => v.size === item.size && v.color === item.color
    );

    if (!variant || variant.stock < item.quantity) {
      throw createError(`Insufficient stock for ${product.name}`, 400);
    }

    const price = variant.price || product.price;
    const itemTotal = price * item.quantity;

    orderItems.push({
      productId: product._id,
      variant: {
        size: item.size,
        color: item.color,
        sku: variant.sku,
      },
      quantity: item.quantity,
      price,
      mrp: product.mrp,
      discount: product.discount,
    });

    totalAmount += itemTotal;
  }

  // Apply coupon if provided
  let discountAmount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (coupon) {
      if (coupon.minCartValue > totalAmount) {
        throw createError(`Minimum cart value of ₹${coupon.minCartValue} required`, 400);
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw createError('Coupon usage limit exceeded', 400);
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    }
  }

  const deliveryFee = totalAmount > 500 ? 0 : 50;
  const finalAmount = totalAmount - discountAmount + deliveryFee;

  // Create Razorpay order for online payments - commented out for development
  let razorpayOrderId = null;
  const orderNumber = generateOrderNumber();
  
  // Razorpay integration - commented out
  // if (paymentMethod !== 'COD') {
  //   try {
  //     const razorpayOrder = await razorpay.orders.create({
  //       amount: Math.round(finalAmount * 100), // Amount in paise
  //       currency: 'INR',
  //       receipt: orderNumber,
  //     });
  //     razorpayOrderId = razorpayOrder.id;
  //   } catch (error) {
  //     console.error('Razorpay order creation error:', error);
  //     throw createError('Payment gateway error', 500);
  //   }
  // }
  
  // For development: allow non-COD payments without Razorpay
  if (paymentMethod !== 'COD') {
    console.log('Razorpay integration disabled - using mock payment');
    razorpayOrderId = `mock_razorpay_${orderNumber}`;
  }
  const order = new Order({
    userId: req.userId,
    orderNumber,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
    razorpayOrderId,
    totalAmount,
    discountAmount,
    deliveryFee,
    finalAmount,
    couponCode: coupon?.code,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(),
        note: 'Order placed',
      },
    ],
  });

  await order.save();

  // Update coupon usage
  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  // Update product stock
  for (const item of orderItems) {
    const product = productMap.get(item.productId.toString());
    if (product) {
      const variant = product.variants.find((v) => v.sku === item.variant.sku);
      if (variant) {
        variant.stock -= item.quantity;
        await product.save();
      }
    }
  }

  // Clear cart
  await redis.del(cartKey);

  res.status(201).json({
    success: true,
    data: {
      order,
      razorpayOrderId,
      ...(razorpayOrderId && {
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      }),
    },
  });
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

  if (!orderId || !razorpayPaymentId || !razorpaySignature) {
    throw createError('Payment verification data is required', 400);
  }

  const order = await Order.findOne({
    _id: orderId,
    userId: req.userId,
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Verify Razorpay signature - commented out for development
  // const crypto = require('crypto');
  // const generatedSignature = crypto
  //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
  //   .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
  //   .digest('hex');

  // if (generatedSignature !== razorpaySignature) {
  //   throw createError('Invalid payment signature', 400);
  // }
  
  // For development: skip signature verification
  if (order.razorpayOrderId && !order.razorpayOrderId.startsWith('mock_')) {
    console.log('Razorpay signature verification disabled - accepting payment');
  }

  order.paymentStatus = 'paid';
  order.paymentId = razorpayPaymentId;
  order.status = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    timestamp: new Date(),
    note: 'Payment verified',
  });

  await order.save();

  res.json({
    success: true,
    message: 'Payment verified successfully',
    data: { order },
  });
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await Order.find({ userId: req.userId })
    .populate('items.productId', 'name images brand')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { orders },
  });
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    userId: req.userId,
  }).populate('items.productId', 'name images brand');

  if (!order) {
    throw createError('Order not found', 404);
  }

  res.json({
    success: true,
    data: { order },
  });
};

export const trackOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const order = await Order.findOne({
    _id: id,
    userId: req.userId,
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Mock Ekart tracking (replace with real API in production)
  if (order.courierTracking?.trackingId) {
    // In production, call Ekart API here
    const mockTracking = {
      trackingId: order.courierTracking.trackingId,
      status: order.status,
      currentLocation: 'Mumbai',
      estimatedDelivery: order.courierTracking.estimatedDelivery,
      timeline: order.statusHistory,
    };

    res.json({
      success: true,
      data: { tracking: mockTracking },
    });
  } else {
    res.json({
      success: true,
      data: {
        tracking: {
          status: order.status,
          timeline: order.statusHistory,
        },
      },
    });
  }
};

