import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Coupon } from '../models/Coupon';
import { getElasticsearchClient, isElasticsearchAvailable } from '../config/elasticsearch';
import { createError } from '../middleware/errorHandler';

// Helper function to generate unique slug
const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  
  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Product Management
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const productData = req.body;
  
  // Ensure slug is unique
  if (productData.slug) {
    productData.slug = await generateUniqueSlug(productData.slug);
  }
  
  const product = new Product(productData);
  await product.save();

  // Index in Elasticsearch (optional)
  if (isElasticsearchAvailable()) {
    try {
      const es = getElasticsearchClient();
      if (es) {
        await es.index({
          index: 'products',
          id: product._id.toString(),
          body: {
            name: product.name,
            description: product.description,
            brand: product.brand,
            categories: product.categories,
            price: product.price,
            mrp: product.mrp,
            discount: product.discount,
            size: product.variants.map((v) => v.size),
            color: product.variants.map((v) => v.color),
            rating: product.rating,
            stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
            slug: product.slug,
            images: product.images,
            tags: product.tags,
            createdAt: product.createdAt,
          },
        });
      }
    } catch (error) {
      console.warn('⚠️  Failed to index product in Elasticsearch:', error);
      // Continue even if Elasticsearch indexing fails
    }
  }

  res.status(201).json({
    success: true,
    data: { product },
  });
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  
  // If slug is being updated, ensure it's unique (excluding current product)
  if (req.body.slug) {
    const existingProduct = await Product.findOne({ slug: req.body.slug, _id: { $ne: id } });
    if (existingProduct) {
      req.body.slug = await generateUniqueSlug(req.body.slug);
    }
  }
  
  const product = await Product.findByIdAndUpdate(id, req.body, { new: true });

  if (!product) {
    throw createError('Product not found', 404);
  }

  // Update Elasticsearch (optional)
  if (isElasticsearchAvailable()) {
    try {
      const es = getElasticsearchClient();
      if (es) {
        await es.update({
          index: 'products',
          id: id,
          body: {
            doc: {
              name: product.name,
              description: product.description,
              brand: product.brand,
              categories: product.categories,
              price: product.price,
              mrp: product.mrp,
              discount: product.discount,
              size: product.variants.map((v) => v.size),
              color: product.variants.map((v) => v.color),
              rating: product.rating,
              stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
              slug: product.slug,
              images: product.images,
              tags: product.tags,
            },
          },
        });
      }
    } catch (error) {
      console.warn('⚠️  Failed to update product in Elasticsearch:', error);
      // Continue even if Elasticsearch update fails
    }
  }

  res.json({
    success: true,
    data: { product },
  });
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

  if (!product) {
    throw createError('Product not found', 404);
  }

  res.json({
    success: true,
    message: 'Product deleted',
  });
};

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const products = await Product.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Product.countDocuments();

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

// Order Management
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const query: any = {};
  if (status) {
    query.status = status;
  }

  const orders = await Order.find(query)
    .populate('userId', 'name email phone')
    .populate('items.productId', 'name images brand')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Order.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, note } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw createError('Order not found', 404);
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || `Status updated to ${status}`,
  });

  // Mock Ekart tracking update
  if (status === 'shipped' && !order.courierTracking) {
    order.courierTracking = {
      trackingId: `EK${Date.now()}`,
      courier: 'Ekart',
      status: 'in_transit',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    };
  }

  await order.save();

  res.json({
    success: true,
    data: { order },
  });
};

// User Management
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments();

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    },
  });
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
};

// Coupon Management
export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  const coupon = new Coupon(req.body);
  await coupon.save();

  res.status(201).json({
    success: true,
    data: { coupon },
  });
};

export const getAllCoupons = async (req: AuthRequest, res: Response): Promise<void> => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { coupons },
  });
};

// Reports
export const getSalesReport = async (req: AuthRequest, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;

  const query: any = { status: { $ne: 'cancelled' } };
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const orders = await Order.find(query);

  const totalSales = orders.reduce((sum, order) => sum + order.finalAmount, 0);
  const totalOrders = orders.length;
  const totalItems = orders.reduce((sum, order) => {
    return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  res.json({
    success: true,
    data: {
      totalSales,
      totalOrders,
      totalItems,
      orders: orders.length,
    },
  });
};

export const getTopProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { limit = '10' } = req.query;
  const limitNum = parseInt(limit as string, 10);

  const products = await Product.find({ isActive: true })
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limitNum);

  res.json({
    success: true,
    data: { products },
  });
};

