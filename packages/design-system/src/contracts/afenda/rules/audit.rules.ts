import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const AUDIT = "audit" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_AUDIT_RULES = [
  {
    id: "audit.event-completeness",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "mutation-flow", "command-handler", "admin-action"],
    rationale:
      "Enterprise audit records must be complete enough to support accountability, investigation, and compliance review.",
    requirement:
      "Audit events must include actor, action, target, tenant, company, timestamp, result, and correlation context where applicable.",
    remediation:
      "Emit structured audit events with required metadata instead of free-form log messages.",
    references: ["AFENDA:audit-contract", "XFORGE:audit-events"],
    enforcement: HYBRID,
  },
  {
    id: "audit.actor-context",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "impersonation", "support-session", "admin-action"],
    rationale:
      "Audit trails must identify who acted and whether the action occurred through support, impersonation, or elevated access.",
    requirement:
      "Audit events must record the effective actor and the original actor when impersonation or delegated access is active.",
    remediation:
      "Capture actor id, effective actor id, impersonation/session context, and access mode on sensitive audit events.",
    references: ["AFENDA:audit-contract", "XFORGE:audit-events", "XFORGE:permission-pipeline"],
    enforcement: MANUAL,
  },
  {
    id: "audit.tenant-company-scope",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "tenant-action", "company-action", "mutation-flow"],
    rationale:
      "Multi-tenant investigations require knowing exactly which tenant and company scope a write affected.",
    requirement:
      "Audit events for scoped business records must include tenant and company identifiers.",
    remediation:
      "Resolve and attach tenant id and company id before writing audit events for scoped actions.",
    references: ["AFENDA:audit-contract", "XFORGE:tenant-company-scope"],
    enforcement: HYBRID,
  },
  {
    id: "audit.target-identity",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "record-mutation", "bulk-action", "permission-change"],
    rationale:
      "Audit records without target identity cannot reliably answer what changed.",
    requirement:
      "Audit events must identify the affected resource type and target id or stable target reference.",
    remediation:
      "Include resource type, target id, parent scope, and affected count for bulk operations.",
    references: ["AFENDA:audit-contract", "XFORGE:audit-events"],
    enforcement: HYBRID,
  },
  {
    id: "audit.reason-capture",
    category: AUDIT,
    severity: WARNING,
    appliesTo: ["admin-action", "permission-change", "impersonation", "destructive-action", "override"],
    rationale:
      "High-impact administrative actions often require an operator reason for later review.",
    requirement:
      "Sensitive or exceptional actions should capture a human-readable reason where policy requires it.",
    remediation:
      "Prompt for a reason before executing overrides, impersonation, permission changes, or destructive administrative actions.",
    references: ["AFENDA:audit-contract", "AFENDA:security-ui-contract"],
    enforcement: MANUAL,
  },
  {
    id: "audit.correlation-id",
    category: AUDIT,
    severity: WARNING,
    appliesTo: ["audit-event", "mutation-flow", "request", "background-job", "webhook"],
    rationale:
      "Correlation ids connect UI actions, command handlers, background jobs, and external side effects during investigation.",
    requirement:
      "Audit events should include a correlation id or request id when the action spans multiple systems or effects.",
    remediation:
      "Propagate correlation ids from request entry through command handlers, audit events, jobs, webhooks, and notifications.",
    references: ["AFENDA:audit-contract", "AFENDA:observability-contract"],
    enforcement: MANUAL,
  },
  {
    id: "audit.sensitive-data-redaction",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "audit-message", "diff", "metadata", "log-preview"],
    forbidden: ["secret in audit event", "password in audit metadata", "token in audit diff", "full credential in audit trail"],
    rationale:
      "Audit systems must not become a secondary leak path for secrets or sensitive personal data.",
    requirement:
      "Audit events must redact or hash sensitive values and avoid storing raw credentials.",
    remediation:
      "Store safe identifiers, redacted values, hashes, or change summaries instead of raw secrets.",
    references: ["AFENDA:audit-contract", "AFENDA:security-contract"],
    enforcement: HYBRID,
  },
  {
    id: "audit.immutability",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "audit-store", "audit-log", "admin-action"],
    forbidden: ["audit event update", "audit event delete", "mutable audit trail"],
    rationale:
      "Audit trails must not be editable after creation or they cannot be trusted during investigation.",
    requirement:
      "Audit events must be append-only and must not be edited or deleted through normal application flows.",
    remediation:
      "Use append-only audit storage and correction events instead of updating or deleting existing audit records.",
    references: ["AFENDA:audit-contract", "XFORGE:audit-events"],
    enforcement: MANUAL,
  },
  {
    id: "audit.success-failure-result",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "mutation-flow", "command-handler", "permission-check"],
    rationale:
      "Investigations need to distinguish successful writes, denied attempts, validation failures, and execution failures.",
    requirement:
      "Audit events must record outcome status for audited actions.",
    remediation:
      "Include result values such as success, denied, validation_failed, conflict, failed, partial_success, or rolled_back.",
    references: ["AFENDA:audit-contract", "XFORGE:audit-events"],
    enforcement: MANUAL,
  },
  {
    id: "audit.post-commit-order",
    category: AUDIT,
    severity: ERROR,
    appliesTo: ["audit-event", "mutation-flow", "post-commit-effect", "notification", "webhook"],
    rationale:
      "Audit events must represent what actually happened and should precede external side effects where required.",
    requirement:
      "Audit records for successful mutations must be written after execution succeeds and before dependent post-commit effects where policy requires traceability.",
    remediation:
      "Write audit events after mutation success, then run notifications, webhooks, cache invalidation, and background effects.",
    references: ["AFENDA:audit-contract", "XFORGE:mutation-pipeline"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
