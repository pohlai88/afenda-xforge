import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_ACCESSIBILITY,
  AFENDA_GOV_DATA_DISPLAY,
  AFENDA_GOV_DENSITY,
  AFENDA_GOV_FORMS,
  AFENDA_GOV_INTERACTION,
  AFENDA_GOV_LAYOUT,
  AFENDA_GOV_RESPONSIVE_LAYOUT,
  AFENDA_GOV_ROUTE_STATE,
  AFENDA_GOV_TOUCH_LAYOUT,
} from "../catalogs/governance-reference.catalog";

const TOUCH_LAYOUT = "touch-layout" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_TOUCH_LAYOUT_RULES = [
  {
    id: "touch-layout.no-zoom-disabled",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["viewport-meta", "mobile-shell", "app-shell"],
    forbidden: ["user-scalable=no", "maximum-scale=1", "maximum-scale=1.0"],
    rationale:
      "Touch users must retain browser zoom for readability, low vision support, and dense data inspection.",
    requirement:
      "Touch layouts must not disable user zoom.",
    remediation:
      "Remove zoom-disabling viewport directives and fix layout issues through responsive design instead.",
    references: [AFENDA_GOV_TOUCH_LAYOUT, "WCAG:1.4.4"],
    enforcement: STATIC,
  },
  {
    id: "touch-layout.target-spacing",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["button", "icon-button", "row-action", "menu-item", "touch-target"],
    rationale:
      "Crowded touch targets increase accidental activation risk in dense enterprise interfaces.",
    requirement:
      "Touch targets must provide minimum target size or equivalent spacing.",
    remediation:
      "Provide at least 24x24 CSS px target size with spacing; prefer 40x40 CSS px for primary app controls.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_INTERACTION,
      "WCAG:2.5.8",
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.density-touch-mode",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["button", "table-row", "menu-item", "form-field", "toolbar", "navigation"],
    rationale:
      "Compact enterprise density must not make touch interactions unsafe or frustrating.",
    requirement:
      "Compact density must preserve minimum touch target size, spacing, and readable labels on touch-capable devices.",
    remediation:
      "Resolve spacing through density-aware touch tokens and provide larger hit areas than visual chrome when needed.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_DENSITY,
      AFENDA_GOV_INTERACTION,
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.no-hover-dependent-controls",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["table", "card", "row-action", "toolbar", "menu", "interactive-element"],
    forbidden: ["touch action only visible on hover", "critical control hidden until hover"],
    rationale:
      "Touch users cannot rely on hover to discover or operate critical controls.",
    requirement:
      "Critical touch actions must be visible, focus-revealed, or available through an explicit touch affordance.",
    remediation:
      "Expose actions persistently, through a visible overflow menu, or through a tap-accessible disclosure pattern.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_INTERACTION,
      "WCAG:1.4.13",
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.gesture-alternative",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["swipe-action", "drag-action", "sortable", "carousel", "data-grid", "canvas"],
    rationale:
      "Gesture-only controls are hard to discover and can exclude keyboard, screen reader, and precision-limited users.",
    requirement:
      "Critical actions triggered by gestures must also be available through visible controls or keyboard-accessible alternatives.",
    remediation:
      "Provide buttons, overflow menus, keyboard actions, or explicit handles for gesture-based workflows.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_INTERACTION,
      AFENDA_GOV_ACCESSIBILITY,
      "WCAG:2.5.1",
      "WCAG:2.5.7",
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.drag-scroll-conflict",
    category: TOUCH_LAYOUT,
    severity: WARNING,
    appliesTo: ["draggable", "sortable", "slider", "canvas", "data-grid", "scroll-container"],
    rationale:
      "Touch drag interactions can conflict with page scrolling and create accidental data changes.",
    requirement:
      "Drag, swipe, and scroll gestures must have clear boundaries and cancellation paths.",
    remediation:
      "Use explicit drag handles, pointer cancellation, axis locking, and non-gesture alternatives for critical actions.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_INTERACTION,
      "WCAG:2.5.2",
      "WCAG:2.5.7",
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.modal-containment",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["modal", "drawer", "sheet", "popover", "bottom-sheet"],
    rationale:
      "Contained touch and overscroll behavior keeps modal, drawer, and sheet interactions from leaking to the page behind.",
    requirement:
      "Modal surfaces must contain touch scrolling, prevent background scroll bleed, and preserve dismissal controls.",
    remediation:
      "Apply overscroll-behavior containment, lock background scroll, keep close controls reachable, and avoid nested scroll traps.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_LAYOUT,
      "WCAG:2.1.1",
      "WCAG:2.4.7",
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.safe-area-insets",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["modal", "drawer", "sheet", "bottom-bar", "fixed-action", "toast"],
    rationale:
      "Touch controls near viewport edges must remain reachable around notches, browser chrome, and system gesture areas.",
    requirement:
      "Edge-aligned touch surfaces must account for device safe-area insets.",
    remediation:
      "Use safe-area inset variables for padding and offsets on sheets, drawers, bottom bars, toasts, and fixed actions.",
    references: [AFENDA_GOV_TOUCH_LAYOUT, AFENDA_GOV_LAYOUT],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.keyboard-overlap",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["modal", "sheet", "form", "input", "textarea", "combobox"],
    rationale:
      "Mobile keyboards can obscure active fields, validation messages, and submit controls.",
    requirement:
      "Touch layouts with text entry must keep the focused field, error text, and primary action visible when the keyboard opens.",
    remediation:
      "Use keyboard-aware scrolling, viewport units, sticky submit regions, and focus scroll offsets for form surfaces.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_FORMS,
      "WCAG:2.4.11",
      "WCAG:3.3.1",
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.sticky-action-safe-zone",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["sticky-footer", "bottom-bar", "fixed-action", "mobile-form", "checkout-action"],
    rationale:
      "Sticky primary actions can overlap content, validation messages, or system gesture regions on touch devices.",
    requirement:
      "Sticky touch actions must reserve safe layout space and remain reachable without hiding required content.",
    remediation:
      "Use safe-area padding, content bottom padding, scroll margins, and keyboard-aware sticky regions.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_FORMS,
      AFENDA_GOV_LAYOUT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.mobile-data-grid-adaptation",
    category: TOUCH_LAYOUT,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "report", "comparison-table", "approval-list"],
    rationale:
      "Desktop tables often become unusable on touch screens without responsive interaction patterns.",
    requirement:
      "Dense data grids must provide a touch-usable layout, scrolling model, or card/list alternative.",
    remediation:
      "Use pinned key columns, horizontal scroll affordances, row detail panels, or responsive card rows for narrow touch layouts.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_DATA_DISPLAY,
      AFENDA_GOV_RESPONSIVE_LAYOUT,
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.viewport-change-resilience",
    category: TOUCH_LAYOUT,
    severity: WARNING,
    appliesTo: ["modal", "sheet", "form", "data-grid", "dashboard", "app-shell"],
    rationale:
      "Mobile browser chrome, rotation, split-screen, and keyboard changes can resize the viewport during workflows.",
    requirement:
      "Touch layouts must remain usable when viewport height or orientation changes.",
    remediation:
      "Avoid fragile fixed heights, use dynamic viewport units, responsive reflow, and preserve focused content visibility.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_LAYOUT,
      AFENDA_GOV_ROUTE_STATE,
    ],
    enforcement: HYBRID,
  },
  {
    id: "touch-layout.scroll-restoration",
    category: TOUCH_LAYOUT,
    severity: WARNING,
    appliesTo: ["route", "list", "detail-panel", "infinite-scroll", "data-grid", "tab"],
    rationale:
      "Losing scroll position after navigation or mutation slows mobile enterprise workflows.",
    requirement:
      "Touch-heavy list/detail workflows should preserve or intentionally reset scroll position.",
    remediation:
      "Use scoped scroll restoration keyed by route, filters, tenant scope, and selected record.",
    references: [
      AFENDA_GOV_TOUCH_LAYOUT,
      AFENDA_GOV_ROUTE_STATE,
      AFENDA_GOV_DATA_DISPLAY,
    ],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
