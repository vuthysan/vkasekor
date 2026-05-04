import { z } from "zod"

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  BOT_TOKEN: z.string().min(1),
  TELEGRAM_GROUP_ID: z.string().regex(/^-?\d+$/, "must be integer chat id"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 chars"),
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_ORIGIN: z.string().optional(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  ADMIN_USER_ID: z.string().length(24),
})

export type Env = z.infer<typeof EnvSchema>

export function loadEnv(source: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): Env {
  return EnvSchema.parse(source)
}

export const env: Env = process.env.NODE_ENV === "test" ? (process.env as unknown as Env) : loadEnv()
