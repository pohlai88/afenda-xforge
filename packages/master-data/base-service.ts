import type {
  BulkOperation,
  BulkResult,
  ChangeRecord,
  MasterDataEntity,
  MasterDataQuery,
  SyncAction,
} from "./types.ts";

export class MasterDataError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "MASTER_DATA_ERROR", status = 500) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "MasterDataError";
  }
}

export abstract class BaseMasterDataService<
  TRecord extends { id: string; tenantId: string },
> {
  protected abstract entityName: MasterDataEntity;

  protected abstract findById(
    id: string,
    tenantId: string
  ): Promise<TRecord | null>;
  protected abstract findByCode(
    code: string,
    tenantId: string
  ): Promise<TRecord | null>;
  protected abstract findMany(
    query: MasterDataQuery
  ): Promise<{ data: TRecord[]; total: number }>;
  protected abstract createRecord(
    data: Omit<TRecord, "createdAt" | "id" | "updatedAt">,
    tenantId: string
  ): Promise<TRecord>;
  protected abstract updateRecord(
    id: string,
    data: Partial<TRecord>,
    tenantId: string
  ): Promise<TRecord>;
  protected abstract softDeleteRecord(
    id: string,
    tenantId: string
  ): Promise<TRecord>;
  protected abstract restoreRecord(
    id: string,
    tenantId: string
  ): Promise<TRecord>;

  get(id: string, tenantId: string): Promise<TRecord | null> {
    return this.findById(id, tenantId);
  }

  getByCode(code: string, tenantId: string): Promise<TRecord | null> {
    return this.findByCode(code, tenantId);
  }

  async list(query: MasterDataQuery): Promise<{
    data: TRecord[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 100);
    const { data, total } = await this.findMany({
      ...query,
      page,
      pageSize,
    });

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async create(
    data: Omit<TRecord, "createdAt" | "id" | "updatedAt">,
    context: { source?: string; tenantId: string; userId: string }
  ): Promise<{ changeRecord: ChangeRecord; record: TRecord }> {
    const record = await this.createRecord(data, context.tenantId);
    const changeRecord = this.buildChangeRecord(
      record.id,
      "create",
      {},
      record as Record<string, unknown>,
      context
    );

    return { changeRecord, record };
  }

  async update(
    id: string,
    data: Partial<TRecord>,
    context: { source?: string; tenantId: string; userId: string }
  ): Promise<{ changeRecord: ChangeRecord; record: TRecord }> {
    const existing = await this.findById(id, context.tenantId);
    if (!existing) {
      throw new MasterDataError(
        `${this.entityName} not found: ${id}`,
        "NOT_FOUND",
        404
      );
    }

    const record = await this.updateRecord(id, data, context.tenantId);
    const changes = this.diffRecords(
      existing as Record<string, unknown>,
      record as Record<string, unknown>
    );
    const changeRecord = this.buildChangeRecord(
      id,
      "update",
      changes,
      record as Record<string, unknown>,
      context
    );

    return { changeRecord, record };
  }

  async delete(
    id: string,
    context: { source?: string; tenantId: string; userId: string }
  ): Promise<{ changeRecord: ChangeRecord; record: TRecord }> {
    const record = await this.softDeleteRecord(id, context.tenantId);
    const changeRecord = this.buildChangeRecord(
      id,
      "delete",
      {},
      record as Record<string, unknown>,
      context
    );

    return { changeRecord, record };
  }

  async restore(
    id: string,
    context: { source?: string; tenantId: string; userId: string }
  ): Promise<{ changeRecord: ChangeRecord; record: TRecord }> {
    const record = await this.restoreRecord(id, context.tenantId);
    const changeRecord = this.buildChangeRecord(
      id,
      "restore",
      {},
      record as Record<string, unknown>,
      context
    );

    return { changeRecord, record };
  }

  async bulk(operation: BulkOperation<TRecord>): Promise<BulkResult> {
    const result: BulkResult = {
      total: operation.records.length,
      succeeded: 0,
      failed: 0,
      errors: [],
    };

    for (let index = 0; index < operation.records.length; index++) {
      try {
        const record = operation.records[index];

        switch (operation.action) {
          case "create":
            await this.createRecord(
              record as Omit<TRecord, "createdAt" | "id" | "updatedAt">,
              operation.tenantId
            );
            break;
          case "update":
            await this.updateRecord(record.id, record, operation.tenantId);
            break;
          case "upsert": {
            const existing = await this.findById(record.id, operation.tenantId);
            if (existing) {
              await this.updateRecord(record.id, record, operation.tenantId);
            } else {
              await this.createRecord(
                record as Omit<TRecord, "createdAt" | "id" | "updatedAt">,
                operation.tenantId
              );
            }
            break;
          }
          case "delete":
            await this.softDeleteRecord(record.id, operation.tenantId);
            break;
          default:
            throw new MasterDataError(
              `Unsupported bulk action: ${operation.action}`,
              "INVALID_OPERATION",
              400
            );
        }

        result.succeeded++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          index,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return result;
  }

  protected diffRecords(
    oldRecord: Record<string, unknown>,
    newRecord: Record<string, unknown>
  ): Record<string, { old: unknown; new: unknown }> {
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    const skippedFields = new Set(["createdAt", "updatedAt", "deletedAt"]);

    for (const key of Object.keys(newRecord)) {
      if (skippedFields.has(key)) {
        continue;
      }

      if (JSON.stringify(oldRecord[key]) !== JSON.stringify(newRecord[key])) {
        changes[key] = { old: oldRecord[key], new: newRecord[key] };
      }
    }

    return changes;
  }

  protected buildChangeRecord(
    entityId: string,
    action: SyncAction,
    changes: Record<string, { old: unknown; new: unknown }>,
    data: Record<string, unknown>,
    context: { source?: string; tenantId: string; userId: string }
  ): ChangeRecord {
    return {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
      action,
      changes,
      createdAt: new Date(),
      data,
      entity: this.entityName,
      entityId,
      sourceModule: context.source || "master-data",
      tenantId: context.tenantId,
      userId: context.userId,
      version: typeof data.version === "number" ? data.version : 1,
    };
  }
}
