/** Phase 1 — contextual audit inspector scope (app wiring only). */

export type WorkspaceAuditEvidenceScope = {
  module?: string;
  route?: string;
  surface?: string;
  subjectId?: string;
  subjectType?: string;
  targetId?: string;
  targetType?: string;
};

export type WorkspaceAuditEvidenceOutcome = "success" | "failure" | "denied";

export type WorkspaceAuditEvidenceChange = {
  change?: "added" | "removed" | "changed";
  field: string;
  newValue?: unknown;
  oldValue?: unknown;
};

export type WorkspaceAuditEvidenceEvent = {
  id: string;
  action: string;
  actorId: string;
  actorRole: string | null;
  actorType: string;
  approvalId: string | null;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  channel: string | null;
  companyId: string | null;
  createdAt: string;
  diff: readonly WorkspaceAuditEvidenceChange[];
  grantId: string | null;
  metadata: Record<string, unknown>;
  module: string | null;
  occurredAt: string;
  operationId: string | null;
  outcome: WorkspaceAuditEvidenceOutcome;
  policyReference: string | null;
  reason: string;
  requestId: string;
  route: string | null;
  subjectId: string | null;
  subjectType: string | null;
  summary: string;
  surface: string | null;
  targetDisplayName: string | null;
  targetId: string;
  targetType: string;
  tenantId: string;
};

export type WorkspaceAuditEvidenceListResult = {
  items: readonly WorkspaceAuditEvidenceEvent[];
  limit: number;
  offset: number;
  total: number;
};

/** Docked panel compartment id (bottom activity stream | right 7W1H detail). */
export type WorkspaceAuditEvidenceSheet = "bottom" | "right";

export type WorkspaceAuditEvidencePanel = WorkspaceAuditEvidenceSheet;
