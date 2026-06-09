import "server-only";

import { Readable } from "node:stream";
import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { StorageBucketSummary, StorageObjectSummary } from "../types.ts";
import { loadR2StorageKeys } from "./keys.ts";

type R2StorageConfig = {
  readonly accessKeyId: string;
  readonly accountId?: string;
  readonly bucket: string;
  readonly endpoint: string;
  readonly publicUrl?: string;
  readonly secretAccessKey: string;
};

type R2UploadOptions = {
  readonly body: PutObjectCommandInput["Body"];
  readonly bucket?: string;
  readonly contentType?: string;
  readonly key: string;
};

type R2DownloadOptions = {
  readonly bucket?: string;
  readonly key: string;
};

type R2ListOptions = {
  readonly bucket?: string;
  readonly limit?: number;
  readonly prefix?: string;
};

type R2SignedUploadSession = {
  readonly bucket: string;
  readonly key: string;
  readonly provider: "r2";
  readonly uploadUrl: string;
};

type R2DownloadResult = {
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

let cachedR2Client: S3Client | null = null;

const getR2StorageConfig = (): R2StorageConfig | null => {
  const {
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_PUBLIC_URL,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    OBJECT_STORAGE_ACCESS_KEY_ID,
    OBJECT_STORAGE_BUCKET,
    OBJECT_STORAGE_ENDPOINT,
    OBJECT_STORAGE_PUBLIC_URL,
    OBJECT_STORAGE_SECRET_ACCESS_KEY,
  } = loadR2StorageKeys();

  const accessKeyId =
    OBJECT_STORAGE_ACCESS_KEY_ID ?? CLOUDFLARE_R2_ACCESS_KEY_ID ?? null;
  const bucket = OBJECT_STORAGE_BUCKET ?? CLOUDFLARE_R2_BUCKET_NAME ?? null;
  const endpoint =
    OBJECT_STORAGE_ENDPOINT ??
    (CLOUDFLARE_R2_ACCOUNT_ID
      ? `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : null);
  const publicUrl = OBJECT_STORAGE_PUBLIC_URL ?? CLOUDFLARE_R2_PUBLIC_URL;
  const secretAccessKey =
    OBJECT_STORAGE_SECRET_ACCESS_KEY ?? CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? null;

  if (!(accessKeyId && bucket && endpoint && secretAccessKey)) {
    if (
      !(
        CLOUDFLARE_R2_ACCESS_KEY_ID ||
        CLOUDFLARE_R2_ACCOUNT_ID ||
        CLOUDFLARE_R2_BUCKET_NAME ||
        CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
        OBJECT_STORAGE_ACCESS_KEY_ID ||
        OBJECT_STORAGE_BUCKET ||
        OBJECT_STORAGE_ENDPOINT ||
        OBJECT_STORAGE_SECRET_ACCESS_KEY
      )
    ) {
      return null;
    }

    const missingRequiredKeys = [
      accessKeyId
        ? null
        : "OBJECT_STORAGE_ACCESS_KEY_ID or CLOUDFLARE_R2_ACCESS_KEY_ID",
      bucket ? null : "OBJECT_STORAGE_BUCKET or CLOUDFLARE_R2_BUCKET_NAME",
      endpoint ? null : "OBJECT_STORAGE_ENDPOINT or CLOUDFLARE_R2_ACCOUNT_ID",
      secretAccessKey
        ? null
        : "OBJECT_STORAGE_SECRET_ACCESS_KEY or CLOUDFLARE_R2_SECRET_ACCESS_KEY",
    ].filter((value): value is string => Boolean(value));

    throw new Error(
      `Cloudflare R2 storage is partially configured. Missing: ${missingRequiredKeys.join(", ")}`
    );
  }

  return {
    accessKeyId,
    accountId: CLOUDFLARE_R2_ACCOUNT_ID,
    bucket,
    endpoint,
    publicUrl,
    secretAccessKey,
  };
};

const createR2StorageResult = ({
  contentType,
  key,
  size,
  stream,
  url,
}: {
  readonly contentType?: string;
  readonly key: string;
  readonly size: number | null;
  readonly stream: ReadableStream<Uint8Array>;
  readonly url?: string;
}): R2DownloadResult => ({
  blob: {
    contentDisposition: undefined,
    contentType,
    etag: "",
    pathname: key,
    size,
    uploadedAt: undefined,
    url,
  },
  headers: new Headers({
    ...(contentType ? { "content-type": contentType } : {}),
    ...(size === null ? {} : { "content-length": String(size) }),
  }),
  statusCode: 200,
  stream,
});

const getR2Endpoint = (config: R2StorageConfig): string => config.endpoint;

export const createR2StorageClient = (): S3Client | null => {
  const config = getR2StorageConfig();

  if (!config) {
    return null;
  }

  cachedR2Client ??= new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: getR2Endpoint(config),
    forcePathStyle: true,
    region: "auto",
  });

  return cachedR2Client;
};

const resolveR2Bucket = (bucket?: string): string | null =>
  bucket ?? getR2StorageConfig()?.bucket ?? null;

const toWebStream = (body: unknown): ReadableStream<Uint8Array> => {
  if (
    body &&
    typeof body === "object" &&
    "transformToWebStream" in body &&
    typeof (body as { transformToWebStream?: () => ReadableStream<Uint8Array> })
      .transformToWebStream === "function"
  ) {
    return (
      body as { transformToWebStream: () => ReadableStream<Uint8Array> }
    ).transformToWebStream();
  }

  if (body instanceof ReadableStream) {
    return body as ReadableStream<Uint8Array>;
  }

  if (
    body &&
    typeof body === "object" &&
    "pipe" in body &&
    typeof (body as NodeJS.ReadableStream).pipe === "function"
  ) {
    return Readable.toWeb(body as Readable) as ReadableStream<Uint8Array>;
  }

  throw new Error(
    "Cloudflare R2 object body could not be converted to a stream."
  );
};

export const listR2Buckets = async (): Promise<
  StorageBucketSummary[] | null
> => {
  const client = createR2StorageClient();

  if (!client) {
    return null;
  }

  const { Buckets } = await client.send(new ListBucketsCommand({}));

  return (
    Buckets?.map((bucket: { Name?: string | null }) => ({
      name: bucket.Name ?? "",
      provider: "r2",
    })) ?? null
  );
};

export const listR2Objects = async ({
  bucket,
  limit,
  prefix,
}: R2ListOptions = {}): Promise<StorageObjectSummary[] | null> => {
  const client = createR2StorageClient();
  const resolvedBucket = resolveR2Bucket(bucket);

  if (!(client && resolvedBucket)) {
    return null;
  }

  const { Contents } = await client.send(
    new ListObjectsV2Command({
      Bucket: resolvedBucket,
      MaxKeys: limit,
      Prefix: prefix,
    })
  );

  return (
    Contents?.map(
      (object: {
        ETag?: string;
        Key?: string;
        LastModified?: Date;
        Size?: number;
      }) => ({
        etag: object.ETag?.replaceAll('"', ""),
        key: object.Key ?? "",
        lastModified: object.LastModified?.toISOString(),
        provider: "r2",
        size: object.Size,
      })
    ) ?? []
  );
};

export const createR2SignedUploadSession = async ({
  bucket,
  key,
  expiresIn = 3600,
}: {
  readonly bucket?: string;
  readonly expiresIn?: number;
  readonly key: string;
}): Promise<R2SignedUploadSession | null> => {
  const client = createR2StorageClient();
  const resolvedBucket = resolveR2Bucket(bucket);

  if (!(client && resolvedBucket)) {
    return null;
  }

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: resolvedBucket,
      Key: key,
    }),
    {
      expiresIn,
    }
  );

  return {
    bucket: resolvedBucket,
    key,
    provider: "r2",
    uploadUrl,
  };
};

export const uploadR2Object = async ({
  body,
  bucket,
  contentType,
  key,
}: R2UploadOptions): Promise<StorageObjectSummary | null> => {
  const client = createR2StorageClient();
  const resolvedBucket = resolveR2Bucket(bucket);

  if (!(client && resolvedBucket)) {
    return null;
  }

  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: resolvedBucket,
      ContentType: contentType,
      Key: key,
    })
  );

  return {
    key,
    provider: "r2",
    url: getR2ObjectPublicUrl({ bucket: resolvedBucket, key }) ?? undefined,
  };
};

export const downloadR2Object = async ({
  bucket,
  key,
}: R2DownloadOptions): Promise<R2DownloadResult | null> => {
  const client = createR2StorageClient();
  const resolvedBucket = resolveR2Bucket(bucket);

  if (!(client && resolvedBucket)) {
    return null;
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: resolvedBucket,
      Key: key,
    })
  );

  if (!response.Body) {
    return null;
  }

  const stream = toWebStream(response.Body);
  const size = response.ContentLength ?? null;

  return createR2StorageResult({
    contentType: response.ContentType ?? undefined,
    key,
    size,
    stream,
    url: getR2ObjectPublicUrl({ bucket: resolvedBucket, key }) ?? undefined,
  });
};

export const deleteR2Object = async ({
  bucket,
  key,
}: {
  readonly bucket?: string;
  readonly key: string;
}): Promise<boolean> => {
  const client = createR2StorageClient();
  const resolvedBucket = resolveR2Bucket(bucket);

  if (!(client && resolvedBucket)) {
    return false;
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: resolvedBucket,
      Key: key,
    })
  );

  return true;
};

export const getR2ObjectPublicUrl = ({
  bucket,
  key,
}: {
  readonly bucket?: string;
  readonly key: string;
}): string | null => {
  const config = getR2StorageConfig();
  const resolvedBucket = bucket ?? config?.bucket ?? null;

  if (!(config && resolvedBucket)) {
    return null;
  }

  if (config.publicUrl) {
    return new URL(
      key,
      `${config.publicUrl.replace(/\/$/, "")}/${resolvedBucket}/`
    ).toString();
  }

  return null;
};
