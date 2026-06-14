import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import { AFENDA_GOV_FOCUS } from "../catalogs/governance-reference.catalog";

const FOCUS = "focus" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_FOCUS_RULES = [
  {
    id: "focus.visible-focus",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["button", "link", "input", "select", "textarea", "interactive-element"],
    forbidden: ["outline-none without focus-visible replacement", "outline: none"],
    rationale:
      "Keyboard users need a visible focus indicator to understand current interaction position.",
    requirement: "Interactive elements must have visible keyboard focus.",
    remediation: "Add focus-visible ring, outline, or equivalent focus treatment.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.7", "WCAG:1.4.11"],
    enforcement: HYBRID,
  },
  {
    id: "focus.focus-appearance-minimum",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["button", "link", "input", "select", "textarea", "interactive-element"],
    rationale:
      "A focus indicator must be visibly strong enough to distinguish the focused component.",
    requirement:
      "Focus indicators must meet WCAG 2.2 focus appearance expectations for size and contrast.",
    remediation:
      "Use a visible outline or ring with sufficient thickness and contrast against adjacent colors.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.13", "WCAG:1.4.11"],
    enforcement: HYBRID,
  },
  {
    id: "focus.logical-focus-order",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["page", "layout", "form", "dialog", "navigation", "interactive-element"],
    forbidden: [
      "tabindex greater than 0",
      "tabindex>0",
      "visual order that conflicts with DOM focus order",
    ],
    rationale:
      "Keyboard focus order must preserve meaning and operability across complex enterprise layouts.",
    requirement:
      "Focusable elements must receive focus in a logical order that matches the workflow.",
    remediation:
      "Avoid positive tabindex. Keep DOM order aligned with visual and workflow order.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.3"],
    enforcement: HYBRID,
  },
  {
    id: "focus.no-outline-none-without-replacement",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["button", "link", "input", "select", "textarea", "interactive-element"],
    forbidden: ["outline-none", "outline: none"],
    rationale:
      "Removing outlines without replacement breaks keyboard navigation visibility.",
    requirement: "Focus outlines must not be removed unless an equivalent focus style replaces them.",
    remediation: "Pair outline removal with a visible focus-visible ring or outline.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.7"],
    enforcement: STATIC,
  },
  {
    id: "focus.use-focus-visible",
    category: FOCUS,
    severity: WARNING,
    appliesTo: ["button", "link", "input", "select", "textarea", "interactive-element"],
    rationale:
      "Focus rings should appear for keyboard focus without creating noisy mouse-click states.",
    requirement: "Use focus-visible for keyboard focus styling.",
    remediation: "Prefer :focus-visible or focus-visible utilities over broad :focus styling.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.7"],
    enforcement: HYBRID,
  },
  {
    id: "focus.compound-control-focus-within",
    category: FOCUS,
    severity: WARNING,
    appliesTo: ["compound-control", "input-group", "combobox", "search-field"],
    rationale:
      "Compound controls need a visible group-level focus state when focus moves inside them.",
    requirement: "Compound controls must expose focus-within styling.",
    remediation: "Use :focus-within or an equivalent wrapper state on compound controls.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.7", "WCAG:1.4.11"],
    enforcement: MANUAL,
  },
  {
    id: "focus.modal-focus-trap",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["modal", "dialog", "alert-dialog", "sheet"],
    rationale:
      "Modal focus must stay inside the active modal so keyboard users do not interact with hidden page content.",
    requirement: "Modal dialogs must trap focus while open.",
    remediation: "Use a dialog primitive with focus trapping and make background content inert.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.1.1", "WCAG:2.4.3", "WAI-ARIA-APG:dialog-modal"],
    enforcement: HYBRID,
  },
  {
    id: "focus.restore-focus-after-dialog",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["modal", "dialog", "alert-dialog", "sheet", "popover"],
    rationale:
      "Returning focus after dismissal preserves keyboard position and workflow continuity.",
    requirement: "Dismissed overlays must restore focus to the triggering control or logical next target.",
    remediation: "Store the trigger element and restore focus after close.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.3", "WCAG:3.2.1"],
    enforcement: MANUAL,
  },
  {
    id: "focus.skip-link-visible-on-focus",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["skip-link", "app-shell", "page-layout", "main"],
    rationale:
      "A skip link only works for keyboard users when it becomes visible on focus.",
    requirement: "Skip links must become visible when focused.",
    remediation: "Style skip links as visually hidden by default and visible on focus-visible.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.1", "WCAG:2.4.7"],
    enforcement: STATIC,
  },
  {
    id: "focus.focus-not-obscured",
    category: FOCUS,
    severity: ERROR,
    appliesTo: ["focused-element", "sticky-header", "fixed-toolbar", "scroll-container"],
    rationale:
      "Focused controls must remain visible and unobscured by sticky or fixed chrome.",
    requirement: "Focused elements must not be hidden behind sticky headers, footers, or overlays.",
    remediation: "Use scroll-margin, safe offsets, or focus management that accounts for fixed chrome.",
    references: [AFENDA_GOV_FOCUS, "WCAG:2.4.11", "WCAG:2.4.12"],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
