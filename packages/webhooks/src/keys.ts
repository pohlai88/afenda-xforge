import "server-only";

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import type { WebhooksKeys } from "./contract.ts";

export type { WebhooksKeys } from "./contract.ts";

export const keys = (): WebhooksKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      SVIX_TOKEN: z
        .union([z.string().startsWith("sk_"), z.string().startsWith("testsk_")])
        .optional(),
    },
    runtimeEnv: {
      SVIX_TOKEN: process.env.SVIX_TOKEN,
    },
  });

let cachedWebhooksKeys: WebhooksKeys | null = null;

export const loadWebhooksKeys = (): WebhooksKeys =>
  (cachedWebhooksKeys ??= keys());
