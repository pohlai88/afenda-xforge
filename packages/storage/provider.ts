import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { loadBlobStorageKeys } from "./blob/keys.ts";
import { loadR2StorageKeys } from "./r2/keys.ts";
import { loadSupabaseStorageKeys } from "./supabase/keys.ts";
import type { StorageProviderKind } from "./types.ts";

export type ObjectStorageProviderKeys = {
  readonly OBJECT_STORAGE_PROVIDER?: StorageProviderKind;
};

export const keys = (): ObjectStorageProviderKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      OBJECT_STORAGE_PROVIDER: z.enum(["blob", "r2", "supabase"]).optional(),
    },
    runtimeEnv: {
      OBJECT_STORAGE_PROVIDER: process.env.OBJECT_STORAGE_PROVIDER,
    },
  });

let cachedObjectStorageProviderKeys: ObjectStorageProviderKeys | null = null;

export const loadObjectStorageProviderKeys = (): ObjectStorageProviderKeys =>
  (cachedObjectStorageProviderKeys ??= keys());

const hasBlobStorageConfiguration = (): boolean => {
  const { BLOB_READ_WRITE_TOKEN, BLOB_STORE_ID } = loadBlobStorageKeys();
  return Boolean(BLOB_READ_WRITE_TOKEN || BLOB_STORE_ID);
};

const hasSupabaseStorageConfiguration = (): boolean => {
  const { SUPABASE_STORAGE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_URL } =
    loadSupabaseStorageKeys();

  return Boolean(SUPABASE_STORAGE_SERVICE_ROLE_KEY && SUPABASE_STORAGE_URL);
};

const hasR2StorageConfiguration = (): boolean => {
  const {
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    OBJECT_STORAGE_ACCESS_KEY_ID,
    OBJECT_STORAGE_BUCKET,
    OBJECT_STORAGE_ENDPOINT,
    OBJECT_STORAGE_SECRET_ACCESS_KEY,
  } = loadR2StorageKeys();

  return Boolean(
    (OBJECT_STORAGE_ACCESS_KEY_ID &&
      OBJECT_STORAGE_BUCKET &&
      OBJECT_STORAGE_ENDPOINT &&
      OBJECT_STORAGE_SECRET_ACCESS_KEY) ||
      (CLOUDFLARE_R2_ACCESS_KEY_ID &&
        CLOUDFLARE_R2_ACCOUNT_ID &&
        CLOUDFLARE_R2_BUCKET_NAME &&
        CLOUDFLARE_R2_SECRET_ACCESS_KEY)
  );
};

export const resolveObjectStorageProviderKind =
  (): StorageProviderKind | null => {
    const { OBJECT_STORAGE_PROVIDER } = loadObjectStorageProviderKeys();

    if (OBJECT_STORAGE_PROVIDER === "blob" && hasBlobStorageConfiguration()) {
      return "blob";
    }

    if (
      OBJECT_STORAGE_PROVIDER === "supabase" &&
      hasSupabaseStorageConfiguration()
    ) {
      return "supabase";
    }

    if (OBJECT_STORAGE_PROVIDER === "r2" && hasR2StorageConfiguration()) {
      return "r2";
    }

    if (hasBlobStorageConfiguration()) {
      return "blob";
    }

    if (hasSupabaseStorageConfiguration()) {
      return "supabase";
    }

    if (hasR2StorageConfiguration()) {
      return "r2";
    }

    return null;
  };

export const isObjectStorageProviderConfigured = (
  provider: StorageProviderKind
): boolean => {
  switch (provider) {
    case "blob":
      return hasBlobStorageConfiguration();
    case "r2":
      return hasR2StorageConfiguration();
    case "supabase":
      return hasSupabaseStorageConfiguration();
    default:
      return false;
  }
};
