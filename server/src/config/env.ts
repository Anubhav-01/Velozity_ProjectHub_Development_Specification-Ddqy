import { z } from 'zod';

const isTest = process.env.NODE_ENV === 'test';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform(Number),

  // Database
  DATABASE_URL: z.string().default(
    isTest ? 'postgresql://postgres:postgres@localhost:5432/velozity_test' : ''
  ),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters')
    .default(
      isTest ? 'test_jwt_access_secret_for_unit_tests_32chars_min' : ''
    ),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .default(
      isTest ? 'test_jwt_refresh_secret_for_unit_tests_32chars_min' : ''
    ),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // Cookies
  COOKIE_SECURE: z.string().default('false').transform((v) => v === 'true'),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
});

type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
  if (!isTest) {
    if (!env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }
    if (!env.JWT_ACCESS_SECRET || env.JWT_ACCESS_SECRET.length < 32) {
      throw new Error('JWT_ACCESS_SECRET must be at least 32 characters');
    }
    if (!env.JWT_REFRESH_SECRET || env.JWT_REFRESH_SECRET.length < 32) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters');
    }
  }
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingVars = error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
    console.error(`\n❌ Invalid environment configuration:\n${missingVars}\n`);
    console.error('💡 Copy .env.example to .env and fill in all required values.\n');
    process.exit(1);
  }
  console.error(`\n❌ Invalid environment configuration:\n  - ${(error as any).message}\n`);
  process.exit(1);
}

export { env };
export default env;
