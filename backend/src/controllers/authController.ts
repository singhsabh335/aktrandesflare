import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { getRedisClient } from '../config/redis';

const generateTokens = (userId: string, role: string) => {
  const jwtSecret = process.env.JWT_SECRET || 'secret';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
  
  const accessToken = jwt.sign(
    { userId, role },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    throw createError('All fields are required', 400);
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw createError('User already exists with this email or phone', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    phone,
    password: hashedPassword,
  });

  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  // Store refresh token in Redis (optional - works without Redis)
  try {
    const redis = getRedisClient();
    await redis.setEx(`refresh:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
  } catch (error) {
    // Redis not available - continue without storing refresh token
    console.warn('Redis not available for refresh token storage');
  }

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw createError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('Invalid credentials', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

  // Store refresh token in Redis (optional - works without Redis)
  try {
    const redis = getRedisClient();
    await redis.setEx(`refresh:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
  } catch (error) {
    // Redis not available - continue without storing refresh token
    console.warn('Redis not available for refresh token storage');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh-secret'
    ) as { userId: string; role: string };

    // Check refresh token in Redis (optional - skip check if Redis not available)
    try {
      const redis = getRedisClient();
      const storedToken = await redis.get(`refresh:${decoded.userId}`);
      
      // Only validate if Redis is available and token exists
      if (storedToken && storedToken !== refreshToken) {
        throw createError('Invalid refresh token', 401);
      }
    } catch (error: any) {
      // If Redis error and it's not about token mismatch, continue
      if (error.statusCode === 401) throw error;
      console.warn('Redis not available for refresh token validation');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      decoded.userId,
      decoded.role
    );

    try {
      const redis = getRedisClient();
      await redis.setEx(`refresh:${decoded.userId}`, 7 * 24 * 60 * 60, newRefreshToken);
    } catch (error) {
      console.warn('Redis not available for refresh token storage');
    }

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }
};

export const sendOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone } = req.body;

  if (!phone) {
    throw createError('Phone number is required', 400);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in Redis with 5-minute expiry (optional)
  try {
    const redis = getRedisClient();
    await redis.setEx(`otp:${phone}`, 300, otp);
  } catch (error) {
    console.warn('Redis not available for OTP storage');
  }

  // In production, send via Twilio
  // For now, return OTP in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP for ${phone}: ${otp}`);
  }

  res.json({
    success: true,
    message: 'OTP sent successfully',
    ...(process.env.NODE_ENV === 'development' && { otp }),
  });
};

export const verifyOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    throw createError('Phone and OTP are required', 400);
  }

  // Verify OTP from Redis (optional - in dev mode, allow any OTP if Redis unavailable)
  let storedOTP = null;
  try {
    const redis = getRedisClient();
    storedOTP = await redis.get(`otp:${phone}`);
  } catch (error) {
    console.warn('Redis not available for OTP verification');
    // In development, allow OTP verification to continue
    if (process.env.NODE_ENV === 'production') {
      throw createError('OTP service unavailable', 503);
    }
  }

  if (storedOTP && storedOTP !== otp) {
    throw createError('Invalid OTP', 400);
  }

  // Find or create user
  let user = await User.findOne({ phone });
  if (!user) {
    user = new User({
      name: `User ${phone}`,
      email: `${phone}@temp.com`,
      phone,
      password: await bcrypt.hash(Math.random().toString(), 10),
    });
    await user.save();
  }

  try {
    const redis = getRedisClient();
    await redis.del(`otp:${phone}`);
  } catch (error) {
    console.warn('Redis not available for OTP deletion');
  }

  const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
  try {
    const redis = getRedisClient();
    await redis.setEx(`refresh:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
  } catch (error) {
    console.warn('Redis not available for refresh token storage');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    },
  });
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, phone } = req.body;
  const user = await User.findById(req.userId);

  if (!user) {
    throw createError('User not found', 404);
  }

  if (name) user.name = name;
  if (phone) {
    const existingUser = await User.findOne({ phone, _id: { $ne: req.userId } });
    if (existingUser) {
      throw createError('Phone number already in use', 409);
    }
    user.phone = phone;
  }

  await user.save();

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
      },
    },
  });
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const address = req.body;
  if (address.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(address);
  await user.save();

  res.json({
    success: true,
    data: { addresses: user.addresses },
  });
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const redis = getRedisClient();
    await redis.del(`refresh:${req.userId}`);
  } catch (error) {
    console.warn('Redis not available for logout');
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

