import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type CmsKeys = {
  readonly PAYLOAD_API_KEY?: string;
  readonly PAYLOAD_API_KEY_COLLECTION: string;
  readonly PAYLOAD_API_PATH: string;
  readonly PAYLOAD_JWT?: string;
  readonly PAYLOAD_SERVER_URL?: string;
};

export const keys = (): CmsKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      PAYLOAD_API_KEY: z.string().min(1).optional(),
      PAYLOAD_API_KEY_COLLECTION: z.string().min(1).default("users"),
      PAYLOAD_API_PATH: z.string().startsWith("/").default("/api"),
      PAYLOAD_JWT: z.string().min(1).optional(),
      PAYLOAD_SERVER_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      PAYLOAD_API_KEY: process.env.PAYLOAD_API_KEY,
      PAYLOAD_API_KEY_COLLECTION: process.env.PAYLOAD_API_KEY_COLLECTION,
      PAYLOAD_API_PATH: process.env.PAYLOAD_API_PATH,
      PAYLOAD_JWT: process.env.PAYLOAD_JWT,
      PAYLOAD_SERVER_URL: process.env.PAYLOAD_SERVER_URL,
    },
  });

let cachedCmsKeys: CmsKeys | null = null;

export const loadCmsKeys = (): CmsKeys => (cachedCmsKeys ??= keys());
