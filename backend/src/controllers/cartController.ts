import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { getRedisClient } from '../config/redis';
import { createError } from '../middleware/errorHandler';

const getCartKey = (userId: string) => `cart:${userId}`;

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const redis = getRedisClient();
  const cartKey = getCartKey(req.userId!);
  const cartData = await redis.get(cartKey);

  if (!cartData) {
    res.json({
      success: true,
      data: { items: [], total: 0, itemCount: 0 },
    });
    return;
  }

  const cart = JSON.parse(cartData);
  const productIds = cart.items.map((item: any) => item.productId);

  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const items = cart.items
    .map((item: any) => {
      const product = productMap.get(item.productId);
      if (!product) return null;

      const variant = product.variants.find(
        (v) => v.size === item.size && v.color === item.color
      );

      if (!variant || variant.stock < item.quantity) {
        return null;
      }

      return {
        productId: product._id,
        name: product.name,
        brand: product.brand,
        image: product.images[0],
        size: item.size,
        color: item.color,
        sku: variant.sku,
        quantity: item.quantity,
        price: variant.price || product.price,
        mrp: product.mrp,
        discount: product.discount,
        stock: variant.stock,
      };
    })
    .filter(Boolean);

  const total = items.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);

  res.json({
    success: true,
    data: {
      items,
      total,
      itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    },
  });
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, size, color, quantity = 1 } = req.body;

  if (!productId || !size || !color) {
    throw createError('Product ID, size, and color are required', 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw createError('Product not found', 404);
  }

  const variant = product.variants.find((v) => v.size === size && v.color === color);
  if (!variant) {
    throw createError('Variant not found', 404);
  }

  if (variant.stock < quantity) {
    throw createError('Insufficient stock', 400);
  }

  const redis = getRedisClient();
  const cartKey = getCartKey(req.userId!);
  const cartData = await redis.get(cartKey);

  let cart = cartData ? JSON.parse(cartData) : { items: [] };

  const existingIndex = cart.items.findIndex(
    (item: any) =>
      item.productId === productId && item.size === size && item.color === color
  );

  if (existingIndex >= 0) {
    const newQuantity = cart.items[existingIndex].quantity + quantity;
    if (newQuantity > variant.stock) {
      throw createError('Insufficient stock', 400);
    }
    cart.items[existingIndex].quantity = newQuantity;
  } else {
    cart.items.push({ productId, size, color, quantity });
  }

  await redis.setEx(cartKey, 7 * 24 * 60 * 60, JSON.stringify(cart));

  res.json({
    success: true,
    message: 'Item added to cart',
    data: { cart },
  });
};

export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, size, color, quantity } = req.body;

  if (!productId || !size || !color || quantity === undefined) {
    throw createError('Product ID, size, color, and quantity are required', 400);
  }

  if (quantity <= 0) {
    throw createError('Quantity must be greater than 0', 400);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw createError('Product not found', 404);
  }

  const variant = product.variants.find((v) => v.size === size && v.color === color);
  if (!variant || variant.stock < quantity) {
    throw createError('Insufficient stock', 400);
  }

  const redis = getRedisClient();
  const cartKey = getCartKey(req.userId!);
  const cartData = await redis.get(cartKey);

  if (!cartData) {
    throw createError('Cart not found', 404);
  }

  const cart = JSON.parse(cartData);
  const itemIndex = cart.items.findIndex(
    (item: any) =>
      item.productId === productId && item.size === size && item.color === color
  );

  if (itemIndex < 0) {
    throw createError('Item not found in cart', 404);
  }

  cart.items[itemIndex].quantity = quantity;
  await redis.setEx(cartKey, 7 * 24 * 60 * 60, JSON.stringify(cart));

  res.json({
    success: true,
    message: 'Cart updated',
    data: { cart },
  });
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, size, color } = req.body;

  if (!productId || !size || !color) {
    throw createError('Product ID, size, and color are required', 400);
  }

  const redis = getRedisClient();
  const cartKey = getCartKey(req.userId!);
  const cartData = await redis.get(cartKey);

  if (!cartData) {
    throw createError('Cart not found', 404);
  }

  const cart = JSON.parse(cartData);
  cart.items = cart.items.filter(
    (item: any) =>
      !(item.productId === productId && item.size === size && item.color === color)
  );

  await redis.setEx(cartKey, 7 * 24 * 60 * 60, JSON.stringify(cart));

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: { cart },
  });
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const redis = getRedisClient();
  const cartKey = getCartKey(req.userId!);
  await redis.del(cartKey);

  res.json({
    success: true,
    message: 'Cart cleared',
  });
};

