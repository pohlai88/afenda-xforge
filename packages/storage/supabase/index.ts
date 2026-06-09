import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { StorageBucketSummary, StorageObjectSummary } from "../types.ts";
import { loadSupabaseStorageKeys } from "./keys.ts";

export * from "@supabase/supabase-js";
export * from "./keys.ts";

type SupabaseStorageConfig = {
  readonly bucket?: string;
  readonly serviceRoleKey: string;
  readonly url: string;
};

type SupabaseStorageConnectionConfig = {
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

type SupabaseSignedUploadSession = {
  readonly bucket: string;
  readonly path: string;
  readonly provider: "supabase";
  readonly token: string;
};

type SupabaseDownloadResult = {
  readonly blob: {
    readonly contentDisposition?: string;
    readonly contentType?: string;
    readonly etag: string;
    readonly pathname: string;
    readonly size: number | null;
    readonly uploadedAt?: Date;
    readonly url?: string;
  };
  readonly headers: Headers;
  readonly statusCode: 200;
  readonly stream: ReadableStream<Uint8Array>;
};

let cachedSupabaseStorageClient: SupabaseClient | null = null;

const getSupabaseStorageConnectionConfig =
  (): SupabaseStorageConnectionConfig | null => {
    const { SUPABASE_STORAGE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_URL } =
      loadSupabaseStorageKeys();

    if (!(SUPABASE_STORAGE_SERVICE_ROLE_KEY && SUPABASE_STORAGE_URL)) {
      return null;
    }

    return {
      serviceRoleKey: SUPABASE_STORAGE_SERVICE_ROLE_KEY,
      url: SUPABASE_STORAGE_URL,
    };
  };

const getSupabaseStorageConfig = (): SupabaseStorageConfig | null => {
  const connection = getSupabaseStorageConnectionConfig();

  if (!connection) {
    return null;
  }

  const { SUPABASE_STORAGE_BUCKET } = loadSupabaseStorageKeys();

  return {
    ...connection,
    bucket: SUPABASE_STORAGE_BUCKET,
  };
};

export const createSupabaseStorageClient = (): SupabaseClient | null => {
  const config = getSupabaseStorageConnectionConfig();

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

const createSupabaseStorageError = (action: string, error: unknown): Error =>
  error instanceof Error
    ? new Error(`Supabase storage ${action} failed.`, { cause: error })
    : new Error(`Supabase storage ${action} failed.`);

const toSupabaseDownloadResult = ({
  bucket,
  blob,
  key,
}: {
  readonly bucket: string;
  readonly blob: Blob;
  readonly key: string;
}): SupabaseDownloadResult => ({
  blob: {
    contentDisposition: undefined,
    contentType: blob.type || undefined,
    etag: "",
    pathname: key,
    size: blob.size,
    uploadedAt: undefined,
    url: getSupabaseObjectPublicUrl({ bucket, key }) ?? undefined,
  },
  headers: new Headers({
    ...(blob.type ? { "content-type": blob.type } : {}),
    ...(blob.size === undefined ? {} : { "content-length": String(blob.size) }),
  }),
  statusCode: 200,
  stream: blob.stream(),
});

export const listSupabaseBuckets = async (): Promise<
  StorageBucketSummary[] | null
> => {
  const supabase = createSupabaseStorageClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    throw createSupabaseStorageError("list buckets", error);
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
    throw createSupabaseStorageError("list objects", error);
  }

  return data
    .filter((object: { id?: string | null }) => object.id !== null)
    .map(
      (object: {
        created_at?: string | null;
        metadata?: { etag?: string; mimetype?: string; size?: number } | null;
        name: string;
        updated_at?: string | null;
      }) => ({
        contentType: object.metadata?.mimetype,
        etag: object.metadata?.etag,
        key: `${prefix ? `${prefix.replace(/\/$/, "")}/` : ""}${object.name}`,
        lastModified: object.updated_at ?? object.created_at ?? undefined,
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
    throw createSupabaseStorageError("upload object", error);
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

export const createSupabaseSignedUploadSession = async ({
  bucket,
  key,
}: {
  readonly bucket?: string;
  readonly key: string;
}): Promise<SupabaseSignedUploadSession | null> => {
  const supabase = createSupabaseStorageClient();
  const resolvedBucket = resolveSupabaseBucket(bucket);

  if (!(supabase && resolvedBucket)) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(resolvedBucket)
    .createSignedUploadUrl(key);

  if (error) {
    throw createSupabaseStorageError("create signed upload session", error);
  }

  return {
    bucket: resolvedBucket,
    path: data.path,
    provider: "supabase",
    token: data.token,
  };
};

export const downloadSupabaseObject = async ({
  bucket,
  key,
}: {
  readonly bucket?: string;
  readonly key: string;
}): Promise<SupabaseDownloadResult | null> => {
  const supabase = createSupabaseStorageClient();
  const resolvedBucket = resolveSupabaseBucket(bucket);

  if (!(supabase && resolvedBucket)) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(resolvedBucket)
    .download(key);

  if (error) {
    if (
      error.name === "StorageApiError" &&
      error.message.includes("not found")
    ) {
      return null;
    }

    throw createSupabaseStorageError("download object", error);
  }

  if (!data) {
    return null;
  }

  return toSupabaseDownloadResult({
    bucket: resolvedBucket,
    blob: data,
    key,
  });
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

  if (error) {
    throw createSupabaseStorageError("delete objects", error);
  }

  return true;
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
