export type AuditRecordMap = Record<string, unknown>;

export type AuditDiffKind = "added" | "removed" | "changed";

export type AuditActorType =
  | "user"
  | "system"
  | "service"
  | "integration"
  | "agent";

export type AuditOutcome = "success" | "failure" | "denied";

export type AuditChannel =
  | "web"
  | "api"
  | "server_action"
  | "cron"
  | "webhook"
  | "migration";

export type AuditChange = {
  field: string;
  change?: AuditDiffKind;
  oldValue: unknown;
  newValue: unknown;
};

export type AuditEventInput = {
  tenantId: string;
  companyId?: string | null;
  grantId?: string | null;

  actorId: string;
  actorType?: AuditActorType;
  actorRole?: string;

  module?: string;
  surface?: string;
  route?: string;

  subjectType?: string;
  subjectId?: string;

  action: string;
  summary?: string;
  outcome?: AuditOutcome;

  targetType: string;
  targetId: string;
  targetDisplayName?: string;

  reason?: string;
  policyReference?: string;
  approvalId?: string;

  channel?: AuditChannel;
  requestId?: string;
  operationId?: string;

  before?: AuditRecordMap;
  after?: AuditRecordMap;
  diff?: readonly AuditChange[];
  metadata?: AuditRecordMap | null;

  occurredAt?: Date;
};

export type AuditEvent = {
  id: string;
  tenantId: string;
  companyId: string | null;
  grantId: string | null;

  actorId: string;
  actorType: AuditActorType;
  actorRole: string | null;

  module: string | null;
  surface: string | null;
  route: string | null;

  subjectType: string | null;
  subjectId: string | null;

  action: string;
  summary: string;
  outcome: AuditOutcome;

  targetType: string;
  targetId: string;
  targetDisplayName: string | null;

  reason: string;
  policyReference: string | null;
  approvalId: string | null;

  channel: AuditChannel | null;
  requestId: string;
  operationId: string | null;

  before: AuditRecordMap;
  after: AuditRecordMap;
  diff: AuditChange[];
  metadata: AuditRecordMap;

  occurredAt: Date;
  createdAt: Date;
};

export type AuditQueryOptions = {
  tenantId: string;
  companyId?: string | null;

  actorId?: string;
  actorType?: AuditActorType;
  actorRole?: string;

  module?: string;
  surface?: string;
  route?: string;

  subjectType?: string;
  subjectId?: string;

  action?: string;
  summary?: string;
  outcome?: AuditOutcome;

  targetType?: string;
  targetId?: string;
  targetDisplayName?: string;

  channel?: AuditChannel;
  requestId?: string;
  operationId?: string;

  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
};

export type AuditQueryResult = {
  events: AuditEvent[];
  total: number;
};

export type AuditWriter = {
  write: (event: AuditEvent) => Promise<void> | void;
};

export type AuditExportFormat = "json" | "csv";
