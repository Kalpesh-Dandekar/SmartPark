import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().url().default("http://localhost:3000"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  IOT_DEVICE_ID: z.string().trim().min(1),
  IOT_DEVICE_SECRET: z.string().min(16),
  IOT_COMMAND_TTL_SECONDS: z.coerce.number().int().min(30).max(600).default(120),
});

export const env = schema.parse(process.env);
