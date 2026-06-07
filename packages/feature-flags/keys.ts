import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type FeatureFlagsKeys = {
  readonly FLAGS_SECRET?: string;
};

export const keys = (): FeatureFlagsKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      FLAGS_SECRET: z.string().optional(),
    },
    runtimeEnv: {
      FLAGS_SECRET: process.env.FLAGS_SECRET,
    },
  });
