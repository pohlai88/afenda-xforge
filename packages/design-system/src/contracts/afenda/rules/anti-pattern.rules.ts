import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_ACCESSIBILITY,
  AFENDA_GOV_ANTI_PATTERN,
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_CODE_QUALITY,
  AFENDA_GOV_DATA_ACCESS,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_ERROR,
  AFENDA_GOV_EXECUTION_CONTEXT,
  AFENDA_GOV_FEEDBACK,
  AFENDA_GOV_HYDRATION,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_MUTATION,
  AFENDA_GOV_OBSERVABILITY,
  AFENDA_GOV_PERFORMANCE,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_PRIVACY,
  AFENDA_GOV_ROUTE_STATE,
  AFENDA_GOV_RUNTIME_DIAGNOSTICS,
  AFENDA_GOV_SECURITY,
  AFENDA_GOV_SECURITY_UI,
  AFENDA_GOV_SEMANTICS,
  AFENDA_GOV_TENANT_CONTEXT,
  AFENDA_GOV_THEME_TOKEN,
  AFENDA_GOV_VISUAL_DESIGN,
  XFORGE_GOV_PERMISSION_PIPELINE,
  XFORGE_GOV_TENANT_COMPANY_SCOPE,
} from "../catalogs/governance-reference.catalog";

