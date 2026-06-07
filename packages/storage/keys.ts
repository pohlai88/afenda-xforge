import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type StorageKeys = {
  readonly BLOB_READ_WRITE_TOKEN?: string;
};

export const keys = (): StorageKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      BLOB_READ_WRITE_TOKEN: z.string().optional(),
    },
    runtimeEnv: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    },
  });
