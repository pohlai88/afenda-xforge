import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_AUTH,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_EXECUTION_CONTEXT,
  AFENDA_GOV_FOCUS,
  AFENDA_GOV_FORMS,
  AFENDA_GOV_HYDRATION,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_LOCALE,
  AFENDA_GOV_MUTATION,
  AFENDA_GOV_OBSERVABILITY,
  AFENDA_GOV_PERFORMANCE,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_ROUTE_STATE,
  AFENDA_GOV_RUNTIME_DIAGNOSTICS,
  AFENDA_GOV_SECURITY,
  AFENDA_GOV_SECURITY_UI,
  AFENDA_GOV_TENANT_CONTEXT,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VALIDATION,
  XFORGE_GOV_SERVER_FIRST_UI,
} from "../catalogs/governance-reference.catalog";

const HYDRATION = "hydration" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_HYDRATION_RULES = [
  {
    id: "hydration.server-client-markup-parity",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["server-component", "client-component", "layout", "page", "app-shell"],
    forbidden: [
      "Date.now in render",
      "Math.random in render",
      "browser-only value in server render",
      "non-deterministic id in render",
    ],
    rationale:
      "Server and client markup must match so React can hydrate without replacing UI or losing state.",
    requirement:
      "Rendered markup must be deterministic between server render and client hydration.",
    remediation:
      "Move browser-only or time-varying values into effects, stable server data, or deterministic id primitives.",
    references: [AFENDA_GOV_HYDRATION, "React:hydration"],
    enforcement: HYBRID,
  },
  {
    id: "hydration.browser-api-boundary",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["server-component", "client-component", "render", "hook", "layout"],
    forbidden: [
      "window in server render",
      "document in server render",
      "localStorage in server render",
      "matchMedia in server render",
    ],
    rationale:
      "Browser APIs are unavailable during server rendering and create hydration drift when used as initial render authority.",
    requirement:
      "Browser-only APIs must be isolated behind client effects, client boundaries, or server-safe adapters.",
    remediation:
      "Read browser state after hydration or provide a server-derived initial value that matches the client contract.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_PERFORMANCE,
      XFORGE_GOV_SERVER_FIRST_UI,
    ],
    enforcement: STATIC,
  },
  {
    id: "hydration.client-boundary-minimal",
    category: HYDRATION,
    severity: WARNING,
    appliesTo: ["client-component", "provider", "layout", "route", "feature"],
    forbidden: ["use client at route root without need", "client boundary around static shell"],
    rationale:
      "Unnecessary client boundaries increase hydration surface area and make deterministic rendering harder.",
    requirement:
      "Client boundaries must be limited to interactive islands, browser APIs, or client state ownership.",
    remediation:
      "Keep static route shells server-rendered and move client boundaries down to the smallest interactive component.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_PERFORMANCE,
      XFORGE_GOV_SERVER_FIRST_UI,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.execution-context-parity",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["app-shell", "layout", "page", "provider", "tenant-switcher", "admin-shell"],
    rationale:
      "Tenant, company, actor, permission, and workspace context must not change silently between server render and client hydration.",
    requirement:
      "Initial execution context used by server-rendered UI must match the client bootstrap context.",
    remediation:
      "Serialize a signed or schema-validated execution context snapshot and revalidate scope before enabling scoped actions.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_EXECUTION_CONTEXT,
      AFENDA_GOV_TENANT_CONTEXT,
      AFENDA_GOV_PERMISSION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.auth-session-parity",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["auth-provider", "protected-route", "app-shell", "admin-shell", "permission-gate"],
    rationale:
      "Auth or session drift during hydration can expose incorrect navigation, actions, or cached user state.",
    requirement:
      "Server-rendered auth state must align with client session state before permission-sensitive controls are enabled.",
    remediation:
      "Gate privileged controls until session parity is confirmed and avoid rendering optimistic privileged actions from stale client state.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_SECURITY_UI,
      AFENDA_GOV_PERMISSION,
      AFENDA_GOV_AUTH,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.theme-initial-state",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["theme-provider", "html", "app-shell", "layout", "tenant-theme"],
    forbidden: ["client-only theme default", "theme flash on load", "hydration mismatch from theme"],
    rationale:
      "Theme state affects large portions of markup and must be resolved consistently before hydration.",
    requirement:
      "Initial theme, color-scheme, and tenant theme attributes must match between server markup and client hydration.",
    remediation:
      "Resolve theme from server-readable state or deterministic bootstrap data and keep client defaults aligned.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_THEMING,
      AFENDA_GOV_TENANT_CONTEXT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.locale-initial-state",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["html", "route", "locale-provider", "date", "number", "currency"],
    forbidden: ["client-only locale default", "server/client locale mismatch", "timezone mismatch on hydration"],
    rationale:
      "Locale, direction, and timezone differences can change rendered text and attributes during hydration.",
    requirement:
      "Initial locale, direction, timezone, and formatted output must match between server render and client hydration.",
    remediation:
      "Resolve locale from the route or execution context and pass the same locale/timezone into server and client formatting.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_LOCALE,
      AFENDA_GOV_ROUTE_STATE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.route-state-parity",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["route", "search-params", "filter", "pagination", "tab", "sort"],
    rationale:
      "Route-derived state must not be reinterpreted differently after hydration or users can see filters, tabs, and lists jump.",
    requirement:
      "Initial client state for filters, sorting, pagination, tabs, and search must derive from the same route state as the server render.",
    remediation:
      "Parse route state once through approved schema helpers and pass normalized initial state to client islands.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_ROUTE_STATE,
      AFENDA_GOV_DATA_DISPLAY,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.client-store-bootstrap",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["client-store", "zustand-store", "context-provider", "filter-state", "selection-state"],
    rationale:
      "Client stores that initialize differently from server-rendered state cause jumps, stale selections, and wrong-context actions.",
    requirement:
      "Client stores used by hydrated UI must initialize from the same normalized server snapshot or intentionally start empty.",
    remediation:
      "Bootstrap client stores from serialized route/execution state and clear scoped stores when tenant/company changes.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_ROUTE_STATE,
      AFENDA_GOV_TENANT_CONTEXT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.input-value",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["input", "textarea", "select", "combobox", "form-field"],
    forbidden: ["value without onChange", "controlled input without change handler"],
    rationale:
      "React controlled inputs require change handlers or explicit readonly/default behavior to avoid broken input state.",
    requirement:
      "Inputs with value must define onChange or readOnly; otherwise use defaultValue for uncontrolled initial values.",
    remediation:
      "Add onChange for controlled inputs, mark readonly values readOnly, or switch initial values to defaultValue.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_FORMS,
      "React:controlled-inputs",
    ],
    enforcement: STATIC,
  },
  {
    id: "hydration.server-action-form-parity",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["server-action", "form", "mutation-flow", "submit-button", "optimistic-ui"],
    rationale:
      "Server actions and optimistic UI can diverge if the hydrated form state differs from the submitted server contract.",
    requirement:
      "Server-action forms must share the same schema, defaults, disabled state, and validation contract across server and client.",
    remediation:
      "Use shared schemas, serialize normalized defaults, and revalidate permission/scope before mutation execution.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_FORMS,
      AFENDA_GOV_MUTATION,
      AFENDA_GOV_VALIDATION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.async-boundary-stability",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["suspense", "async-content", "loading-state", "server-component", "client-component"],
    rationale:
      "Async boundaries must avoid replacing stable content, moving focus, or changing layout unexpectedly during hydration.",
    requirement:
      "Loading and resolved states must preserve stable structure, dimensions, and focus safety.",
    remediation:
      "Use stable skeleton dimensions, deterministic fallback structure, and avoid autofocus or focus stealing after hydration.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_LAYOUT,
      AFENDA_GOV_FOCUS,
      "CoreWebVitals:CLS",
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.third-party-script-isolation",
    category: HYDRATION,
    severity: WARNING,
    appliesTo: ["script", "analytics", "chat-widget", "embed", "marketing-surface"],
    rationale:
      "Third-party scripts can mutate DOM before or during hydration and create hard-to-debug mismatches.",
    requirement:
      "Third-party scripts must not mutate server-rendered application DOM during hydration.",
    remediation:
      "Load third-party scripts after hydration, isolate them in containers, or render them only inside approved client islands.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_SECURITY_UI,
      AFENDA_GOV_PERFORMANCE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "hydration.suppress-warning-restraint",
    category: HYDRATION,
    severity: ERROR,
    appliesTo: ["suppressHydrationWarning", "html", "time", "client-component"],
    forbidden: ["unreviewed suppressHydrationWarning", "suppressHydrationWarning masking state drift"],
    rationale:
      "Suppressing hydration warnings can hide real server/client state bugs in enterprise workflows.",
    requirement:
      "Hydration warning suppression must be narrow, documented, and limited to intentionally non-deterministic leaf text.",
    remediation:
      "Remove broad suppression, make markup deterministic, or document the exact leaf mismatch and recovery behavior.",
    references: [AFENDA_GOV_HYDRATION, "React:hydration"],
    enforcement: HYBRID,
  },
  {
    id: "hydration.recoverability-diagnostics",
    category: HYDRATION,
    severity: WARNING,
    appliesTo: ["app-shell", "client-boundary", "error-boundary", "provider", "route"],
    rationale:
      "Hydration failures in enterprise applications need actionable diagnostics instead of silent UI replacement.",
    requirement:
      "Hydration-sensitive boundaries should emit recoverable error diagnostics with route, feature, tenant, and component context.",
    remediation:
      "Capture hydration recovery errors, boundary name, route, feature id, tenant/company scope, and correlation id.",
    references: [
      AFENDA_GOV_HYDRATION,
      AFENDA_GOV_OBSERVABILITY,
      AFENDA_GOV_RUNTIME_DIAGNOSTICS,
    ],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
