import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type SecurityKeys = {
  readonly SECURITY_ENABLE_STRICT_HEADERS?: boolean;
  readonly SECURITY_ENABLE_BOT_PROTECTION?: boolean;
  readonly SECURITY_ALLOW_UNSAFE_METHODS?: boolean;
  readonly SECURITY_CONTENT_SECURITY_POLICY?: string;
  readonly SECURITY_CONTENT_SECURITY_POLICY_REPORT_ONLY?: string;
  readonly SECURITY_BLOCKED_PATH_PREFIXES?: string;
  readonly SECURITY_ALLOWED_USER_AGENTS?: string;
  readonly SECURITY_REFERRER_POLICY?:
    | "no-referrer"
    | "strict-origin-when-cross-origin"
    | "same-origin"
    | "origin"
    | "origin-when-cross-origin";
  readonly SECURITY_FRAME_OPTIONS?: "DENY" | "SAMEORIGIN";
};

export const keys = (): SecurityKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      SECURITY_ENABLE_STRICT_HEADERS: z.coerce.boolean().optional(),
      SECURITY_ENABLE_BOT_PROTECTION: z.coerce.boolean().optional(),
      SECURITY_ALLOW_UNSAFE_METHODS: z.coerce.boolean().optional(),
      SECURITY_CONTENT_SECURITY_POLICY: z.string().optional(),
      SECURITY_CONTENT_SECURITY_POLICY_REPORT_ONLY: z.string().optional(),
      SECURITY_BLOCKED_PATH_PREFIXES: z.string().optional(),
      SECURITY_ALLOWED_USER_AGENTS: z.string().optional(),
      SECURITY_REFERRER_POLICY: z
        .enum([
          "no-referrer",
          "strict-origin-when-cross-origin",
          "same-origin",
          "origin",
          "origin-when-cross-origin",
        ])
        .optional(),
      SECURITY_FRAME_OPTIONS: z.enum(["DENY", "SAMEORIGIN"]).optional(),
    },
    runtimeEnv: {
      SECURITY_ENABLE_STRICT_HEADERS:
        process.env.SECURITY_ENABLE_STRICT_HEADERS,
      SECURITY_ENABLE_BOT_PROTECTION:
        process.env.SECURITY_ENABLE_BOT_PROTECTION,
      SECURITY_ALLOW_UNSAFE_METHODS: process.env.SECURITY_ALLOW_UNSAFE_METHODS,
      SECURITY_CONTENT_SECURITY_POLICY:
        process.env.SECURITY_CONTENT_SECURITY_POLICY,
      SECURITY_CONTENT_SECURITY_POLICY_REPORT_ONLY:
        process.env.SECURITY_CONTENT_SECURITY_POLICY_REPORT_ONLY,
      SECURITY_BLOCKED_PATH_PREFIXES:
        process.env.SECURITY_BLOCKED_PATH_PREFIXES,
      SECURITY_ALLOWED_USER_AGENTS: process.env.SECURITY_ALLOWED_USER_AGENTS,
      SECURITY_REFERRER_POLICY: process.env.SECURITY_REFERRER_POLICY,
      SECURITY_FRAME_OPTIONS: process.env.SECURITY_FRAME_OPTIONS,
    },
  });
