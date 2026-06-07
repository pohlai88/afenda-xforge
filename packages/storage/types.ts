export type StorageProviderKind = "blob" | "r2" | "supabase";

export type StorageBucketSummary = {
  readonly name: string;
  readonly provider: StorageProviderKind;
  readonly public?: boolean;
};

export type StorageObjectSummary = {
  readonly contentType?: string;
  readonly etag?: string;
  readonly lastModified?: string;
  readonly key: string;
  readonly provider: StorageProviderKind;
  readonly size?: number;
  readonly url?: string | null;
};
