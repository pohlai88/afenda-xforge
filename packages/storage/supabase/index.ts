import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { StorageBucketSummary, StorageObjectSummary } from "../types.js";
import { loadSupabaseStorageKeys } from "./keys.js";

type SupabaseStorageConfig = {
  readonly bucket: string;
  readonly serviceRoleKey: string;
  readonly url: string;
};

type SupabaseUploadOptions = {
  readonly body: BodyInit | ArrayBuffer | ArrayBufferView | Blob | Buffer;
  readonly bucket?: string;
  readonly cacheControl?: string;
  readonly contentType?: string;
  readonly key: string;
  readonly metadata?: Record<string, string>;
  readonly upsert?: boolean;
};

type SupabaseListOptions = {
  readonly bucket?: string;
  readonly limit?: number;
  readonly prefix?: string;
};

let cachedSupabaseStorageClient: SupabaseClient | null = null;

const getSupabaseStorageConfig = (): SupabaseStorageConfig | null => {
  const {
    SUPABASE_STORAGE_BUCKET,
    SUPABASE_STORAGE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_URL,
  } = loadSupabaseStorageKeys();

  if (
    !(
      SUPABASE_STORAGE_BUCKET &&
      SUPABASE_STORAGE_SERVICE_ROLE_KEY &&
      SUPABASE_STORAGE_URL
    )
  ) {
    return null;
  }

  return {
    bucket: SUPABASE_STORAGE_BUCKET,
    serviceRoleKey: SUPABASE_STORAGE_SERVICE_ROLE_KEY,
    url: SUPABASE_STORAGE_URL,
  };
};

export const createSupabaseStorageClient = (): SupabaseClient | null => {
  const config = getSupabaseStorageConfig();

  if (!config) {
    return null;
  }

  cachedSupabaseStorageClient ??= createClient(
    config.url,
    config.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return cachedSupabaseStorageClient;
};

const resolveSupabaseBucket = (bucket?: string): string | null =>
  bucket ?? getSupabaseStorageConfig()?.bucket ?? null;

export const listSupabaseBuckets = async (): Promise<
  StorageBucketSummary[] | null
> => {
  const supabase = createSupabaseStorageClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    return null;
  }

  return data.map((bucket: { name: string; public: boolean }) => ({
    name: bucket.name,
    provider: "supabase",
    public: bucket.public,
  }));
};

export const listSupabaseObjects = async ({
  bucket,
  limit,
  prefix,
}: SupabaseListOptions = {}): Promise<StorageObjectSummary[] | null> => {
  const supabase = createSupabaseStorageClient();
  const resolvedBucket = resolveSupabaseBucket(bucket);

  if (!(supabase && resolvedBucket)) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(resolvedBucket)
    .list(prefix ?? "", {
      limit,
    });

  if (error) {
    return null;
  }

  return data.map(
    (object: {
      created_at?: string | null;
      metadata?: { etag?: string; mimetype?: string; size?: number } | null;
      name: string;
    }) => ({
      contentType: object.metadata?.mimetype,
      etag: object.metadata?.etag,
      key: `${prefix ? `${prefix.replace(/\/$/, "")}/` : ""}${object.name}`,
      lastModified: object.created_at ?? undefined,
      provider: "supabase",
      size: object.metadata?.size ?? undefined,
    })
  );
};

export const uploadSupabaseObject = async ({
  body,
  bucket,
  cacheControl,
  contentType,
  key,
  metadata,
  upsert,
}: SupabaseUploadOptions): Promise<StorageObjectSummary | null> => {
  const supabase = createSupabaseStorageClient();
  const resolvedBucket = resolveSupabaseBucket(bucket);

  if (!(supabase && resolvedBucket)) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(resolvedBucket)
    .upload(key, body, {
      cacheControl,
      contentType,
      metadata,
      upsert,
    });

  if (error) {
    return null;
  }

  const { data: publicData } = supabase.storage
    .from(resolvedBucket)
    .getPublicUrl(data.path);

  return {
    key: data.path,
    provider: "supabase",
    url: publicData.publicUrl,
  };
};

export const deleteSupabaseObjects = async ({
  bucket,
  keys,
}: {
  readonly bucket?: string;
  readonly keys: string[];
}): Promise<boolean> => {
  const supabase = createSupabaseStorageClient();
  const resolvedBucket = resolveSupabaseBucket(bucket);

  if (!(supabase && resolvedBucket && keys.length > 0)) {
    return false;
  }

  const { error } = await supabase.storage.from(resolvedBucket).remove(keys);

  return !error;
};

export const getSupabaseObjectPublicUrl = ({
  bucket,
  key,
}: {
  readonly bucket?: string;
  readonly key: string;
}): string | null => {
  const supabase = createSupabaseStorageClient();
  const resolvedBucket = resolveSupabaseBucket(bucket);

  if (!(supabase && resolvedBucket)) {
    return null;
  }

  const { data } = supabase.storage.from(resolvedBucket).getPublicUrl(key);

  return data.publicUrl;
};
