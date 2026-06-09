import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type BlobStorageKeys = {
  readonly BLOB_READ_WRITE_TOKEN?: string;
  readonly BLOB_STORE_ID?: string;
};

export const keys = (): BlobStorageKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
      BLOB_STORE_ID: z.string().min(1).optional(),
    },
    runtimeEnv: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      BLOB_STORE_ID: process.env.BLOB_STORE_ID,
    },
  });

let cachedBlobStorageKeys: BlobStorageKeys | null = null;

export const loadBlobStorageKeys = (): BlobStorageKeys =>
  (cachedBlobStorageKeys ??= keys());
