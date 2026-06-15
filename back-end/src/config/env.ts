import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_CLIENT_PRO: z.string().optional(),
  STRIPE_PRICE_CLIENT_PREMIUM: z.string().optional(),
  STRIPE_PRICE_PRO_PRO: z.string().optional(),
  STRIPE_PRICE_PRO_PREMIUM: z.string().optional(),
});

export const env = envSchema.parse(process.env);
