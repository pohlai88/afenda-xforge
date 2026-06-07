import type { PaginationMeta, PaginationParams } from "@repo/shared";

export type MasterDataEntity = string;

export type SyncAction = "create" | "update" | "delete" | "restore";

export type ChangeRecord = {
  id: string;
  action: SyncAction;
  changes: Record<string, { old: unknown; new: unknown }>;
  createdAt: Date;
  data: Record<string, unknown>;
  entity: MasterDataEntity;
  entityId: string;
  sourceModule: string;
  tenantId: string;
  userId: string;
  version: number;
};

export type MasterDataQuery = PaginationParams & {
  category?: string;
  code?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  includeDeleted?: boolean;
  name?: string;
  status?: string;
  tenantId: string;
};

export type BulkOperation<TRecord> = {
  action: "create" | "update" | "upsert" | "delete";
  records: TRecord[];
  tenantId: string;
  userId: string;
};

export type BulkResult = {
  total: number;
  succeeded: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
};

export type SyncConflict = {
  entity: MasterDataEntity;
  entityId: string;
  field: string;
  sourceModule: string;
  sourceValue: unknown;
  targetModule: string;
  targetValue: unknown;
  resolvedAt?: Date;
  resolution?: "source_wins" | "target_wins" | "manual";
};

export type SyncEvent<TData = unknown> = {
  action: SyncAction;
  data: TData;
  entity: MasterDataEntity;
  sourceModule: string;
  tenantId: string;
  timestamp: string;
  userId: string;
  version: number;
};

export type SyncResult = {
  action: SyncAction;
  conflictResolution?: "source_wins" | "target_wins" | "merged";
  entity: MasterDataEntity;
  entityId: string;
  error?: string;
  sourceModule: string;
  success: boolean;
};

export type EntityList<TRecord> = Readonly<{
  items: readonly TRecord[];
  meta: PaginationMeta;
}>;
