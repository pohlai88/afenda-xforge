import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_ADMIN_SHELL,
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_BACKGROUND_JOB_SCOPE,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_EMPTY_STATE,
  AFENDA_GOV_EXECUTION_CONTEXT,
  AFENDA_GOV_MUTATION,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_REALTIME_SCOPE,
  AFENDA_GOV_ROUTE_STATE,
  AFENDA_GOV_SCOPED_EXPORT,
  AFENDA_GOV_SCOPED_ROUTE,
  AFENDA_GOV_SCOPE_CACHE,
  AFENDA_GOV_SCOPE_RESOLUTION,
  AFENDA_GOV_SECURITY,
  AFENDA_GOV_SECURITY_UI,
  AFENDA_GOV_TENANT_CONTEXT,
  XFORGE_GOV_EXECUTION_CONTEXT,
  XFORGE_GOV_PERMISSION_PIPELINE,
  XFORGE_GOV_TENANT_COMPANY_SCOPE,
} from "../catalogs/governance-reference.catalog";

const SCOPE_INTEGRITY = "scope-integrity" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_SCOPE_INTEGRITY_RULES = [
  {
    id: "scope-integrity.active-scope-visible",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["app-shell", "tenant-switcher", "company-switcher", "workspace-header", "admin-shell"],
    rationale:
      "Users must know which tenant, company, or workspace they are viewing before reading or mutating scoped data.",
    requirement:
      "The active tenant, company, or workspace scope must be visible on scoped enterprise surfaces.",
    remediation:
      "Show the active tenant/company/workspace in shell chrome, headers, switchers, or scoped action regions.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_SCOPE_RESOLUTION,
      XFORGE_GOV_TENANT_COMPANY_SCOPE,
    ],
    enforcement: MANUAL,
  },
  {
    id: "scope-integrity.route-scope-consistency",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["route", "app-shell", "breadcrumb", "workspace-header", "deep-link"],
    rationale:
      "The route, visible shell context, and resolved execution context must not disagree.",
    requirement:
      "Scoped routes must resolve tenant/company/workspace from a single canonical execution context.",
    remediation:
      "Derive route params, shell labels, breadcrumbs, and data loaders from the same scope resolver.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_SCOPED_ROUTE,
      XFORGE_GOV_EXECUTION_CONTEXT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.mutation-scope-confirmation",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["mutation-flow", "destructive-action", "bulk-action", "admin-action", "tenant-setting"],
    rationale:
      "Scoped writes can affect the wrong tenant or company when the target context is ambiguous.",
    requirement:
      "High-impact scoped mutations must identify the tenant, company, or workspace affected before execution.",
    remediation:
      "Include scope labels in confirmations, danger zones, bulk action summaries, and admin mutation panels.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_EXECUTION_CONTEXT,
      AFENDA_GOV_MUTATION,
    ],
    enforcement: MANUAL,
  },
  {
    id: "scope-integrity.switch-resets-sensitive-state",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["tenant-switcher", "company-switcher", "workspace-switcher", "form", "wizard", "filter-state"],
    rationale:
      "Changing scope while sensitive draft, filter, or selection state persists can cause wrong-context actions.",
    requirement:
      "Tenant or company switching must clear, confirm, or safely preserve scoped draft, selection, and filter state.",
    remediation:
      "Reset scoped UI state, warn about unsaved work, or explicitly migrate only safe route state after scope changes.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_ROUTE_STATE,
      AFENDA_GOV_SCOPE_CACHE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.no-cross-tenant-data-leakage",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["table", "search", "dashboard", "metric", "report", "detail-panel"],
    forbidden: ["mixed tenant data without scope boundary", "cross-tenant result leakage", "previous tenant cache visible"],
    rationale:
      "Multi-tenant UI must never reveal data from a different tenant or company through cache, search, preview, or stale state.",
    requirement:
      "Data displays must be scoped to the active tenant/company and must clear stale data when scope changes.",
    remediation:
      "Key data fetching, caches, route state, and UI stores by tenant/company scope and clear stale views during switching.",
    references: [AFENDA_GOV_TENANT_CONTEXT, AFENDA_GOV_SECURITY_UI, XFORGE_GOV_TENANT_COMPANY_SCOPE],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.cache-key-is-scoped",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["query", "cache", "table", "dashboard", "search", "metric"],
    rationale:
      "Unscoped cache keys can show stale or foreign tenant data after switching context.",
    requirement:
      "Client and server cache keys for scoped data must include tenant/company/workspace identifiers.",
    remediation:
      "Include scope identifiers in query keys, cache tags, revalidation keys, and store partitions.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_SCOPE_CACHE,
      AFENDA_GOV_SECURITY_UI,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.permission-scope-alignment",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["button", "menu-item", "route", "admin-shell", "toolbar", "row-action"],
    rationale:
      "Permission affordances must match the active tenant and company scope, not only the user's global role.",
    requirement:
      "Action visibility and disabled state must be evaluated against the active tenant/company scope.",
    remediation:
      "Resolve grants for the active scope and render permission-aware navigation, actions, and explanations.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_PERMISSION,
      XFORGE_GOV_PERMISSION_PIPELINE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.export-scope",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["export", "report", "download", "bulk-action", "data-grid"],
    rationale:
      "Exports can leak large volumes of scoped data if tenant, company, permissions, and filters are not explicit.",
    requirement:
      "Exports and downloads must preserve tenant/company scope, permission filtering, and visible filter context.",
    remediation:
      "Include scope metadata in export requests, enforce scoped queries server-side, and show export scope before download.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_SCOPED_EXPORT,
      AFENDA_GOV_DATA_DISPLAY,
      XFORGE_GOV_PERMISSION_PIPELINE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.realtime-events-scoped",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["notification", "realtime-event", "toast", "activity-feed", "presence"],
    rationale:
      "Realtime events can leak cross-tenant information if subscriptions are not scope-bound.",
    requirement:
      "Realtime subscriptions and emitted UI events must be filtered by active tenant/company scope.",
    remediation:
      "Bind channels, event payloads, and client subscriptions to resolved execution scope.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_REALTIME_SCOPE,
      AFENDA_GOV_SECURITY_UI,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.background-job-scope",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["background-job", "scheduled-task", "import", "export", "sync"],
    rationale:
      "Async jobs can process or expose wrong tenant data when scope is not persisted.",
    requirement:
      "Background jobs created from scoped UI actions must persist and validate tenant/company scope.",
    remediation:
      "Store scope metadata in job payloads and validate scope before processing, retrying, or displaying results.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_BACKGROUND_JOB_SCOPE,
      AFENDA_GOV_AUDIT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.audit-scope-captured",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["mutation-flow", "admin-action", "export", "approval", "support-session"],
    rationale:
      "Enterprise audit evidence is incomplete when scope is not captured with the action.",
    requirement:
      "Scoped actions must write tenant/company/workspace identifiers into audit evidence.",
    remediation:
      "Include actor, tenant, company, workspace, target, action, reason, and correlation id in audit events.",
    references: [
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_AUDIT,
      XFORGE_GOV_EXECUTION_CONTEXT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "scope-integrity.impersonation-scope",
    category: SCOPE_INTEGRITY,
    severity: ERROR,
    appliesTo: ["impersonation", "support-session", "tenant-switcher", "admin-shell"],
    rationale:
      "Support and impersonation sessions must not obscure whose tenant/company scope is active.",
    requirement:
      "Impersonation UI must show both actor context and target tenant/company scope.",
    remediation:
      "Display operator identity, impersonated subject, active tenant/company, and exit affordance in persistent chrome.",
    references: [AFENDA_GOV_TENANT_CONTEXT, AFENDA_GOV_ADMIN_SHELL, AFENDA_GOV_AUDIT],
    enforcement: MANUAL,
  },
  {
    id: "scope-integrity.scope-aware-empty-states",
    category: SCOPE_INTEGRITY,
    severity: WARNING,
    appliesTo: ["empty-state", "table", "dashboard", "search-results", "report"],
    rationale:
      "Empty states can be misleading when they do not clarify the active tenant, company, filters, or permission scope.",
    requirement:
      "Scoped empty states should make it clear whether the result is due to scope, filters, permissions, or absence of data.",
    remediation:
      "Mention the active scope or filter context and provide safe next actions such as changing filters or requesting access.",
    references: [AFENDA_GOV_TENANT_CONTEXT, AFENDA_GOV_EMPTY_STATE],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
