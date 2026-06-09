import "server-only";

import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { StorageBucketSummary, StorageObjectSummary } from "../types.ts";
import { loadR2StorageKeys } from "./keys.ts";

type R2StorageConfig = {
  readonly accessKeyId: string;
  readonly accountId: string;
  readonly bucket: string;
  readonly publicUrl?: string;
  readonly secretAccessKey: string;
};

type R2UploadOptions = {
  readonly body: PutObjectCommandInput["Body"];
  readonly bucket?: string;
  readonly contentType?: string;
  readonly key: string;
};

type R2ListOptions = {
  readonly bucket?: string;
  readonly limit?: number;
  readonly prefix?: string;
};

let cachedR2Client: S3Client | null = null;

const getR2StorageConfig = (): R2StorageConfig | null => {
  const {
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_PUBLIC_URL,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  } = loadR2StorageKeys();

  const configuredRequiredValues = {
    CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_BUCKET_NAME,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  };

  if (Object.values(configuredRequiredValues).every((value) => !value)) {
    return null;
  }

  const missingRequiredKeys = Object.entries(configuredRequiredValues)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingRequiredKeys.length > 0) {
    throw new Error(
      `Cloudflare R2 storage is partially configured. Missing: ${missingRequiredKeys.join(", ")}`
    );
  }

  if (
    !(
      CLOUDFLARE_R2_ACCESS_KEY_ID &&
      CLOUDFLARE_R2_ACCOUNT_ID &&
      CLOUDFLARE_R2_BUCKET_NAME &&
      CLOUDFLARE_R2_SECRET_ACCESS_KEY
    )
  ) {
    throw new Error(
      "Cloudflare R2 storage configuration could not be resolved."
    );
  }

  return {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
    accountId: CLOUDFLARE_R2_ACCOUNT_ID,
    bucket: CLOUDFLARE_R2_BUCKET_NAME,
    publicUrl: CLOUDFLARE_R2_PUBLIC_URL,
    secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  };
};

const getR2Endpoint = (accountId: string): string =>
  `https://${accountId}.r2.cloudflarestorage.com`;

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
    endpoint: getR2Endpoint(config.accountId),
    forcePathStyle: true,
    region: "auto",
  });

  return cachedR2Client;
};

const resolveR2Bucket = (bucket?: string): string | null =>
  bucket ?? getR2StorageConfig()?.bucket ?? null;

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
