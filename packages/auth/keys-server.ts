import "server-only";

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import type { PublicAuthKeys } from "./keys-public.ts";
import { loadPublicAuthKeys } from "./keys-public.ts";

export type ServerAuthKeys = PublicAuthKeys & {
  readonly SUPABASE_SERVICE_ROLE_KEY?: string;
};

const serverKeys = (): ServerAuthKeys => {
  const publicKeys = loadPublicAuthKeys();

  const serverOnly = createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
    },
    runtimeEnv: {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });

  return {
    ...publicKeys,
    SUPABASE_SERVICE_ROLE_KEY: serverOnly.SUPABASE_SERVICE_ROLE_KEY,
  };
};

let cachedServerAuthKeys: ServerAuthKeys | null = null;

export const loadServerAuthKeys = (): ServerAuthKeys =>
  (cachedServerAuthKeys ??= serverKeys());

/** @deprecated Use `loadPublicAuthKeys` or `loadServerAuthKeys` explicitly. */
export const loadAuthKeys = loadServerAuthKeys;

export type AuthKeys = ServerAuthKeys;

/** @deprecated Use `loadServerAuthKeys` instead. */
export const keys = serverKeys;
