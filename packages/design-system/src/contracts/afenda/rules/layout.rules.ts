import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_EMPTY_STATE,
  AFENDA_GOV_LAYOUT,
} from "../catalogs/governance-reference.catalog";

const LAYOUT = "layout" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_LAYOUT_RULES = [
  {
    id: "layout.responsive-reflow",
    category: LAYOUT,
    severity: ERROR,
    appliesTo: ["page", "app-shell", "dashboard", "table", "form", "card-grid"],
    rationale:
      "Enterprise layouts must remain usable across supported viewport widths without forcing two-dimensional page scrolling.",
    requirement:
      "Layouts must reflow responsively without causing page-level horizontal overflow.",
    remediation:
      "Use responsive grids, wrapping, container constraints, and adaptive density instead of fixed-width page structures.",
    references: [AFENDA_GOV_LAYOUT, "WCAG:1.4.10"],
    enforcement: HYBRID,
  },
  {
    id: "layout.overflow-containment",
    category: LAYOUT,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "code-block", "chart", "panel", "modal"],
    rationale:
      "Wide enterprise content must be contained so one component does not break the whole page layout.",
    requirement:
      "Known wide content must use local overflow containment instead of creating global horizontal scroll.",
    remediation:
      "Wrap wide regions in a scroll container with max-width constraints and preserve surrounding page layout.",
    references: [AFENDA_GOV_LAYOUT, "WCAG:1.4.10"],
    enforcement: HYBRID,
  },
  {
    id: "layout.min-width-zero",
    category: LAYOUT,
    severity: ERROR,
    appliesTo: ["flex-child", "grid-child", "card", "table-cell", "content-panel"],
    forbidden: ["flex child with long text and no min-w-0", "grid child with long text and no min-w-0"],
    rationale:
      "Flex and grid children can refuse to shrink, causing long enterprise identifiers to blow out layouts.",
    requirement:
      "Shrinkable flex and grid children that contain text or user data must allow overflow handling.",
    remediation:
      "Apply min-width: 0 or equivalent utilities, then use truncate, wrapping, or line clamping as appropriate.",
    references: [AFENDA_GOV_LAYOUT],
    enforcement: HYBRID,
  },
  {
    id: "layout.sticky-chrome-offset",
    category: LAYOUT,
    severity: ERROR,
    appliesTo: ["sticky-header", "fixed-toolbar", "anchor-target", "scroll-container"],
    rationale:
      "Sticky and fixed chrome can obscure anchors, focused controls, validation errors, and active content.",
    requirement:
      "Layouts with sticky or fixed chrome must define offsets for anchor and scroll targets.",
    remediation:
      "Use scroll-padding, scroll-margin, safe offsets, or layout variables that account for fixed chrome height.",
    references: [AFENDA_GOV_LAYOUT, "WCAG:2.4.11", "WCAG:2.4.12"],
    enforcement: HYBRID,
  },
  {
    id: "layout.scroll-container-contract",
    category: LAYOUT,
    severity: WARNING,
    appliesTo: ["scroll-container", "modal", "drawer", "panel", "data-grid"],
    rationale:
      "Nested scroll containers can trap users, hide controls, and create unpredictable wheel or touch behavior.",
    requirement:
      "Scroll containers must have explicit boundaries, visible overflow intent, and keyboard-accessible content.",
    remediation:
      "Set explicit max heights, preserve focus visibility, avoid unnecessary nested scrolling, and expose scrollable regions intentionally.",
    references: [AFENDA_GOV_LAYOUT, "WCAG:2.1.1", "WCAG:2.4.7", "WCAG:2.4.11"],
    enforcement: MANUAL,
  },
  {
    id: "layout.content-clipping-safety",
    category: LAYOUT,
    severity: ERROR,
    appliesTo: ["card", "table-cell", "panel", "badge", "metric", "toolbar"],
    forbidden: ["overflow-hidden without title/tooltip/full-value access"],
    rationale:
      "Enterprise identifiers, amounts, names, and statuses must not be silently clipped without a recovery path.",
    requirement:
      "Clipped or truncated important content must provide access to the full value.",
    remediation:
      "Use wrapping, title text, tooltip, detail drawer, or copy affordance for truncated important values.",
    references: [AFENDA_GOV_LAYOUT],
    enforcement: HYBRID,
  },
  {
    id: "layout.empty-state-ownership",
    category: LAYOUT,
    severity: WARNING,
    appliesTo: ["empty-state", "table", "list", "dashboard", "panel"],
    rationale:
      "Empty states must preserve layout intent and prevent enterprise surfaces from collapsing into broken-looking pages.",
    requirement:
      "Empty states must reserve appropriate space and communicate the missing content region.",
    remediation:
      "Render a governed empty state with stable spacing, title, explanation, and next action where appropriate.",
    references: [AFENDA_GOV_LAYOUT, AFENDA_GOV_EMPTY_STATE],
    enforcement: MANUAL,
  },
  {
    id: "layout.safe-area-aware",
    category: LAYOUT,
    severity: WARNING,
    appliesTo: ["mobile-shell", "bottom-bar", "drawer", "modal", "toast", "fixed-action"],
    rationale:
      "Fixed controls must remain reachable around browser chrome, notches, and device safe areas.",
    requirement:
      "Fixed and edge-aligned layout regions must account for safe-area insets where applicable.",
    remediation:
      "Use safe-area inset variables or platform-aware padding for bottom bars, drawers, modals, and fixed actions.",
    references: [AFENDA_GOV_LAYOUT, "WCAG:1.4.10"],
    enforcement: MANUAL,
  },
  {
    id: "layout.stable-dimensions",
    category: LAYOUT,
    severity: ERROR,
    appliesTo: ["image", "media", "skeleton", "card", "async-content", "embedded-content"],
    rationale:
      "Unreserved space causes layout shift and makes dense enterprise pages feel unstable.",
    requirement:
      "Async, media, and embedded content must reserve stable layout dimensions before content loads.",
    remediation:
      "Provide width, height, aspect-ratio, skeleton dimensions, or stable container sizing before loading content.",
    references: [AFENDA_GOV_LAYOUT, "CoreWebVitals:CLS"],
    enforcement: HYBRID,
  },
  {
    id: "layout.density-breakpoints",
    category: LAYOUT,
    severity: WARNING,
    appliesTo: ["dashboard", "table", "toolbar", "filter-bar", "card-grid"],
    rationale:
      "Dense enterprise layouts need intentional breakpoint behavior instead of accidental compression.",
    requirement:
      "High-density layouts must define how controls wrap, collapse, or move across breakpoints.",
    remediation:
      "Define breakpoint-specific column counts, toolbar wrapping, filter disclosure, and table/card alternatives.",
    references: [AFENDA_GOV_LAYOUT],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
