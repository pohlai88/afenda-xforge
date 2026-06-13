import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const CONTENT = "content" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_CONTENT_RULES = [
  {
    id: "content.long-text",
    category: CONTENT,
    severity: ERROR,
    appliesTo: ["card", "table-cell", "badge", "button", "flex-child"],
    rationale:
      "Enterprise UI must remain stable under long identifiers, names, and user-generated values.",
    requirement: "Text containers must handle long and user-generated content.",
    remediation:
      "Use min-w-0 plus truncate, line clamp, or break-words as appropriate.",
    references: ["AFENDA:content-contract"],
    enforcement: HYBRID,
  },
  {
    id: "content.empty-state",
    category: CONTENT,
    severity: ERROR,
    appliesTo: ["list", "table", "collection", "search-results"],
    rationale:
      "Empty data is a valid product state and must not render broken structure.",
    requirement: "Empty arrays and empty strings must render designed empty states.",
    remediation:
      "Render a governed empty state with title, explanation, and next action where appropriate.",
    references: ["AFENDA:content-contract", "AFENDA:empty-state-contract"],
    enforcement: MANUAL,
  },
  {
    id: "content.actionable-errors",
    category: CONTENT,
    severity: ERROR,
    appliesTo: ["error-message", "form-error", "toast", "alert", "empty-state"],
    rationale:
      "Enterprise users need error content that explains what failed and how to recover.",
    requirement:
      "Error messages must be specific, actionable, and avoid blaming the user.",
    remediation:
      "State the failed action, explain the next step, and include retry, contact, or correction guidance where possible.",
    references: ["AFENDA:content-contract", "WCAG:3.3.1", "WCAG:3.3.3"],
    enforcement: MANUAL,
  },
  {
    id: "content.loading-status-copy",
    category: CONTENT,
    severity: WARNING,
    appliesTo: ["loading-state", "skeleton", "spinner", "async-status", "submit-button"],
    forbidden: ["generic loading copy for long-running or ambiguous operations"],
    rationale:
      "Generic loading copy creates uncertainty in long-running enterprise workflows.",
    requirement:
      "Loading and pending states must describe the operation in progress when the context is not obvious.",
    remediation:
      "Use operation-specific copy such as Loading invoices, Saving company profile, or Generating report.",
    references: ["AFENDA:content-contract", "WCAG:4.1.3"],
    enforcement: HYBRID,
  },
  {
    id: "content.control-label-specificity",
    category: CONTENT,
    severity: WARNING,
    appliesTo: ["button", "link", "menu-item", "toolbar-action", "icon-button"],
    forbidden: ["Click here", "Submit", "OK", "Cancel changes without context"],
    rationale:
      "Specific labels reduce ambiguity and make actions understandable when read out of context.",
    requirement:
      "Interactive labels must name the action or destination clearly.",
    remediation:
      "Use labels such as Save API key, Create invoice, View audit log, or Discard draft.",
    references: ["AFENDA:content-contract", "WCAG:2.4.4", "WCAG:2.5.3"],
    enforcement: MANUAL,
  },
  {
    id: "content.destructive-action-copy",
    category: CONTENT,
    severity: ERROR,
    appliesTo: ["delete-action", "archive-action", "destructive-dialog", "mutation-confirmation"],
    rationale:
      "Destructive flows require clear consequences so users can make informed decisions before committing.",
    requirement:
      "Destructive action copy must name the object, consequence, and recovery path where one exists.",
    remediation:
      "Include the target name, irreversible impact, and whether undo or recovery is available.",
    references: ["AFENDA:content-contract", "WCAG:3.3.4", "XFORGE:mutation-pipeline"],
    enforcement: MANUAL,
  },
  {
    id: "content.localization-safe-text",
    category: CONTENT,
    severity: WARNING,
    appliesTo: ["text", "label", "button", "toast", "error-message", "empty-state"],
    forbidden: ["string concatenation for translated UI", "hard-coded date format", "hard-coded currency format"],
    rationale:
      "Localized content changes length, grammar, number formatting, and reading order.",
    requirement:
      "User-facing content must be safe for localization and regional formatting.",
    remediation:
      "Use message templates, Intl formatting, and layouts that tolerate translated text expansion.",
    references: ["AFENDA:content-contract", "AFENDA:locale-contract"],
    enforcement: HYBRID,
  },
  {
    id: "content.sensitive-data-redaction",
    category: CONTENT,
    severity: ERROR,
    appliesTo: ["toast", "error-message", "audit-message", "log-preview", "table-cell", "detail-panel"],
    forbidden: ["secret value in UI", "token in error", "password in message", "full credential display"],
    rationale:
      "Enterprise UI must not expose secrets, credentials, tokens, or sensitive personal data through messages or previews.",
    requirement:
      "Sensitive values must be redacted or masked unless the surface is explicitly authorized to reveal them.",
    remediation:
      "Mask secrets, truncate identifiers safely, and use reveal controls only on permissioned surfaces.",
    references: ["AFENDA:content-contract", "AFENDA:security-contract"],
    enforcement: HYBRID,
  },
  {
    id: "content.regional-formatting",
    category: CONTENT,
    severity: WARNING,
    appliesTo: ["amount", "currency", "date", "time", "number", "metric", "table-cell"],
    forbidden: ["hard-coded date format", "hard-coded currency format", "hard-coded decimal separator"],
    rationale:
      "Enterprise users rely on correct regional formatting for financial, operational, and compliance interpretation.",
    requirement:
      "Dates, times, numbers, and currencies must use locale-aware formatting.",
    remediation:
      "Use Intl.DateTimeFormat, Intl.NumberFormat, timezone-aware formatting, and explicit currency codes where needed.",
    references: ["AFENDA:content-contract", "AFENDA:locale-contract"],
    enforcement: HYBRID,
  },
  {
    id: "content.status-copy-consistency",
    category: CONTENT,
    severity: WARNING,
    appliesTo: ["badge", "status", "tag", "workflow-state", "approval-state"],
    rationale:
      "Enterprise status language must remain consistent across modules to avoid operational misinterpretation.",
    requirement:
      "Status labels must come from approved domain or workflow vocabularies.",
    remediation:
      "Use canonical status labels from the feature contract, workflow contract, or design-system tone registry.",
    references: ["AFENDA:content-contract", "AFENDA:status-tone-contract"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
