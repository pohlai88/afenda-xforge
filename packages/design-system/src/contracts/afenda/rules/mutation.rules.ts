import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const MUTATION = "mutation" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_MUTATION_RULES = [
  {
    id: "mutation.pipeline-order",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["mutation-flow", "server-action", "command-handler", "api-route"],
    rationale:
      "Enterprise writes must pass through a deterministic security, validation, execution, and audit lifecycle.",
    requirement:
      "Mutations must follow the canonical pipeline: authenticate, resolve tenant, verify membership, resolve company, verify grant, validate input, enforce permission, execute, audit, then run post-commit effects.",
    remediation:
      "Route writes through governed command handlers or server actions that implement the XForge mutation pipeline.",
    references: ["AFENDA:mutation-contract", "XFORGE:mutation-pipeline"],
    enforcement: MANUAL,
  },
  {
    id: "mutation.server-validation-finality",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["mutation-flow", "server-action", "form-submit", "api-route"],
    rationale:
      "Client validation improves UX but cannot be the final authority for enterprise writes.",
    requirement:
      "Mutations must perform final schema, permission, and business validation on the server before execution.",
    remediation:
      "Keep client validation as affordance only and validate again inside the server action, API route, or command handler.",
    references: ["AFENDA:mutation-contract", "AFENDA:form-validation-contract", "XFORGE:mutation-pipeline"],
    enforcement: HYBRID,
  },
  {
    id: "mutation.destructive-confirmation",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["delete-action", "archive-action", "destructive-action", "irreversible-mutation"],
    rationale:
      "Destructive or irreversible mutations require clear user intent before execution.",
    requirement:
      "Destructive or irreversible mutations must require confirmation, review, or a safe undo path.",
    remediation:
      "Use a governed confirmation flow that names the target, consequence, and recovery path where available.",
    references: ["AFENDA:mutation-contract", "WCAG:3.3.4", "XFORGE:mutation-pipeline"],
    enforcement: MANUAL,
  },
  {
    id: "mutation.double-submit-protection",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["submit-button", "server-action", "mutation-flow", "payment-like-action"],
    rationale:
      "Duplicate enterprise writes can create duplicate records, repeated side effects, or inconsistent audit trails.",
    requirement:
      "Mutations must guard against accidental duplicate submission or repeated execution.",
    remediation:
      "Use scoped pending state, idempotency keys for high-impact writes, and server-side duplicate protection.",
    references: ["AFENDA:mutation-contract", "AFENDA:form-state-contract"],
    enforcement: HYBRID,
  },
  {
    id: "mutation.idempotency-required",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["payment-like-action", "import", "bulk-action", "server-action", "api-route", "external-side-effect"],
    rationale:
      "High-impact or externally visible writes must tolerate retries without creating duplicate records or repeated side effects.",
    requirement:
      "High-impact mutations must use an idempotency key, uniqueness guard, or equivalent server-side duplicate protection.",
    remediation:
      "Generate and persist idempotency keys for retryable writes, imports, payments, webhook-triggering actions, and bulk operations.",
    references: ["AFENDA:mutation-contract", "XFORGE:mutation-pipeline"],
    enforcement: HYBRID,
  },
  {
    id: "mutation.audit-event-required",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["mutation-flow", "command-handler", "admin-action", "permission-change", "destructive-action"],
    rationale:
      "Enterprise writes need auditable records for accountability, support, and incident investigation.",
    requirement:
      "High-impact mutations must emit audit events after successful execution.",
    remediation:
      "Write audit events with actor, tenant, company, target, action, and result metadata after the mutation succeeds.",
    references: ["AFENDA:mutation-contract", "AFENDA:audit-contract", "XFORGE:audit-events"],
    enforcement: MANUAL,
  },
  {
    id: "mutation.post-commit-effects-only",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["mutation-flow", "email", "notification", "webhook", "revalidation", "background-job"],
    forbidden: ["side effect before mutation success", "audit before failed validation", "notification before commit"],
    rationale:
      "External side effects must not fire for failed or unauthorized mutations.",
    requirement:
      "Post-commit effects must run only after the mutation succeeds and audit is recorded where required.",
    remediation:
      "Move notifications, webhooks, cache invalidation, and background jobs after successful execution and audit.",
    references: ["AFENDA:mutation-contract", "XFORGE:mutation-pipeline"],
    enforcement: MANUAL,
  },
  {
    id: "mutation.optimistic-reconciliation",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["optimistic-update", "mutation-flow", "table", "list", "detail-panel"],
    rationale:
      "Optimistic UI must not leave enterprise users with a false view of persisted state.",
    requirement:
      "Optimistic mutations must reconcile server rejection, conflict, or partial failure.",
    remediation:
      "Rollback affected UI, mark failed items clearly, restore prior values, or provide retry and conflict-resolution guidance.",
    references: ["AFENDA:mutation-contract", "AFENDA:feedback-contract"],
    enforcement: MANUAL,
  },
  {
    id: "mutation.conflict-resolution",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["record-edit", "inline-edit", "wizard", "server-action", "mutation-flow"],
    rationale:
      "Enterprise records may be edited by multiple users or systems, so stale writes must not silently overwrite newer data.",
    requirement:
      "Mutations that update existing records must detect stale or conflicting writes where concurrent edits are possible.",
    remediation:
      "Use version fields, updatedAt checks, optimistic concurrency, or conflict review flows before overwriting current data.",
    references: ["AFENDA:mutation-contract", "XFORGE:repository-boundary"],
    enforcement: MANUAL,
  },
  {
    id: "mutation.preserve-input-on-error",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["form-submit", "server-action", "wizard", "mutation-flow"],
    rationale:
      "Users should not lose entered enterprise data because validation or execution failed.",
    requirement:
      "Mutation failures must preserve submitted values unless preserving them would expose sensitive data.",
    remediation:
      "Return field errors with submitted values, preserve wizard state, and reset only after confirmed success.",
    references: ["AFENDA:mutation-contract", "AFENDA:form-validation-contract"],
    enforcement: HYBRID,
  },
  {
    id: "mutation.permission-fail-closed",
    category: MUTATION,
    severity: ERROR,
    appliesTo: ["server-action", "command-handler", "api-route", "mutation-flow"],
    forbidden: ["permission fallback allow", "silent permission bypass", "client permission as final authority"],
    rationale:
      "Permission uncertainty must not result in a successful enterprise write.",
    requirement:
      "Mutations must fail closed when tenant, company, membership, grant, or permission cannot be verified.",
    remediation:
      "Treat missing or ambiguous scope as denied and return a governed authorization error.",
    references: ["AFENDA:mutation-contract", "XFORGE:permission-pipeline", "XFORGE:tenant-company-scope"],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
