import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import { AFENDA_GOV_ACCESSIBILITY } from "../catalogs/governance-reference.catalog";

const ACCESSIBILITY = "accessibility" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_APCA_CONTRAST_TARGETS = {
  criticalText: 75,
  standardUiText: 60,
  largeDisplayText: 45,
} as const;

export const AFENDA_ACCESSIBILITY_RULES = [
  {
    id: "accessibility.icon-button-label",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["button", "icon-button", "toolbar"],
    rationale:
      "Assistive technology users need a text alternative for icon-only controls.",
    requirement: "Icon-only buttons must expose a useful aria-label.",
    remediation: "Add aria-label that names the action.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:4.1.2", "WCAG:2.4.6"],
    enforcement: STATIC,
  },
  {
    id: "accessibility.form-control-label",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["input", "select", "textarea", "checkbox", "radio"],
    rationale:
      "Labels establish the accessible name and make form controls understandable.",
    requirement: "Form controls must have a label or aria-label.",
    remediation: "Use a visible label with htmlFor or a wrapping label.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:3.3.2", "WCAG:4.1.2"],
    enforcement: STATIC,
  },
  {
    id: "accessibility.keyboard-operable",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["interactive-element", "custom-control"],
    rationale:
      "Keyboard users must be able to reach and operate every interactive control.",
    requirement: "Interactive elements must be keyboard operable.",
    remediation:
      "Use native interactive elements first. Only implement custom keyboard handling when native controls are not suitable.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:2.1.1", "WCAG:2.1.3"],
    enforcement: HYBRID,
  },
  {
    id: "accessibility.semantic-action-navigation",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["button", "link", "navigation", "action"],
    forbidden: ["div[onClick]", "span[onClick]", "onClick navigation without Link"],
    rationale:
      "Native action and navigation elements preserve keyboard behavior, semantics, and browser affordances.",
    requirement: "Use buttons for actions and links for navigation.",
    remediation: "Replace clickable non-controls with button or Link/a.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:2.1.1", "WCAG:4.1.2"],
    enforcement: STATIC,
  },
  {
    id: "accessibility.image-alt",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["img", "Image"],
    rationale:
      "Images need text alternatives unless they are purely decorative.",
    requirement: "Images must define alt text, with empty alt only for decoration.",
    remediation: "Add meaningful alt text or alt=\"\" for decorative media.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:1.1.1"],
    enforcement: STATIC,
  },
  {
    id: "accessibility.text-contrast",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["text", "badge", "button", "table", "form", "card"],
    rationale:
      "Text must remain readable across themes, densities, visual states, font sizes, and font weights.",
    requirement:
      "Text contrast must satisfy APCA targets and must not violate WCAG 2.1 AA minimum requirements.",
    remediation:
      "Evaluate foreground/background pairs using APCA first, then verify WCAG AA compliance.",
    references: [AFENDA_GOV_ACCESSIBILITY, "APCA", "WCAG:1.4.3", "WCAG:1.4.11"],
    enforcement: STATIC,
  },
  {
    id: "accessibility.decorative-icon-hidden",
    category: ACCESSIBILITY,
    severity: WARNING,
    appliesTo: ["icon", "svg", "decorative-icon"],
    rationale:
      "Decorative icons can add noise to the accessibility tree when exposed.",
    requirement: "Decorative icons must be hidden from assistive technology.",
    remediation: "Add aria-hidden=\"true\" to decorative icons.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:1.1.1"],
    enforcement: HYBRID,
  },
  {
    id: "accessibility.async-update-live-region",
    category: ACCESSIBILITY,
    severity: WARNING,
    appliesTo: ["toast", "validation-message", "async-status"],
    rationale:
      "User-facing async status changes should be announced, while silent background refreshes should stay quiet.",
    requirement: "Async updates must be announced politely.",
    remediation:
      "Use aria-live=\"polite\" for user-facing toasts, validation, and async status changes.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:4.1.3"],
    enforcement: MANUAL,
  },
  {
    id: "accessibility.semantic-html-first",
    category: ACCESSIBILITY,
    severity: WARNING,
    appliesTo: ["layout", "page", "component"],
    rationale:
      "Semantic elements carry platform behavior and accessible structure before ARIA is needed.",
    requirement: "Use semantic HTML before ARIA.",
    remediation: "Prefer header, nav, main, section, article, aside, and footer.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:1.3.1", "HTML-AAM"],
    enforcement: MANUAL,
  },
  {
    id: "accessibility.heading-hierarchy",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["heading", "page", "section"],
    rationale:
      "A logical heading outline lets users scan and navigate page structure.",
    requirement: "Headings must follow a logical document hierarchy.",
    remediation: "Use heading levels that accurately represent document structure.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:1.3.1", "WCAG:2.4.6"],
    enforcement: MANUAL,
  },
  {
    id: "accessibility.skip-link-main",
    category: ACCESSIBILITY,
    severity: ERROR,
    appliesTo: ["app-shell", "page-layout", "main"],
    rationale:
      "Keyboard and assistive technology users must be able to bypass repeated navigation.",
    requirement: "Pages must include a skip link to main content.",
    remediation: "Add a skip link targeting the main element.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:2.4.1"],
    enforcement: STATIC,
  },
  {
    id: "accessibility.heading-anchor-offset",
    category: ACCESSIBILITY,
    severity: WARNING,
    appliesTo: ["heading-anchor", "anchor-link"],
    rationale:
      "Anchored headings should remain visible when fixed chrome is present.",
    requirement: "Heading anchors need scroll-margin-top.",
    remediation: "Set scroll-margin-top so anchored headings are not hidden by chrome.",
    references: [AFENDA_GOV_ACCESSIBILITY, "WCAG:2.4.1", "WCAG:2.4.7"],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
