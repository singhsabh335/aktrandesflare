import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export const getRedisClient = () => {
  if (!client) {
    // Return a mock client that does nothing
    return {
      get: async () => null,
      set: async () => 'OK',
      setEx: async () => 'OK',
      del: async () => 0,
      exists: async () => 0,
    } as any;
  }
  return client;
};

export const isRedisAvailable = (): boolean => {
  return client !== null;
};

export const connectRedis = async (): Promise<void> => {
  // Make Redis optional - don't fail if it's not available
  const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';
  
  if (!REDIS_ENABLED) {
    console.log('⚠️  Redis is disabled (REDIS_ENABLED=false)');
    return;
  }

  try {
    // Support both URL format and individual credentials
    if (process.env.REDIS_URL) {
      // Use connection URL if provided
      client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: false,
        },
      });
    } else if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
      // Use individual credentials if provided
      client = createClient({
        username: process.env.REDIS_USERNAME || 'default',
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT, 10),
          connectTimeout: 5000,
          reconnectStrategy: false,
        },
      });
    } else {
      // Fallback to localhost
      client = createClient({
        url: 'redis://localhost:6379',
        socket: {
          connectTimeout: 3000,
          reconnectStrategy: false,
        },
      });
    }

    client.on('error', (err) => {
      console.warn('Redis Client Error', err.message);
    });

    await client.connect();
    console.log('✅ Connected to Redis');
  } catch (error: any) {
    console.warn('⚠️  Redis connection failed:', error.message);
    console.warn('⚠️  Continuing without Redis. Caching features will be limited.');
    client = null;
  }
};