const ANTI_PATTERN = "anti-pattern" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_ANTI_PATTERN_RULES = [
  {
    id: "anti-pattern.mobile-zoom-disabled",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["viewport-meta", "mobile-shell", "app-shell"],
    forbidden: ["user-scalable=no", "maximum-scale=1", "maximum-scale=1.0"],
    rationale:
      "Users must retain browser zoom for readability, accessibility, and dense enterprise data inspection.",
    requirement:
      "The interface must not disable browser zoom.",
    remediation:
      "Remove zoom-disabling viewport directives and fix layout issues with responsive design instead.",
    references: [AFENDA_GOV_ANTI_PATTERN, "WCAG:1.4.4"],
    enforcement: STATIC,
  },
  {
    id: "anti-pattern.div-button",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["interactive-element", "button", "menu-item", "row-action"],
    forbidden: ["div[onClick]", "span[onClick]", "role=button without native button"],
    rationale:
      "Non-native interactive elements lose keyboard, focus, disabled, and accessibility semantics.",
    requirement:
      "Clickable controls must use native interactive elements unless a governed component pattern requires otherwise.",
    remediation:
      "Use button, a, input, or an approved accessible component primitive instead of click handlers on generic elements.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_SEMANTICS,
      "WCAG:2.1.1",
      "WCAG:4.1.2",
    ],
    enforcement: STATIC,
  },
  {
    id: "anti-pattern.link-for-mutation",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["link", "button", "navigation", "mutation-flow"],
    forbidden: ["link used for mutation", "anchor delete action", "href triggers write"],
    rationale:
      "Navigation and mutation semantics must remain separate for safety, accessibility, and browser behavior.",
    requirement:
      "Links must navigate and buttons or governed mutation controls must perform writes.",
    remediation:
      "Use real links for navigation and submit/button mutation primitives for state-changing actions.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_SEMANTICS,
      AFENDA_GOV_MUTATION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.raw-html-injection",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["html-renderer", "markdown", "integration-content", "cms-content", "description"],
    forbidden: ["dangerouslySetInnerHTML with untrusted content", "raw integration HTML rendered directly"],
    rationale:
      "Raw HTML rendering can introduce XSS, broken semantics, and ungoverned visual content.",
    requirement:
      "Untrusted HTML, markdown, and integration content must be sanitized or rendered through approved primitives.",
    remediation:
      "Sanitize content, use a safe markdown renderer, or map integration content to governed component primitives.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_SECURITY_UI,
      "OWASP:XSS",
    ],
    enforcement: STATIC,
  },
  {
    id: "anti-pattern.client-only-authorization",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["button", "menu-item", "route", "client-component", "mutation-flow"],
    forbidden: [
      "client-only permission check",
      "disabled UI as authorization boundary",
      "hidden button as authorization boundary",
    ],
    rationale:
      "UI affordances can guide users but cannot be the security boundary for enterprise reads or writes.",
    requirement:
      "Authorization must be enforced by server actions, APIs, command handlers, or repository boundaries.",
    remediation:
      "Keep UI permission checks as affordance only and enforce authorization again on the server.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_SECURITY_UI,
      XFORGE_GOV_PERMISSION_PIPELINE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.unscoped-tenant-data",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["table", "search-results", "cache", "export", "report", "dashboard"],
    forbidden: ["mixed tenant data without scope boundary", "cross-tenant result leakage", "unscoped cache key"],
    rationale:
      "Multi-tenant UI must fail closed when tenant, company, or workspace scope is missing or stale.",
    requirement:
      "Scoped data displays, exports, caches, and previews must bind to explicit tenant/company/workspace context.",
    remediation:
      "Key data by resolved scope, clear stale views during switching, and show active scope before sensitive actions.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_TENANT_CONTEXT,
      XFORGE_GOV_TENANT_COMPANY_SCOPE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.global-unscoped-client-store",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["client-store", "zustand-store", "context-provider", "filter-state", "selection-state"],
    forbidden: [
      "global tenant selection without scope key",
      "cross-route selection persistence",
      "unscoped filter store",
      "stale selected records after tenant switch",
    ],
    rationale:
      "Global client stores can preserve stale tenant, company, filter, or selection state across scoped workflows.",
    requirement:
      "Client state that affects scoped views or mutations must be keyed by route and execution context or reset safely.",
    remediation:
      "Partition stores by tenant/company/workspace/route, clear sensitive state on scope change, and confirm unsaved drafts.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_ROUTE_STATE,
      AFENDA_GOV_HYDRATION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.unbounded-client-data",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "search", "filter", "dashboard", "report"],
    forbidden: [
      "client-side filtering over full enterprise dataset",
      "client-side sorting over full enterprise dataset",
      "shipping full dataset to browser for dashboard aggregation",
    ],
    rationale:
      "Shipping full enterprise datasets to the browser creates performance, permission, and data-leak risks.",
    requirement:
      "Large or permissioned datasets must be shaped through server-side pagination, filtering, sorting, and aggregation.",
    remediation:
      "Move data shaping to repositories or query services and send only the current authorized window or projection.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_PERFORMANCE,
      AFENDA_GOV_DATA_ACCESS,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.raw-sensitive-output",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["toast", "error-message", "log-preview", "table-cell", "detail-panel", "audit-preview"],
    forbidden: ["secret value in UI", "token in error", "password in message", "raw PII in notification"],
    rationale:
      "Generated UI often leaks sensitive values through convenient previews, errors, and notifications.",
    requirement:
      "Sensitive data must not be emitted into generic UI copy, errors, previews, or diagnostics.",
    remediation:
      "Use masking, permission-aware reveal controls, safe summaries, and correlation ids instead of raw sensitive values.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_PRIVACY,
      AFENDA_GOV_SECURITY_UI,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.mutation-without-audit",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["mutation-flow", "admin-action", "bulk-action", "approval-action", "server-action"],
    forbidden: [
      "admin mutation without audit event",
      "bulk action without audit summary",
      "permission change without audit",
      "tenant setting change without audit",
    ],
    rationale:
      "Enterprise mutations need durable evidence for accountability, support, compliance, and rollback analysis.",
    requirement:
      "High-impact mutations must emit structured audit evidence.",
    remediation:
      "Write audit events with actor, action, target, tenant/company scope, result, reason, and correlation id.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_AUDIT,
      AFENDA_GOV_MUTATION,
      AFENDA_GOV_EXECUTION_CONTEXT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.optimistic-mutation-without-revalidation",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["mutation-flow", "server-action", "optimistic-ui", "form-submit", "bulk-action"],
    forbidden: [
      "optimistic update without server confirmation",
      "mutation without permission revalidation",
      "bulk mutation without scope revalidation",
    ],
    rationale:
      "Optimistic UI can show unauthorized, failed, or wrong-scope changes as if they succeeded.",
    requirement:
      "Optimistic mutations must revalidate permission, scope, server result, and rollback behavior.",
    remediation:
      "Use governed mutation primitives with pending, success, failure, rollback, audit, and revalidation handling.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_MUTATION,
      AFENDA_GOV_PERMISSION,
      AFENDA_GOV_TENANT_CONTEXT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.silent-error-swallowing",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["catch", "server-action", "api-client", "query", "mutation-flow", "background-job"],
    forbidden: [
      "empty catch block",
      "catch without feedback or logging",
      "failed mutation hidden from user",
      "background job failure invisible",
    ],
    rationale:
      "Silent failures destroy trust and make enterprise operations impossible to audit or recover.",
    requirement:
      "Errors must be surfaced, logged, or intentionally handled through governed recovery paths.",
    remediation:
      "Emit diagnostics, show safe feedback, return typed failure states, and attach correlation ids where useful.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_FEEDBACK,
      AFENDA_GOV_OBSERVABILITY,
      AFENDA_GOV_ERROR,
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.layout-breaking-fixed-width",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["page", "dashboard", "table", "card", "form", "modal"],
    forbidden: ["fixed desktop width on responsive surface", "min-width larger than viewport", "page-level horizontal scroll"],
    rationale:
      "Fixed desktop layouts break mobile, split-screen, zoom, and translated enterprise UI.",
    requirement:
      "Responsive surfaces must not rely on fixed widths that create global overflow.",
    remediation:
      "Use responsive constraints, min-width: 0, wrapping, local overflow containment, and adaptive density.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_LAYOUT,
      "WCAG:1.4.10",
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.color-only-state",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["status", "badge", "chart", "alert", "form-state", "workflow-state"],
    forbidden: ["color-only status", "color-only chart meaning", "color-only validation state"],
    rationale:
      "Color-only meaning fails under custom themes, color vision differences, forced colors, and exports.",
    requirement:
      "State and meaning must be communicated through labels, icons, structure, semantics, or text in addition to color.",
    remediation:
      "Pair tone with text labels, icons, aria state, legends, or persistent structural affordances.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_ACCESSIBILITY,
      "WCAG:1.4.1",
    ],
    enforcement: HYBRID,
  },
  {
    id: "anti-pattern.inline-style-token-bypass",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["style-prop", "component", "css", "theme", "layout"],
    forbidden: [
      "inline hex color",
      "inline spacing magic number",
      "inline z-index magic number",
      "local shadow outside token",
      "one-off border radius",
    ],
    rationale:
      "Inline styling bypasses design-system governance, theming, density, and accessibility guarantees.",
    requirement:
      "Visual styling must use approved tokens, variants, or governed component props.",
    remediation:
      "Move repeated visual values into tokens, use component variants, or register the pattern in the design system.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_DESIGN_SYSTEM,
      AFENDA_GOV_THEME_TOKEN,
      AFENDA_GOV_VISUAL_DESIGN,
    ],
    enforcement: STATIC,
  },
  {
    id: "anti-pattern.unreviewed-escape-hatch",
    category: ANTI_PATTERN,
    severity: ERROR,
    appliesTo: ["eslint-disable", "ts-ignore", "any", "suppressHydrationWarning", "dangerouslySetInnerHTML"],
    forbidden: [
      "unexplained eslint-disable",
      "unexplained ts-ignore",
      "broad any escape",
      "broad hydration suppression",
      "unsafe escape hatch without owner",
    ],
    rationale:
      "Enterprise codebases decay when escape hatches bypass governance without ownership and expiry.",
    requirement:
      "Escape hatches must be narrow, justified, owner-tagged, and removable.",
    remediation:
      "Add a reason, owner, scope, and expiry comment or replace the escape hatch with a typed governed pattern.",
    references: [
      AFENDA_GOV_ANTI_PATTERN,
      AFENDA_GOV_RUNTIME_DIAGNOSTICS,
      AFENDA_GOV_CODE_QUALITY,
    ],
    enforcement: STATIC,
  },
] as const satisfies readonly AfendaRuntimeRule[];
