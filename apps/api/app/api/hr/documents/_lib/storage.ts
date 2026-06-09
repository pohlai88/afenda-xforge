import type { StorageObjectSummary } from "@repo/storage";
import type { GetBlobResult } from "@repo/storage/blob";
import { get, uploadBlobObject } from "@repo/storage/blob";

export class DocumentsManagementBlobStorageError extends Error {
  constructor(action: "download" | "upload", cause?: unknown) {
    super(`Documents Management blob storage ${action} failed.`, {
      cause,
    });
    this.name = "DocumentsManagementBlobStorageError";
  }
}

type DocumentsManagementBlobUploadInput = Readonly<{
  body: Blob;
  contentType?: string;
  key: string;
}>;

type DocumentsManagementBlobDownloadInput = Readonly<{
  key: string;
}>;

type DocumentsManagementBlobClient = {
  download(
    input: DocumentsManagementBlobDownloadInput
  ): Promise<GetBlobResult | null>;
  upload(
    input: DocumentsManagementBlobUploadInput
  ): Promise<StorageObjectSummary | null>;
};

const defaultDocumentsManagementBlobClient: DocumentsManagementBlobClient = {
  download({ key }) {
    return get(key, { access: "private" });
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
};

let documentsManagementBlobClient = defaultDocumentsManagementBlobClient;

export const uploadDocumentsManagementBlob = async (
  input: DocumentsManagementBlobUploadInput
): Promise<StorageObjectSummary | null> => {
  try {
    return await documentsManagementBlobClient.upload(input);
  } catch (error) {
    throw new DocumentsManagementBlobStorageError("upload", error);
  }
};

export const downloadDocumentsManagementBlob = async (
  input: DocumentsManagementBlobDownloadInput
): Promise<GetBlobResult | null> => {
  try {
    return await documentsManagementBlobClient.download(input);
  } catch (error) {
    throw new DocumentsManagementBlobStorageError("download", error);
  }
};

export const setDocumentsManagementBlobClientForTesting = (
  client: DocumentsManagementBlobClient
): void => {
  documentsManagementBlobClient = client;
};

export const resetDocumentsManagementBlobClientForTesting = (): void => {
  documentsManagementBlobClient = defaultDocumentsManagementBlobClient;
};
