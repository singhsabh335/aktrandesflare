import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { getElasticsearchClient, connectElasticsearch, isElasticsearchAvailable } from '../config/elasticsearch';

dotenv.config();

const categories = ['Men', 'Women', 'Kids'];
const subcategories = {
  Men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts', 'Jackets'],
  Women: ['Dresses', 'Tops', 'Jeans', 'Skirts', 'Kurtas', 'Sarees'],
  Kids: ['T-Shirts', 'Dresses', 'Jeans', 'Shorts', 'Frocks'],
};

const brands = [
  'AkTrend',
  'FashionHub',
  'StyleZone',
  'TrendyWear',
  'EliteFashion',
  'ClassicWear',
  'ModernStyle',
  'UrbanTrends',
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Grey', 'Navy'];

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const generateProducts = async () => {
  const products = [];

  for (let i = 0; i < 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const subcategory = subcategories[category as keyof typeof subcategories][
      Math.floor(Math.random() * subcategories[category as keyof typeof subcategories].length)
    ];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const name = `${brand} ${subcategory} ${i + 1}`;
    const mrp = Math.floor(Math.random() * 5000) + 500;
    const discount = Math.floor(Math.random() * 50) + 10;
    const price = Math.floor(mrp * (1 - discount / 100));

    const variants = [];
    const variantCount = Math.floor(Math.random() * 3) + 2; // 2-4 variants

    for (let j = 0; j < variantCount; j++) {
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const sku = `${brand.substring(0, 3).toUpperCase()}-${i}-${j}`;
      const stock = Math.floor(Math.random() * 50) + 10;

      variants.push({
        size,
        color,
        sku,
        stock,
      });
    }

    const product = new Product({
      name,
      slug: `${generateSlug(name)}-${i}`,
      description: `High-quality ${subcategory.toLowerCase()} from ${brand}. Perfect for everyday wear with premium comfort and style.`,
      brand,
      categories: [category, subcategory],
      price,
      mrp,
      discount,
      images: [
        `https://picsum.photos/400/600?random=${i * 2}`,
        `https://picsum.photos/400/600?random=${i * 2 + 1}`,
      ],
      variants,
      rating: Math.random() * 2 + 3, // 3-5
      reviewCount: Math.floor(Math.random() * 100),
      specs: {
        Material: 'Cotton',
        'Care Instructions': 'Machine Wash',
        Fit: 'Regular',
      },
      tags: [category.toLowerCase(), subcategory.toLowerCase(), brand.toLowerCase()],
      isActive: true,
    });

    await product.save();
    products.push(product);
  }

  return products;
};

const indexProductsInElasticsearch = async (products: any[]) => {
  // Check if Elasticsearch is available
  if (!isElasticsearchAvailable()) {
    console.log('⚠️  Elasticsearch not available - skipping product indexing');
    return;
  }

  const es = getElasticsearchClient();
  if (!es) {
    console.log('⚠️  Elasticsearch client not available - skipping product indexing');
    return;
  }

  try {
    for (const product of products) {
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
          size: product.variants.map((v: any) => v.size),
          color: product.variants.map((v: any) => v.color),
          rating: product.rating,
          stock: product.variants.reduce((sum: number, v: any) => sum + v.stock, 0),
          slug: product.slug,
          images: product.images,
          tags: product.tags,
          createdAt: product.createdAt,
        },
      });
    }
    console.log('✅ Products indexed in Elasticsearch');
  } catch (error: any) {
    console.warn('⚠️  Failed to index products in Elasticsearch:', error.message);
    console.warn('⚠️  Products are saved in MongoDB and will be searchable via MongoDB');
  }
};

const seedUsers = async () => {
  const users = [];

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = new User({
    name: 'Admin User',
    email: 'admin@aktrendflare.com',
    phone: '9999999999',
    password: adminPassword,
    role: 'admin',
    isActive: true,
  });
  await admin.save();
  users.push(admin);

  // Create regular users
  for (let i = 1; i <= 10; i++) {
    const password = await bcrypt.hash('user123', 10);
    const user = new User({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      phone: `987654321${i}`,
      password,
      role: 'user',
      isActive: true,
      addresses: [
        {
          name: `User ${i}`,
          phone: `987654321${i}`,
          addressLine1: `${i} Main Street`,
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          isDefault: true,
        },
      ],
    });
    await user.save();
    users.push(user);
  }

  return users;
};

const seedCoupons = async () => {
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Welcome discount - 10% off',
      discountType: 'percentage' as const,
      discountValue: 10,
      minCartValue: 500,
      maxDiscount: 200,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: 'FLAT500',
      description: 'Flat ₹500 off',
      discountType: 'fixed' as const,
      discountValue: 500,
      minCartValue: 2000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'SUMMER20',
      description: 'Summer sale - 20% off',
      discountType: 'percentage' as const,
      discountValue: 20,
      minCartValue: 1000,
      maxDiscount: 500,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ];

  for (const couponData of coupons) {
    const coupon = new Coupon(couponData);
    await coupon.save();
  }

  return coupons;
};

const seed = async () => {
  try {
    console.log('🌱 Starting seed process...');

    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aktrendflare');
    console.log('✅ Connected to MongoDB');

    // Try to connect to Elasticsearch (optional)
    try {
      await connectElasticsearch();
      if (isElasticsearchAvailable()) {
        console.log('✅ Connected to Elasticsearch');
      }
    } catch (error) {
      console.log('⚠️  Elasticsearch not available - continuing without it');
    }

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    // Seed users
    console.log('👥 Seeding users...');
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users`);

    // Seed products
    console.log('🛍️  Seeding products...');
    const products = await generateProducts();
    console.log(`✅ Created ${products.length} products`);

    // Index products in Elasticsearch
    console.log('🔍 Indexing products in Elasticsearch...');
    await indexProductsInElasticsearch(products);
    console.log('✅ Products indexed');

    // Seed coupons
    console.log('🎫 Seeding coupons...');
    const coupons = await seedCoupons();
    console.log(`✅ Created ${coupons.length} coupons`);

    console.log('\n✨ Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@aktrendflare.com / admin123');
    console.log('   User: user1@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();

