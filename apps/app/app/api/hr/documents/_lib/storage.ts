import type { StorageObjectSummary } from "@repo/storage";
import { get, loadBlobStorageKeys, uploadBlobObject } from "@repo/storage/blob";
import type { HandleUploadBody } from "@repo/storage/blob/client";
import { handleUpload } from "@repo/storage/blob/client";
import { resolveObjectStorageProviderKind } from "@repo/storage/provider";
import {
  createR2SignedUploadSession,
  downloadR2Object,
  uploadR2Object,
} from "@repo/storage/r2";
import {
  createSupabaseSignedUploadSession,
  downloadSupabaseObject,
  uploadSupabaseObject,
} from "@repo/storage/supabase";
import type { StorageProviderKind } from "@repo/storage/types";

export class DocumentsManagementBlobStorageError extends Error {
  constructor(
    action: "download" | "upload" | "upload-session",
    cause?: unknown
  ) {
    super(`Documents Management storage ${action} failed.`, {
      cause,
    });
    this.name = "DocumentsManagementBlobStorageError";
  }
}

type DocumentsManagementStorageUploadInput = Readonly<{
  body: Blob;
  contentType?: string;
  key: string;
}>;

type DocumentsManagementStorageDownloadInput = Readonly<{
  key: string;
}>;

export type DocumentsManagementStorageDownloadResult = {
  readonly blob: {
    readonly cacheControl?: string;
    readonly contentDisposition?: string;
    readonly contentType?: string;
    readonly downloadUrl?: string;
    readonly etag?: string;
    readonly pathname: string;
    readonly size?: number;
    readonly uploadedAt?: Date;
    readonly url?: string;
  };
  readonly headers: Headers;
  readonly statusCode: 200;
  readonly stream: ReadableStream<Uint8Array>;
};

type DocumentsManagementStorageUploadTokenInput = Readonly<{
  body: HandleUploadBody;
  request: Request;
  onBeforeGenerateToken: Parameters<
    typeof handleUpload
  >[0]["onBeforeGenerateToken"];
  onUploadCompleted?: Parameters<
    NonNullable<Parameters<typeof handleUpload>[0]["onUploadCompleted"]>
  >[0] extends infer T
    ? (body: T) => Promise<void>
    : never;
}>;

type DocumentsManagementStorageUploadTokenResult = Awaited<
  ReturnType<typeof handleUpload>
>;

export type DocumentsManagementStorageUploadSession =
  | {
      readonly bucket: string;
      readonly key: string;
      readonly provider: "r2";
      readonly type: "r2.generate-client-upload-session";
      readonly uploadUrl: string;
    }
  | {
      readonly bucket: string;
      readonly path: string;
      readonly provider: "supabase";
      readonly type: "supabase.generate-client-upload-session";
      readonly token: string;
    };

type DocumentsManagementStorageClient = {
  download(
    input: DocumentsManagementStorageDownloadInput
  ): Promise<DocumentsManagementStorageDownloadResult | null>;
  upload(
    input: DocumentsManagementStorageUploadInput
  ): Promise<StorageObjectSummary | null>;
  uploadToken(
    input: DocumentsManagementStorageUploadTokenInput
  ): Promise<DocumentsManagementStorageUploadTokenResult | null>;
};

const documentsManagementBlobClient: DocumentsManagementStorageClient = {
  download({ key }) {
    return get(key, {
      access: "private",
    }) as Promise<DocumentsManagementStorageDownloadResult | null>;
  },
  upload({ body, contentType, key }) {
    return uploadBlobObject({
      access: "private",
      addRandomSuffix: true,
      body,
      contentType,
      key,
    });
  },
  uploadToken({ body, request, onBeforeGenerateToken, onUploadCompleted }) {
    const { BLOB_READ_WRITE_TOKEN } = loadBlobStorageKeys();

    if (!BLOB_READ_WRITE_TOKEN) {
      return Promise.resolve(null);
    }

    return handleUpload({
      body,
      request,
      token: BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken,
      onUploadCompleted,
    });
  },
};

const resolveDocumentsManagementStorageProvider =
  (): StorageProviderKind | null =>
    resolveObjectStorageProviderKind();

const ensureBlobProvider = (): boolean =>
  resolveDocumentsManagementStorageProvider() === "blob";

export const uploadDocumentsManagementBlob = async (
  input: DocumentsManagementStorageUploadInput
): Promise<StorageObjectSummary | null> => {
  try {
    const provider = resolveDocumentsManagementStorageProvider();

    if (!provider) {
      return null;
    }

    switch (provider) {
      case "blob":
        return await documentsManagementBlobClient.upload(input);
      case "supabase":
        return await uploadSupabaseObject({
          body: input.body,
          contentType: input.contentType,
          key: input.key,
        });
      case "r2":
        return await uploadR2Object({
          body: input.body,
          contentType: input.contentType,
          key: input.key,
        });
      default:
        return null;
    }
  } catch (error) {
    throw new DocumentsManagementBlobStorageError("upload", error);
  }
};

export const createDocumentsManagementStorageUploadSession = async (
  input: Readonly<{
    key: string;
  }>
): Promise<DocumentsManagementStorageUploadSession | null> => {
  try {
    const provider = resolveDocumentsManagementStorageProvider();

    if (!provider) {
      return null;
    }

    switch (provider) {
      case "blob":
        return null;
      case "supabase": {
        const session = await createSupabaseSignedUploadSession({
          key: input.key,
        });

        if (session) {
          return {
            bucket: session.bucket,
            path: session.path,
            provider: session.provider,
            type: "supabase.generate-client-upload-session",
            token: session.token,
          };
        }

        return null;
      }
      case "r2": {
        const session = await createR2SignedUploadSession({
          key: input.key,
        });

        if (session) {
          return {
            bucket: session.bucket,
            key: session.key,
            provider: session.provider,
            type: "r2.generate-client-upload-session",
            uploadUrl: session.uploadUrl,
          };
        }

        return null;
      }
      default:
        return null;
    }
  } catch (error) {
    throw new DocumentsManagementBlobStorageError("upload-session", error);
  }
};

export const uploadDocumentsManagementBlobToken = async (
  input: DocumentsManagementStorageUploadTokenInput
): Promise<DocumentsManagementStorageUploadTokenResult | null> => {
  try {
    if (!ensureBlobProvider()) {
      return null;
    }

    return await documentsManagementBlobClient.uploadToken(input);
  } catch (error) {
    throw new DocumentsManagementBlobStorageError("upload-session", error);
  }
};

export const downloadDocumentsManagementBlob = async (
  input: DocumentsManagementStorageDownloadInput
): Promise<DocumentsManagementStorageDownloadResult | null> => {
  try {
    const provider = resolveDocumentsManagementStorageProvider();

    if (!provider) {
      return null;
    }

    switch (provider) {
      case "blob":
        return await documentsManagementBlobClient.download(input);
      case "supabase":
        return (await downloadSupabaseObject(
          input
        )) as DocumentsManagementStorageDownloadResult | null;
      case "r2":
        return (await downloadR2Object(
          input
        )) as DocumentsManagementStorageDownloadResult | null;
      default:
        return null;
    }
  } catch (error) {
    throw new DocumentsManagementBlobStorageError("download", error);
  }
};
