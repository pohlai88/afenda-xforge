import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const ADMIN_SHELL = "admin-shell" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_ADMIN_SHELL_RULES = [
  {
    id: "admin-shell.elevated-context-visible",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["admin-shell", "super-admin", "support-session", "impersonation", "tenant-admin"],
    rationale:
      "Elevated access must remain visually obvious so operators do not accidentally act in a privileged context.",
    requirement:
      "Admin, support, impersonation, and elevated contexts must display persistent visible context indicators.",
    remediation:
      "Show persistent chrome, banner, or badge that identifies elevated mode, active actor, tenant, company, and access scope.",
    references: ["AFENDA:admin-shell-contract", "AFENDA:security-ui-contract"],
    enforcement: MANUAL,
  },
  {
    id: "admin-shell.impersonation-exit",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["impersonation", "support-session", "admin-shell"],
    rationale:
      "Operators must be able to clearly exit impersonation or support mode before taking unrelated actions.",
    requirement:
      "Impersonation and support sessions must provide a persistent, obvious exit affordance.",
    remediation:
      "Render an always-visible exit control in shell chrome and confirm return to the operator context.",
    references: ["AFENDA:admin-shell-contract", "XFORGE:audit-events"],
    enforcement: MANUAL,
  },
  {
    id: "admin-shell.tenant-company-switching",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["tenant-switcher", "company-switcher", "admin-shell", "workspace-switcher"],
    rationale:
      "Admin users often manage multiple tenants or companies and must not mutate the wrong scope.",
    requirement:
      "Tenant and company switchers must show the active scope and require clear confirmation for high-impact scope changes.",
    remediation:
      "Display active tenant/company in shell chrome and reset or confirm scoped work when switching context.",
    references: ["AFENDA:admin-shell-contract", "XFORGE:tenant-company-scope"],
    enforcement: MANUAL,
  },
  {
    id: "admin-shell.permission-aware-navigation",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["admin-navigation", "sidebar", "menu-item", "route", "toolbar"],
    rationale:
      "Admin navigation should not imply access to surfaces the current actor cannot operate.",
    requirement:
      "Admin navigation must reflect grants, roles, and tenant/company scope.",
    remediation:
      "Hide unavailable admin routes or render disabled entries with explanation while enforcing authorization server-side.",
    references: ["AFENDA:admin-shell-contract", "XFORGE:permission-pipeline"],
    enforcement: HYBRID,
  },
  {
    id: "admin-shell.danger-zone-containment",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["danger-zone", "destructive-action", "admin-action", "permission-change", "tenant-setting"],
    rationale:
      "High-impact admin operations need deliberate containment so they are not triggered from casual workflows.",
    requirement:
      "Dangerous admin actions must be visually separated, clearly labeled, and protected by confirmation or review.",
    remediation:
      "Group destructive or irreversible actions into governed danger zones with target naming, consequence copy, and confirmation.",
    references: ["AFENDA:admin-shell-contract", "AFENDA:mutation-contract", "WCAG:3.3.4"],
    enforcement: MANUAL,
  },
  {
    id: "admin-shell.audit-affordance",
    category: ADMIN_SHELL,
    severity: WARNING,
    appliesTo: ["admin-action", "detail-panel", "permission-change", "tenant-setting", "audit-link"],
    rationale:
      "Admin users and support operators need quick access to audit context for sensitive resources and changes.",
    requirement:
      "Sensitive admin surfaces should expose a path to relevant audit history where appropriate.",
    remediation:
      "Add audit log links, recent activity panels, or event history affordances near high-impact admin controls.",
    references: ["AFENDA:admin-shell-contract", "AFENDA:audit-contract"],
    enforcement: MANUAL,
  },
  {
    id: "admin-shell.reason-required-for-sensitive-actions",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["impersonation", "permission-change", "override", "destructive-action", "admin-action"],
    rationale:
      "Sensitive admin actions often need reason capture for future review and accountability.",
    requirement:
      "Sensitive admin actions should capture an operator reason where policy requires it.",
    remediation:
      "Prompt for a concise reason before impersonation, overrides, permission changes, or high-impact destructive actions.",
    references: ["AFENDA:admin-shell-contract", "AFENDA:audit-contract"],
    enforcement: MANUAL,
  },
  {
    id: "admin-shell.break-glass-mode",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["super-admin", "support-session", "emergency-access", "admin-shell"],
    rationale:
      "Emergency or break-glass access must be visibly exceptional, time-bound, and auditable.",
    requirement:
      "Break-glass admin access must require explicit reason, persistent visual indication, and audit capture.",
    remediation:
      "Require reason entry, show active break-glass banner, record start/end audit events, and provide a clear exit path.",
    references: ["AFENDA:admin-shell-contract", "AFENDA:audit-contract", "AFENDA:security-ui-contract"],
    enforcement: MANUAL,
  },
  {
    id: "admin-shell.production-environment-clarity",
    category: ADMIN_SHELL,
    severity: ERROR,
    appliesTo: ["admin-shell", "production-banner", "environment-badge", "danger-zone"],
    rationale:
      "Operators must distinguish production, preview, staging, and development before performing high-impact actions.",
    requirement:
      "Admin shells must clearly identify the active environment where environment confusion can cause production impact.",
    remediation:
      "Show persistent environment badges or banners and add extra friction for production destructive actions.",
    references: ["AFENDA:admin-shell-contract", "AFENDA:security-ui-contract"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
