import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_SECURITY,
  AFENDA_GOV_SECURITY_UI,
  XFORGE_GOV_AUDIT_EVENTS,
  XFORGE_GOV_MUTATION_PIPELINE,
  XFORGE_GOV_PERMISSION_PIPELINE,
  XFORGE_GOV_TENANT_COMPANY_SCOPE,
} from "../catalogs/governance-reference.catalog";

const SECURITY_UI = "security-ui" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_SECURITY_UI_RULES = [
  {
    id: "security-ui.secret-redaction",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["toast", "error-message", "log-preview", "audit-message", "detail-panel", "table-cell"],
    forbidden: ["secret value in UI", "token in error", "password in message", "full credential display"],
    rationale:
      "UI surfaces must not leak secrets, credentials, tokens, or sensitive personal data through messages or previews.",
    requirement:
      "Sensitive values must be masked or redacted unless the surface is explicitly permissioned for reveal.",
    remediation:
      "Mask secrets by default, truncate identifiers safely, and require an explicit reveal control on permissioned surfaces.",
    references: [AFENDA_GOV_SECURITY_UI, AFENDA_GOV_SECURITY],
    enforcement: HYBRID,
  },
  {
    id: "security-ui.permission-aware-actions",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["button", "menu-item", "toolbar-action", "row-action", "destructive-action"],
    rationale:
      "Users must not be offered actions that the current tenant, company, membership, or grant context cannot execute.",
    requirement:
      "Privileged actions must reflect permission state and must not imply authorization where none exists.",
    remediation:
      "Hide unavailable actions or render disabled actions with an explanation; keep server authorization as final authority.",
    references: [AFENDA_GOV_SECURITY_UI, XFORGE_GOV_PERMISSION_PIPELINE],
    enforcement: HYBRID,
  },
  {
    id: "security-ui.no-client-only-authorization",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["button", "menu-item", "route", "client-component", "mutation-flow"],
    forbidden: [
      "client-only permission check",
      "disabled UI as authorization boundary",
      "hidden button as authorization boundary",
    ],
    rationale:
      "UI permission state improves clarity but cannot be the security boundary for enterprise mutations.",
    requirement:
      "Client-side permission display must never replace server authorization.",
    remediation:
      "Use UI permission checks for affordance only and enforce authorization again in server actions, APIs, or command handlers.",
    references: [AFENDA_GOV_SECURITY_UI, XFORGE_GOV_PERMISSION_PIPELINE],
    enforcement: HYBRID,
  },
  {
    id: "security-ui.destructive-action-safety",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["delete-action", "archive-action", "destructive-dialog", "mutation-confirmation"],
    rationale:
      "High-impact UI actions need clear friction so users understand the target and consequence before execution.",
    requirement:
      "Destructive actions must identify the target and require explicit confirmation or provide a safe undo path.",
    remediation:
      "Use a governed confirmation flow that names the object, consequence, and recovery path where available.",
    references: [AFENDA_GOV_SECURITY_UI, "WCAG:3.3.4", XFORGE_GOV_MUTATION_PIPELINE],
    enforcement: MANUAL,
  },
  {
    id: "security-ui.external-link-safety",
    category: SECURITY_UI,
    severity: WARNING,
    appliesTo: ["external-link", "markdown-link", "rich-text", "help-link"],
    forbidden: ["target=_blank without rel=noopener", "untrusted href without protocol validation"],
    rationale:
      "External links can create tabnabbing, phishing, or untrusted navigation risk when rendered loosely.",
    requirement:
      "External links must use safe target attributes and validated protocols.",
    remediation:
      "Use rel=\"noopener noreferrer\" for new tabs and allow only approved URL protocols.",
    references: [AFENDA_GOV_SECURITY_UI, "OWASP:Reverse-Tabnabbing", "OWASP:Unvalidated-Redirects"],
    enforcement: HYBRID,
  },
  {
    id: "security-ui.impersonation-visibility",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["admin-shell", "impersonation-banner", "support-session", "tenant-switcher"],
    rationale:
      "Support and admin impersonation must remain visible to prevent accidental privileged actions in the wrong context.",
    requirement:
      "Impersonation, support, and elevated-admin contexts must display persistent visible context indicators.",
    remediation:
      "Show a persistent banner or chrome indicator with the active actor, subject, tenant, and exit affordance.",
    references: [AFENDA_GOV_SECURITY_UI, XFORGE_GOV_AUDIT_EVENTS, XFORGE_GOV_TENANT_COMPANY_SCOPE],
    enforcement: MANUAL,
  },
  {
    id: "security-ui.sensitive-field-reveal",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["password-field", "token-field", "secret-field", "api-key", "credential"],
    forbidden: ["secret visible by default", "copy secret without permissioned affordance"],
    rationale:
      "Credential fields need deliberate reveal and copy behavior to reduce accidental exposure.",
    requirement:
      "Sensitive fields must be masked by default and reveal/copy controls must be explicit and permission-aware.",
    remediation:
      "Render masked values by default, add deliberate reveal/copy controls, and log or audit high-impact reveal actions where required.",
    references: [AFENDA_GOV_SECURITY_UI, AFENDA_GOV_AUDIT],
    enforcement: HYBRID,
  },
  {
    id: "security-ui.audit-visible-sensitive-actions",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["secret-reveal", "impersonation", "admin-action", "permission-change", "destructive-action"],
    rationale:
      "Sensitive UI actions must be visible in audit trails so enterprise operators can investigate misuse or mistakes.",
    requirement:
      "Sensitive reveal, impersonation, permission, and high-impact actions must emit auditable UI or command events.",
    remediation:
      "Route sensitive actions through governed command handlers or audit-aware UI primitives.",
    references: [AFENDA_GOV_SECURITY_UI, AFENDA_GOV_AUDIT, XFORGE_GOV_AUDIT_EVENTS],
    enforcement: MANUAL,
  },
  {
    id: "security-ui.tenant-context-clarity",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["app-shell", "tenant-switcher", "company-switcher", "admin-shell", "mutation-flow"],
    rationale:
      "Multi-tenant enterprise UI must make the active tenant and company context clear before users mutate data.",
    requirement:
      "Tenant, company, or workspace context must be visible where actions can affect scoped business records.",
    remediation:
      "Display active tenant/company context in shell chrome, switchers, destructive confirmations, or scoped mutation surfaces.",
    references: [AFENDA_GOV_SECURITY_UI, XFORGE_GOV_TENANT_COMPANY_SCOPE],
    enforcement: MANUAL,
  },
  {
    id: "security-ui.untrusted-content-boundary",
    category: SECURITY_UI,
    severity: ERROR,
    appliesTo: ["markdown", "rich-text", "html-preview", "user-content", "integration-content"],
    forbidden: ["dangerouslySetInnerHTML with untrusted content", "raw integration HTML rendered directly"],
    rationale:
      "User-generated and integration-provided content can introduce script, phishing, or layout attacks.",
    requirement:
      "Untrusted content must be sanitized, escaped, or rendered through approved safe primitives.",
    remediation:
      "Use approved markdown/rich-text renderers, sanitize HTML, validate links, and avoid raw HTML injection.",
    references: [AFENDA_GOV_SECURITY_UI, "OWASP:XSS"],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
