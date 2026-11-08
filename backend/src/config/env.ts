import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().default('redis://localhost:6381'),
  JWT_SECRET: z.string().default('drivio_super_secure_jwt_secret_key_2026_production_grade'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().default('drivio_cookie_secret_key_987654321'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_DrivioMarketplace2026'),
  RAZORPAY_KEY_SECRET: z.string().default('rzp_secret_DrivioPlatformKey2026'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('rzp_webhook_secret_998877'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  DEFAULT_COMMISSION_PERCENTAGE: z.string().transform(Number).default('10.0'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
