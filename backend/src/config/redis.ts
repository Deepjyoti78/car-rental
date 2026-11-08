import Redis from 'ioredis';
import { env } from './env.js';

let redisClient: Redis | null = null;

try {
  redisClient = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection exhausted retry attempts. Continuing with memory fallback.');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on('connect', () => {
    console.log('⚡ Redis connected successfully on', env.REDIS_URL);
  });

  redisClient.on('error', (err) => {
    console.warn('⚠️ Redis error:', err.message);
  });
} catch (error) {
  console.warn('⚠️ Could not initialize Redis, operating without distributed cache.');
}

export { redisClient };
