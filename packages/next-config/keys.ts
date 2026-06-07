import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type NextConfigKeys = {
  readonly ANALYZE?: "true" | "false";
  readonly NEXT_RUNTIME?: "nodejs" | "edge";
  readonly VERCEL?: string;
  readonly VERCEL_ENV?: "development" | "preview" | "production";
  readonly VERCEL_URL?: string;
  readonly VERCEL_REGION?: string;
  readonly VERCEL_PROJECT_PRODUCTION_URL?: string;
  readonly NEXT_PUBLIC_APP_URL?: string;
  readonly NEXT_PUBLIC_WEB_URL?: string;
  readonly NEXT_PUBLIC_API_URL?: string;
  readonly NEXT_PUBLIC_DOCS_URL?: string;
};

export const keys = (): NextConfigKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      ANALYZE: z.enum(["true", "false"]).optional(),
      NEXT_RUNTIME: z.enum(["nodejs", "edge"]).optional(),
      VERCEL: z.string().optional(),
      VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
      VERCEL_URL: z.string().optional(),
      VERCEL_REGION: z.string().optional(),
      VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    },
    client: {
      NEXT_PUBLIC_APP_URL: z.url().optional(),
      NEXT_PUBLIC_WEB_URL: z.url().optional(),
      NEXT_PUBLIC_API_URL: z.url().optional(),
      NEXT_PUBLIC_DOCS_URL: z.url().optional(),
    },
    runtimeEnv: {
      ANALYZE: process.env.ANALYZE,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
      VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
    },
  });

let cachedNextConfigKeys: NextConfigKeys | null = null;

export const loadNextConfigKeys = (): NextConfigKeys =>
  (cachedNextConfigKeys ??= keys());
