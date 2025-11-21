import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { getElasticsearchClient, isElasticsearchAvailable } from '../config/elasticsearch';
import { createError } from '../middleware/errorHandler';
import { User } from '../models/User';

export const searchProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    q,
    category,
    brand,
    gender,
    size,
    color,
    price_min,
    price_max,
    rating_min,
    sort = 'relevance',
    page = '1',
    limit = '20',
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const from = (pageNum - 1) * limitNum;

  // Fallback to MongoDB if Elasticsearch is not available
  if (!isElasticsearchAvailable()) {
    const query: any = { isActive: true };

    // Text search
    if (q) {
      query.$or = [
        { name: { $regex: q as string, $options: 'i' } },
        { description: { $regex: q as string, $options: 'i' } },
        { brand: { $regex: q as string, $options: 'i' } },
      ];
    }

    // Filters
    if (category) {
      query.categories = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (gender) {
      query.gender = gender;
    }
    if (size) {
      query['variants.size'] = size;
    }
    if (color) {
      query['variants.color'] = color;
    }
    if (price_min || price_max) {
      query.price = {};
      if (price_min) query.price.$gte = parseFloat(price_min as string);
      if (price_max) query.price.$lte = parseFloat(price_max as string);
    }
    if (rating_min) {
      query.rating = { $gte: parseFloat(rating_min as string) };
    }

    // Sorting
    let sortOption: any = {};
    switch (sort) {
      case 'price_low':
        sortOption = { price: 1 };
        break;
      case 'price_high':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(from)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

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
    return;
  }

  const es = getElasticsearchClient();
  if (!es) {
    throw createError('Search service unavailable', 503);
  }

  const must: any[] = [];
  const should: any[] = [];
  const filter: any[] = [];

  // Text search with fuzzy matching
  if (q) {
    should.push({
      match: {
        name: {
          query: q as string,
          fuzziness: 'AUTO',
          boost: 2,
        },
      },
    });
    should.push({
      match: {
        description: {
          query: q as string,
          fuzziness: 'AUTO',
        },
      },
    });
    should.push({
      match: {
        brand: {
          query: q as string,
          fuzziness: 'AUTO',
        },
      },
    });
  }

  // Filters
  if (category) {
    filter.push({ term: { categories: category } });
  }

  if (brand) {
    filter.push({ term: { brand: brand } });
  }

  if (gender) {
    filter.push({ term: { gender: gender } });
  }

  if (size) {
    filter.push({ term: { 'variants.size': size } });
  }

  if (color) {
    filter.push({ term: { 'variants.color': color } });
  }

  if (price_min || price_max) {
    const range: any = {};
    if (price_min) range.gte = parseFloat(price_min as string);
    if (price_max) range.lte = parseFloat(price_max as string);
    filter.push({ range: { price: range } });
  }

  if (rating_min) {
    filter.push({ range: { rating: { gte: parseFloat(rating_min as string) } } });
  }

  const query: any = {
    bool: {
      must: must.length > 0 ? must : [{ match_all: {} }],
      filter,
    },
  };

  if (should.length > 0) {
    query.bool.should = should;
    query.bool.minimum_should_match = 1;
  }

  // Sorting
  let sortConfig: any[] = [];
  switch (sort) {
    case 'price_low':
      sortConfig = [{ price: { order: 'asc' } }];
      break;
    case 'price_high':
      sortConfig = [{ price: { order: 'desc' } }];
      break;
    case 'rating':
      sortConfig = [{ rating: { order: 'desc' } }];
      break;
    case 'newest':
      sortConfig = [{ createdAt: { order: 'desc' } }];
      break;
    default:
      sortConfig = [{ _score: { order: 'desc' } }];
  }

  const result = await es.search({
    index: 'products',
    body: {
      query,
      sort: sortConfig,
      from,
      size: limitNum,
    },
  });

  const products = result.hits.hits.map((hit: any) => ({
    ...hit._source,
    _id: hit._id,
    _score: hit._score,
  }));

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.hits.total,
        totalPages: Math.ceil((result.hits.total as any).value / limitNum),
      },
    },
  });
};

export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product || !product.isActive) {
    throw createError('Product not found', 404);
  }

  // Track recently viewed
  if (req.userId) {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { recentlyViewed: id },
      $push: { recentlyViewed: { $each: [id], $slice: -20 } },
    });
  }

  res.json({
    success: true,
    data: { product },
  });
};

export const getProductBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, isActive: true });
  if (!product) {
    throw createError('Product not found', 404);
  }

  // Track recently viewed
  if (req.userId) {
    await User.findByIdAndUpdate(req.userId, {
      $pull: { recentlyViewed: product._id },
      $push: { recentlyViewed: { $each: [product._id], $slice: -20 } },
    });
  }

  res.json({
    success: true,
    data: { product },
  });
};

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  const categories = await Product.distinct('categories');
  res.json({
    success: true,
    data: { categories },
  });
};

export const getBrands = async (req: AuthRequest, res: Response): Promise<void> => {
  const brands = await Product.distinct('brand');
  res.json({
    success: true,
    data: { brands },
  });
};

export const getSearchSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q } = req.query;

  if (!q || (q as string).length < 2) {
    res.json({
      success: true,
      data: { suggestions: [] },
    });
    return;
  }

  // Fallback to MongoDB if Elasticsearch is not available
  if (!isElasticsearchAvailable()) {
    const products = await Product.find({
      name: { $regex: q as string, $options: 'i' },
      isActive: true,
    })
      .select('name')
      .limit(10);

    const suggestions = products.map((p) => p.name);

    res.json({
      success: true,
      data: { suggestions },
    });
    return;
  }

  const es = getElasticsearchClient();
  if (!es) {
    res.json({
      success: true,
      data: { suggestions: [] },
    });
    return;
  }

  const result = await es.search({
    index: 'products',
    body: {
      suggest: {
        product_suggest: {
          prefix: q as string,
          completion: {
            field: 'name.suggest',
            size: 10,
          },
        },
      },
    },
  });

  const suggestions = result.suggest?.product_suggest?.[0]?.options?.map(
    (opt: any) => opt.text
  ) || [];

  res.json({
    success: true,
    data: { suggestions },
  });
};

