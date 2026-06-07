import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type CollaborationKeys = {
  readonly LIVEBLOCKS_SECRET?: string;
};

export const keys = (): CollaborationKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      LIVEBLOCKS_SECRET: z.string().startsWith("sk_").optional(),
    },
    runtimeEnv: {
      LIVEBLOCKS_SECRET: process.env.LIVEBLOCKS_SECRET,
    },
  });

let cachedCollaborationKeys: CollaborationKeys | null = null;

export const loadCollaborationKeys = (): CollaborationKeys =>
  (cachedCollaborationKeys ??= keys());
