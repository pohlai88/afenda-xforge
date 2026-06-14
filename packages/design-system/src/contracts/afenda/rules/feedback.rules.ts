import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_FEEDBACK,
  AFENDA_GOV_FORM_STATE,
  XFORGE_GOV_MUTATION_PIPELINE,
} from "../catalogs/governance-reference.catalog";

const FEEDBACK = "feedback" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_FEEDBACK_RULES = [
  {
    id: "feedback.async-operation-state",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["mutation-flow", "server-action", "form", "button", "data-fetch"],
    rationale:
      "Users need clear feedback when enterprise operations are pending, successful, failed, or recoverable.",
    requirement:
      "Async operations must expose pending, success, error, and recovery states where the operation affects user work.",
    remediation:
      "Use scoped pending indicators, success confirmation, actionable error feedback, and retry or recovery affordances.",
    references: [AFENDA_GOV_FEEDBACK, AFENDA_GOV_FORM_STATE],
    enforcement: HYBRID,
  },
  {
    id: "feedback.inline-error-proximity",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["form", "field", "validation-message", "table-row", "inline-edit"],
    rationale:
      "Errors must appear close to the affected control or row so users can repair issues without searching.",
    requirement:
      "Inline errors must be visually and programmatically associated with the affected field or item.",
    remediation:
      "Render errors near the affected control, connect them with aria-describedby, and preserve user-entered values.",
    references: [AFENDA_GOV_FEEDBACK, "WCAG:3.3.1", "WCAG:3.3.3"],
    enforcement: HYBRID,
  },
  {
    id: "feedback.error-summary-focus",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["form", "wizard", "dialog", "error-summary", "validation-summary"],
    rationale:
      "Complex forms and workflows need a reliable route from failed submission to the errors that require attention.",
    requirement:
      "Submission-level error summaries must be focusable and link to the affected fields or sections.",
    remediation:
      "Move focus to the error summary after failed submit and provide links or anchors to each error.",
    references: [AFENDA_GOV_FEEDBACK, "WCAG:2.4.3", "WCAG:3.3.1"],
    enforcement: HYBRID,
  },
  {
    id: "feedback.toast-lifecycle",
    category: FEEDBACK,
    severity: WARNING,
    appliesTo: ["toast", "snackbar", "notification", "async-status"],
    rationale:
      "Transient feedback can disappear before users read it or can create noise when used for durable errors.",
    requirement:
      "Toasts must have appropriate duration, dismissal, priority, and persistence for the feedback type.",
    remediation:
      "Use persistent alerts for blocking errors, dismissible toasts for nonblocking updates, and avoid auto-dismiss for critical recovery instructions.",
    references: [AFENDA_GOV_FEEDBACK, "WCAG:2.2.1", "WCAG:2.2.2"],
    enforcement: MANUAL,
  },
  {
    id: "feedback.no-critical-toast-only",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["toast", "alert", "mutation-flow", "form", "server-action"],
    rationale:
      "Critical feedback must not disappear before users can understand or recover from it.",
    requirement:
      "Blocking, destructive, validation, or high-impact errors must not be communicated only through transient toast.",
    remediation:
      "Render durable inline, alert, dialog, or summary feedback for critical failures; use toast only as supplemental feedback.",
    references: [AFENDA_GOV_FEEDBACK, "WCAG:3.3.1", "WCAG:3.3.3"],
    enforcement: MANUAL,
  },
  {
    id: "feedback.live-region-priority",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["toast", "alert", "status", "validation-message", "async-status"],
    rationale:
      "Feedback announced with the wrong urgency can either interrupt users unnecessarily or hide important failures.",
    requirement:
      "Feedback must use live-region priority that matches urgency and user impact.",
    remediation:
      "Use polite status announcements for noncritical updates and assertive alerts only for urgent errors requiring attention.",
    references: [AFENDA_GOV_FEEDBACK, "WCAG:4.1.3"],
    enforcement: HYBRID,
  },
  {
    id: "feedback.no-feedback-only-color",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["alert", "toast", "badge", "validation-message", "status"],
    rationale:
      "Users must understand feedback meaning even when color perception, theme, or display conditions vary.",
    requirement:
      "Feedback meaning must not be communicated by color alone.",
    remediation:
      "Pair color with text, icon, shape, semantic state, or explicit label.",
    references: [AFENDA_GOV_FEEDBACK, "WCAG:1.4.1"],
    enforcement: HYBRID,
  },
  {
    id: "feedback.success-confirmation-scope",
    category: FEEDBACK,
    severity: WARNING,
    appliesTo: ["mutation-flow", "toast", "form", "button", "dialog"],
    rationale:
      "Success feedback should confirm the completed operation without interrupting unrelated work.",
    requirement:
      "Success feedback must be scoped to the operation and should not create unnecessary modal interruption.",
    remediation:
      "Use inline success, scoped toast, or updated state near the affected region instead of global blocking confirmation.",
    references: [AFENDA_GOV_FEEDBACK],
    enforcement: MANUAL,
  },
  {
    id: "feedback.optimistic-update-reconciliation",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["optimistic-update", "mutation-flow", "table", "list", "detail-panel"],
    rationale:
      "Optimistic UI improves speed but must reconcile failure clearly to avoid misleading enterprise users.",
    requirement:
      "Optimistic updates must provide rollback, reconciliation, or explicit failure state when the server rejects the operation.",
    remediation:
      "Rollback affected UI, mark the item as failed, or provide retry and conflict-resolution guidance.",
    references: [AFENDA_GOV_FEEDBACK, XFORGE_GOV_MUTATION_PIPELINE],
    enforcement: MANUAL,
  },
  {
    id: "feedback.recovery-affordance",
    category: FEEDBACK,
    severity: ERROR,
    appliesTo: ["error-message", "toast", "alert", "empty-state", "mutation-flow"],
    rationale:
      "Enterprise users need a path to continue work when feedback reports a failure.",
    requirement:
      "Error feedback must provide a recovery path when the user can take corrective action.",
    remediation:
      "Provide retry, edit, contact support, view details, undo, or navigation to the affected record where appropriate.",
    references: [AFENDA_GOV_FEEDBACK, "WCAG:3.3.3"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
