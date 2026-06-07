export type AuditRecordMap = Record<string, unknown>;

export type AuditChange = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

export type AuditEvent = {
  id: string;
  tenantId: string;
  companyId?: string | null;
  grantId?: string | null;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  before: AuditRecordMap;
  after: AuditRecordMap;
  reason: string;
  requestId: string;
  metadata?: AuditRecordMap | null;
  createdAt: Date;
};

export type AuditEventInput = Omit<AuditEvent, "id" | "createdAt">;

export type AuditWriter = {
  write: (event: AuditEvent) => Promise<void> | void;
};

export type AuditQueryOptions = {
  tenantId: string;
  companyId?: string | null;
  actorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  requestId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
};

export type AuditQueryResult = {
  events: AuditEvent[];
  total: number;
};

export type AuditExportFormat = "json" | "csv";
