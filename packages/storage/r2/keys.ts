import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type R2StorageKeys = {
  readonly CLOUDFLARE_R2_ACCESS_KEY_ID?: string;
  readonly CLOUDFLARE_R2_ACCOUNT_ID?: string;
  readonly CLOUDFLARE_R2_BUCKET_NAME?: string;
  readonly CLOUDFLARE_R2_PUBLIC_URL?: string;
  readonly CLOUDFLARE_R2_SECRET_ACCESS_KEY?: string;
};

export const keys = (): R2StorageKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1).optional(),
      CLOUDFLARE_R2_ACCOUNT_ID: z.string().min(1).optional(),
      CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1).optional(),
      CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional(),
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    },
    runtimeEnv: {
      CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
      CLOUDFLARE_R2_SECRET_ACCESS_KEY:
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });

let cachedR2StorageKeys: R2StorageKeys | null = null;

export const loadR2StorageKeys = (): R2StorageKeys =>
  (cachedR2StorageKeys ??= keys());
