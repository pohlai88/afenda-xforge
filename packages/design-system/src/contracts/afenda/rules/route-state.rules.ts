import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_ROUTE_STATE,
} from "../catalogs/governance-reference.catalog";

const ROUTE_STATE = "route-state" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;

export const AFENDA_ROUTE_STATE_RULES = [
  {
    id: "route-state.url-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["filters", "tabs", "pagination", "search", "expanded-panels"],
    rationale:
      "URL-backed route state supports deep links, refresh recovery, support handoff, and collaboration.",
    requirement:
      "Meaningful view state must be recoverable from the URL or equivalent durable route state.",
    remediation:
      "Persist filters, tabs, pagination, search, and expanded inspection state in query params, route params, or durable route state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.filter-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["filters", "table", "list", "search-results", "data-grid"],
    rationale:
      "Filtered enterprise views must remain shareable and recoverable after refresh or support escalation.",
    requirement:
      "Filter state must be recoverable from the URL or equivalent durable route state.",
    remediation:
      "Persist active filters and filter scopes in query params or route state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.pagination-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["pagination", "table", "list", "search-results", "data-grid"],
    rationale:
      "Paginated enterprise data must survive refresh, sharing, and back/forward navigation.",
    requirement:
      "Pagination state must be recoverable from the URL or equivalent durable route state.",
    remediation:
      "Persist page and page size in query params or route state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.sort-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["table", "list", "search-results", "data-grid"],
    rationale:
      "Enterprise users expect sorted data views to survive refresh, sharing, and back/forward navigation.",
    requirement:
      "Sort state must be recoverable from the URL or equivalent durable route state.",
    remediation:
      "Persist sort field and direction in query params or route state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.tab-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["tabs", "segmented-control", "dashboard", "record-detail"],
    rationale:
      "Tab state often represents meaningful user context in dense enterprise screens.",
    requirement:
      "Meaningful tab or section state must be recoverable from the URL or equivalent durable route state.",
    remediation:
      "Persist active tab keys in query params, route params, or durable route state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.search-query-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["search", "command-results", "list", "table"],
    rationale:
      "Search results need durable state for collaboration, support, refresh recovery, and back/forward navigation.",
    requirement:
      "Search query state should be reflected in URL or equivalent durable route state.",
    remediation:
      "Persist search terms and scoped search filters in query params or route state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.back-forward-preserves-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["filters", "tabs", "pagination", "sort", "search", "expanded-panels"],
    rationale:
      "Back and forward navigation must not destroy the user's working context.",
    requirement:
      "Browser back/forward must preserve meaningful route and view state.",
    remediation:
      "Synchronize meaningful view state with URL history instead of component-only state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.refresh-recovers-state",
    category: ROUTE_STATE,
    severity: WARNING,
    appliesTo: ["filters", "tabs", "pagination", "sort", "search", "expanded-panels"],
    rationale:
      "Refreshing a page must not destroy meaningful enterprise working context.",
    requirement:
      "Refresh must recover meaningful view state where users are filtering, searching, paginating, sorting, or inspecting records.",
    remediation:
      "Synchronize meaningful view state with URL, route params, or durable route state.",
    references: [AFENDA_GOV_ROUTE_STATE],
    enforcement: MANUAL,
  },
  {
    id: "route-state.unsaved-changes-guard",
    category: ROUTE_STATE,
    severity: ERROR,
    appliesTo: ["form", "editor", "wizard", "route-transition"],
    rationale:
      "Users must not lose unsaved enterprise work through accidental route transitions.",
    requirement:
      "Route transitions away from dirty high-impact work must warn, save draft, or provide recovery.",
    remediation:
      "Add an unsaved changes guard, draft persistence, or explicit discard path.",
    references: [AFENDA_GOV_ROUTE_STATE, "WCAG:3.3.4"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
