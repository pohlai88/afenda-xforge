import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_AGENT_GOVERNANCE,
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_COMPLIANCE,
  AFENDA_GOV_CONTENT,
  AFENDA_GOV_COPY,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_DECISION_SUPPORT,
  AFENDA_GOV_EMPTY_STATE,
  AFENDA_GOV_FEEDBACK,
  AFENDA_GOV_LOCALE,
  AFENDA_GOV_MESSAGE_CATALOG,
  AFENDA_GOV_MUTATION,
  AFENDA_GOV_OBSERVABILITY,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_PRIVACY,
  AFENDA_GOV_SECURITY,
  AFENDA_GOV_SECURITY_UI,
  AFENDA_GOV_STATUS_TONE,
  AFENDA_GOV_TENANT_CONTEXT,
} from "../catalogs/governance-reference.catalog";

const COPY = "copy" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_COPY_RULES = [
  {
    id: "copy.action-specific-label",
    category: COPY,
    severity: ERROR,
    appliesTo: ["button", "link", "menu-item", "toolbar-action", "row-action"],
    forbidden: ["Click here", "Submit", "OK", "Continue without context", "Cancel without context"],
    rationale:
      "Specific action copy reduces ambiguity and makes controls understandable out of context.",
    requirement:
      "Action labels must name the action, destination, or object clearly.",
    remediation:
      "Use labels such as Save API key, Create invoice, View audit log, or Discard draft.",
    references: [AFENDA_GOV_COPY, "WCAG:2.4.4", "WCAG:2.5.3"],
    enforcement: HYBRID,
  },
  {
    id: "copy.scope-aware-action-copy",
    category: COPY,
    severity: ERROR,
    appliesTo: ["admin-action", "bulk-action", "approval-action", "export", "mutation-confirmation"],
    rationale:
      "Enterprise action copy is unsafe when users cannot tell which tenant, company, workspace, or records will be affected.",
    requirement:
      "High-impact action copy must include affected scope and object summary before execution.",
    remediation:
      "Include tenant/company/workspace, selected count, object names where safe, and impact summary in confirmations.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_MUTATION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.destructive-action-clarity",
    category: COPY,
    severity: ERROR,
    appliesTo: ["delete-action", "archive-action", "destructive-dialog", "mutation-confirmation"],
    rationale:
      "Destructive decisions require explicit consequence copy before users commit.",
    requirement:
      "Destructive action copy must name the target, consequence, reversibility, and affected scope.",
    remediation:
      "Include target name, tenant/company scope where applicable, irreversible impact, and undo or recovery availability.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_MUTATION,
      AFENDA_GOV_TENANT_CONTEXT,
      "WCAG:3.3.4",
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.permission-denied-explanation",
    category: COPY,
    severity: ERROR,
    appliesTo: ["permission-gate", "disabled-action", "empty-state", "error-message", "admin-shell"],
    rationale:
      "Permission copy must explain access limits without exposing sensitive policy internals.",
    requirement:
      "Permission-denied and disabled-action copy must state the safe reason category and recovery path.",
    remediation:
      "Explain whether access is unavailable due to role, tenant/company scope, approval state, or system policy, and provide request-access guidance where appropriate.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_SECURITY_UI,
      AFENDA_GOV_PERMISSION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.error-recovery",
    category: COPY,
    severity: ERROR,
    appliesTo: ["error-message", "form-error", "alert", "toast", "error-boundary"],
    forbidden: ["Something went wrong", "Error occurred", "Invalid input without field context"],
    rationale:
      "Enterprise users need error copy that explains what failed and how to recover.",
    requirement:
      "Error copy must identify the failed action, affected object, and next recovery step where possible.",
    remediation:
      "State what failed, include field or object context, and provide retry, correction, support, or escalation guidance.",
    references: [AFENDA_GOV_COPY, AFENDA_GOV_FEEDBACK, "WCAG:3.3.1", "WCAG:3.3.3"],
    enforcement: HYBRID,
  },
  {
    id: "copy.success-message-specificity",
    category: COPY,
    severity: WARNING,
    appliesTo: ["toast", "banner", "inline-feedback", "mutation-result", "sync-status"],
    rationale:
      "Generic success copy does not confirm what changed or whether follow-up is needed.",
    requirement:
      "Success copy should confirm the completed action, affected object, and next step where useful.",
    remediation:
      "Use copy such as Invoice approved, API key saved, 24 employees imported, or Report export started.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_FEEDBACK,
      AFENDA_GOV_MUTATION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.loading-operation-specific",
    category: COPY,
    severity: WARNING,
    appliesTo: ["loading-state", "spinner", "skeleton", "submit-button", "async-status"],
    forbidden: ["generic loading copy for long-running or ambiguous operations"],
    rationale:
      "Operation-specific loading copy prevents duplicate actions and reduces uncertainty in long-running workflows.",
    requirement:
      "Loading and pending copy must describe the operation when context is not obvious.",
    remediation:
      "Use copy such as Loading invoices, Saving company profile, Syncing permissions, or Generating report.",
    references: [AFENDA_GOV_COPY, AFENDA_GOV_FEEDBACK, "WCAG:4.1.3"],
    enforcement: HYBRID,
  },
  {
    id: "copy.empty-state-guidance",
    category: COPY,
    severity: WARNING,
    appliesTo: ["empty-state", "table", "list", "search-results", "dashboard"],
    rationale:
      "Empty-state copy should explain whether the state is caused by no data, filters, permissions, or scope.",
    requirement:
      "Empty states must include a concise title, cause-aware explanation, and next action where useful.",
    remediation:
      "Distinguish no data, filtered empty, permission-limited, and scoped empty states with appropriate guidance.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_EMPTY_STATE,
      AFENDA_GOV_TENANT_CONTEXT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.status-label-consistency",
    category: COPY,
    severity: WARNING,
    appliesTo: ["badge", "status", "tag", "workflow-state", "approval-state"],
    rationale:
      "Inconsistent status wording causes operational misinterpretation across modules.",
    requirement:
      "Status copy must use approved domain, workflow, or status-tone vocabulary.",
    remediation:
      "Use canonical labels from the feature contract, workflow contract, or status-tone registry.",
    references: [AFENDA_GOV_COPY, AFENDA_GOV_STATUS_TONE, AFENDA_GOV_DATA_DISPLAY],
    enforcement: HYBRID,
  },
  {
    id: "copy.audit-evidence-copy",
    category: COPY,
    severity: ERROR,
    appliesTo: ["audit-event", "activity-feed", "approval-history", "security-log"],
    rationale:
      "Audit copy must be factual, durable, and useful outside the original UI context.",
    requirement:
      "Audit and activity copy must identify actor, action, target, scope, time, and result without relying on visual context.",
    remediation:
      "Generate audit summaries from structured event fields rather than freeform UI copy.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_AUDIT,
      AFENDA_GOV_OBSERVABILITY,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.legal-and-financial-review",
    category: COPY,
    severity: ERROR,
    appliesTo: ["invoice", "contract", "payment", "policy", "consent", "regulatory-copy"],
    rationale:
      "Legal, financial, and regulated copy must not be changed casually through generic UI copy workflows.",
    requirement:
      "Legal and financial copy must use approved, versioned, reviewable message sources.",
    remediation:
      "Store regulated copy in governed catalogs with owner, version, review status, and effective date.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_LOCALE,
      AFENDA_GOV_COMPLIANCE,
      AFENDA_GOV_AUDIT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.sensitive-data-minimization",
    category: COPY,
    severity: ERROR,
    appliesTo: ["toast", "error-message", "audit-preview", "notification", "empty-state", "support-session"],
    rationale:
      "Copy surfaces can leak sensitive data through errors, notifications, previews, or logs.",
    requirement:
      "User-facing copy must avoid exposing secrets, personal data, tokens, internal policy logic, or unauthorized identifiers.",
    remediation:
      "Use safe summaries, masked values, permission-aware labels, and correlation ids instead of sensitive raw data.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_PRIVACY,
      AFENDA_GOV_SECURITY_UI,
      AFENDA_GOV_PERMISSION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.ai-generated-copy-boundary",
    category: COPY,
    severity: ERROR,
    appliesTo: ["ai-summary", "assistant-message", "generated-description", "recommendation", "decision-support"],
    rationale:
      "AI-generated copy must not appear as verified operational truth without provenance and review boundaries.",
    requirement:
      "Generated copy must distinguish draft, suggestion, summary, or verified system state.",
    remediation:
      "Label generated text, attach source/provenance where applicable, and require confirmation before mutation or audit use.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_AGENT_GOVERNANCE,
      AFENDA_GOV_AUDIT,
      AFENDA_GOV_DECISION_SUPPORT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.localization-safe-composition",
    category: COPY,
    severity: ERROR,
    appliesTo: ["label", "button", "toast", "error-message", "empty-state", "message-template"],
    forbidden: ["string concatenation for translated UI", "English-only sentence assembly", "dynamic word-order assumption"],
    rationale:
      "Translated copy may change word order, grammar, length, plurality, and direction.",
    requirement:
      "Copy must be composed through locale-safe message templates with named parameters.",
    remediation:
      "Use approved message catalog keys, named interpolation values, and plural/select branches instead of string concatenation.",
    references: [
      AFENDA_GOV_COPY,
      AFENDA_GOV_LOCALE,
      AFENDA_GOV_MESSAGE_CATALOG,
    ],
    enforcement: HYBRID,
  },
  {
    id: "copy.no-blame-or-shame",
    category: COPY,
    severity: WARNING,
    appliesTo: ["error-message", "validation-message", "empty-state", "toast", "alert"],
    forbidden: ["You failed", "Invalid because you", "Obviously", "Simply", "Just"],
    rationale:
      "Enterprise copy should be direct and respectful, especially in errors and recovery flows.",
    requirement:
      "User-facing copy must avoid blame, shame, sarcasm, or dismissive wording.",
    remediation:
      "Use neutral wording that describes the system state, required correction, and next action.",
    references: [AFENDA_GOV_COPY, AFENDA_GOV_CONTENT],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
