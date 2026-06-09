import "server-only";

import { del, head, list, put } from "@vercel/blob";
import type { StorageObjectSummary } from "../types.ts";
import { loadBlobStorageKeys } from "./keys.ts";

export * from "@vercel/blob";
export * from "./keys.ts";

type BlobStorageConfig = {
  readonly storeId?: string;
  readonly token?: string;
};

type BlobCommandOptions = {
  readonly storeId?: string;
  readonly token?: string;
};

type BlobListOptions = {
  readonly limit?: number;
  readonly prefix?: string;
};

type BlobBody = Parameters<typeof put>[1];

type BlobUploadOptions = {
  readonly access: "private" | "public";
  readonly addRandomSuffix?: boolean;
  readonly allowOverwrite?: boolean;
  readonly abortSignal?: AbortSignal;
  readonly body: BlobBody;
  readonly cacheControlMaxAge?: number;
  readonly contentType?: string;
  readonly key: string;
  readonly multipart?: boolean;
  readonly onUploadProgress?: Parameters<typeof put>[2]["onUploadProgress"];
};

type BlobHeadOptions = BlobCommandOptions & {
  readonly key: string;
};

const getBlobStorageConfig = (): BlobStorageConfig | null => {
  const { BLOB_READ_WRITE_TOKEN, BLOB_STORE_ID } = loadBlobStorageKeys();

  if (!(BLOB_READ_WRITE_TOKEN || BLOB_STORE_ID)) {
    return null;
  }

  return {
    storeId: BLOB_STORE_ID,
    token: BLOB_READ_WRITE_TOKEN,
  };
};

const getBlobCommandOptions = (): BlobCommandOptions | null => {
  const config = getBlobStorageConfig();

  if (!config) {
    return null;
  }

  return {
    storeId: config.storeId,
    token: config.token,
  };
};

const toBlobObjectSummary = (blob: {
  readonly etag: string;
  readonly pathname: string;
  readonly size?: number;
  readonly url?: string;
  readonly contentType?: string;
  readonly uploadedAt?: Date;
}): StorageObjectSummary => ({
  contentType: blob.contentType,
  etag: blob.etag,
  key: blob.pathname,
  lastModified: blob.uploadedAt?.toISOString(),
  provider: "blob",
  size: blob.size,
  url: blob.url,
});

export const headBlobObject = async ({
  key,
  ...options
}: BlobHeadOptions): Promise<StorageObjectSummary | null> => {
  const commandOptions = getBlobCommandOptions();

  if (!commandOptions) {
    return null;
  }

  const blob = await head(key, {
    ...commandOptions,
    ...options,
  });

  return toBlobObjectSummary(blob);
};

export const listBlobObjects = async ({
  limit,
  prefix,
}: BlobListOptions = {}): Promise<StorageObjectSummary[] | null> => {
  const commandOptions = getBlobCommandOptions();

  if (!commandOptions) {
    return null;
  }

  const { blobs } = await list({
    ...commandOptions,
    limit,
    prefix,
  });

  return blobs.map((blob) => toBlobObjectSummary(blob));
};

export const uploadBlobObject = async ({
  body,
  key,
  ...options
}: BlobUploadOptions): Promise<StorageObjectSummary | null> => {
  const commandOptions = getBlobCommandOptions();

  if (!commandOptions) {
    return null;
  }

  const blob = await put(key, body, {
    ...commandOptions,
    ...options,
    access: options.access,
  });

  return toBlobObjectSummary(blob);
};

export const deleteBlobObjects = async ({
  keys,
}: {
  readonly keys: readonly string[];
}): Promise<boolean> => {
  const commandOptions = getBlobCommandOptions();

  if (!(commandOptions && keys.length > 0)) {
    return false;
  }

  await del([...keys], commandOptions);

  return true;
};

export const deleteBlobObject = async ({
  key,
}: {
  readonly key: string;
}): Promise<boolean> => deleteBlobObjects({ keys: [key] });
