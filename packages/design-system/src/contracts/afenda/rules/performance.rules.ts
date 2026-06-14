import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_DATA_ACCESS,
  AFENDA_GOV_FORM_STATE,
  AFENDA_GOV_PERFORMANCE,
  XFORGE_GOV_PACKAGE_BOUNDARIES,
  XFORGE_GOV_REPOSITORY_BOUNDARY,
  XFORGE_GOV_SERVER_FIRST_UI,
} from "../catalogs/governance-reference.catalog";

const PERFORMANCE = "performance" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_PERFORMANCE_THRESHOLDS = {
  renderedCollectionItems: 50,
  visibleTableRows: 100,
  dashboardCards: 24,
} as const;

export const AFENDA_PERFORMANCE_RULES = [
  {
    id: "performance.large-list",
    category: PERFORMANCE,
    severity: ERROR,
    appliesTo: ["list", "table", "grid", "data-grid", "feed"],
    rationale:
      "Large unvirtualized collections degrade rendering performance and interaction latency.",
    requirement:
      "Large collections above governed thresholds require virtualization, pagination, or containment.",
    remediation:
      "Use virtualization, pagination, content-visibility, or server-backed windowing for large collections.",
    references: [AFENDA_GOV_PERFORMANCE, "CoreWebVitals:INP"],
    enforcement: HYBRID,
  },
  {
    id: "performance.no-layout-read-render",
    category: PERFORMANCE,
    severity: ERROR,
    appliesTo: ["component-render", "layout", "measurement", "animation"],
    forbidden: [
      "getBoundingClientRect in render",
      "offsetHeight in render",
      "offsetWidth in render",
      "scrollTop in render",
    ],
    rationale:
      "Layout reads during render can force synchronous layout and destabilize performance.",
    requirement: "Render must not perform layout reads.",
    remediation:
      "Move measurements into effects or observers and batch reads/writes.",
    references: [AFENDA_GOV_PERFORMANCE, "CoreWebVitals:INP"],
    enforcement: STATIC,
  },
  {
    id: "performance.stable-layout",
    category: PERFORMANCE,
    severity: ERROR,
    appliesTo: ["image", "media", "ad-slot", "embed", "async-content", "skeleton"],
    rationale:
      "Layout shift damages perceived quality and can cause accidental interaction in dense enterprise screens.",
    requirement:
      "Content that loads asynchronously must reserve stable space before it appears.",
    remediation:
      "Set width, height, aspect-ratio, placeholder dimensions, or stable skeleton sizing before content loads.",
    references: [AFENDA_GOV_PERFORMANCE, "CoreWebVitals:CLS"],
    enforcement: HYBRID,
  },
  {
    id: "performance.interaction-responsiveness",
    category: PERFORMANCE,
    severity: ERROR,
    appliesTo: ["button", "input", "filter", "search", "table", "mutation-flow"],
    rationale:
      "Enterprise workflows depend on responsive input, filtering, and mutation feedback under real data volume.",
    requirement:
      "User interactions must avoid long main-thread blocking and provide prompt feedback.",
    remediation:
      "Split expensive work, defer noncritical updates, use transitions where appropriate, and show pending state for async work.",
    references: [AFENDA_GOV_PERFORMANCE, "CoreWebVitals:INP"],
    enforcement: HYBRID,
  },
  {
    id: "performance.image-media-loading",
    category: PERFORMANCE,
    severity: WARNING,
    appliesTo: ["image", "video", "avatar", "thumbnail", "hero-media"],
    rationale:
      "Images and media are common sources of slow pages, layout shift, and wasted bandwidth.",
    requirement:
      "Images and media must use appropriate sizing, loading priority, format, and lazy-loading behavior.",
    remediation:
      "Use responsive sizes, explicit dimensions, optimized formats, lazy loading for noncritical media, and priority only for critical visible media.",
    references: [AFENDA_GOV_PERFORMANCE, "CoreWebVitals:LCP", "CoreWebVitals:CLS"],
    enforcement: HYBRID,
  },
  {
    id: "performance.bundle-boundary",
    category: PERFORMANCE,
    severity: WARNING,
    appliesTo: ["client-component", "route", "feature", "dependency", "chart", "editor"],
    rationale:
      "Large client bundles slow enterprise routes and penalize users who only need narrow workflows.",
    requirement:
      "Heavy dependencies and rarely used surfaces must not inflate baseline route bundles.",
    remediation:
      "Use server components where possible, dynamic import heavy clients, and split feature-only dependencies behind route or interaction boundaries.",
    references: [AFENDA_GOV_PERFORMANCE, XFORGE_GOV_PACKAGE_BOUNDARIES],
    enforcement: MANUAL,
  },
  {
    id: "performance.server-first-data-volume",
    category: PERFORMANCE,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "search", "filter", "dashboard", "report"],
    forbidden: [
      "client-side filtering over full enterprise dataset",
      "client-side sorting over full enterprise dataset",
      "shipping full dataset to browser for dashboard aggregation",
    ],
    rationale:
      "Enterprise datasets must not be shipped wholesale to the browser for client-side filtering, sorting, or aggregation.",
    requirement:
      "Large or permissioned datasets must use server-side pagination, filtering, sorting, and aggregation.",
    remediation:
      "Move data shaping to the repository/query layer and send only the current window or projection to the client.",
    references: [AFENDA_GOV_PERFORMANCE, AFENDA_GOV_DATA_ACCESS, XFORGE_GOV_REPOSITORY_BOUNDARY],
    enforcement: HYBRID,
  },
  {
    id: "performance.async-state-feedback",
    category: PERFORMANCE,
    severity: WARNING,
    appliesTo: ["mutation-flow", "server-action", "data-fetch", "table", "form"],
    rationale:
      "Async enterprise work must provide immediate feedback so users do not repeat actions or abandon workflows.",
    requirement:
      "Async operations must expose loading, pending, success, or failure state without blocking unrelated UI.",
    remediation:
      "Use pending indicators, optimistic or deferred updates where safe, and scoped disabled states instead of freezing the whole page.",
    references: [AFENDA_GOV_PERFORMANCE, AFENDA_GOV_FORM_STATE],
    enforcement: MANUAL,
  },
  {
    id: "performance.scoped-pending-state",
    category: PERFORMANCE,
    severity: WARNING,
    appliesTo: ["mutation-flow", "server-action", "form", "table", "page"],
    forbidden: ["global page disabled for local mutation", "full page spinner for local update"],
    rationale:
      "Enterprise users should receive feedback without losing access to unrelated work areas.",
    requirement:
      "Pending and disabled states must be scoped to the affected operation whenever possible.",
    remediation:
      "Disable only the submitting control or affected region; avoid freezing the full page unless the whole page is unsafe to use.",
    references: [AFENDA_GOV_PERFORMANCE, AFENDA_GOV_FORM_STATE],
    enforcement: MANUAL,
  },
  {
    id: "performance.client-boundary-restraint",
    category: PERFORMANCE,
    severity: WARNING,
    appliesTo: ["client-component", "route", "layout", "provider", "feature"],
    forbidden: ["use client at route root without need", "client provider wrapping static route tree"],
    rationale:
      "Unnecessary client boundaries increase hydration cost and reduce route performance.",
    requirement:
      "Client components must be introduced only where interactivity, browser APIs, or client state are required.",
    remediation:
      "Keep route shells and static surfaces server-rendered; move client boundaries down to the smallest interactive island.",
    references: [AFENDA_GOV_PERFORMANCE, XFORGE_GOV_SERVER_FIRST_UI],
    enforcement: HYBRID,
  },
  {
    id: "performance.no-unbounded-render-work",
    category: PERFORMANCE,
    severity: ERROR,
    appliesTo: ["render", "table", "dashboard", "chart", "filter", "search"],
    forbidden: ["unbounded map in render", "expensive sort in render", "expensive filter in render"],
    rationale:
      "Unbounded render work becomes failure-prone when enterprise datasets grow.",
    requirement:
      "Render work must be bounded, cached by the data layer, virtualized, or moved outside hot render paths.",
    remediation:
      "Precompute server-side, paginate/window datasets, or isolate expensive work behind explicit user action.",
    references: [AFENDA_GOV_PERFORMANCE, "CoreWebVitals:INP"],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
