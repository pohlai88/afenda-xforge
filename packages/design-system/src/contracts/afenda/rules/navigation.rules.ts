import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_NAVIGATION,
} from "../catalogs/governance-reference.catalog";

const NAVIGATION = "navigation" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_NAVIGATION_RULES = [
  {
    id: "navigation.real-links-for-navigation",
    category: NAVIGATION,
    severity: ERROR,
    appliesTo: ["navigation", "link", "menu-item", "breadcrumb", "pagination"],
    forbidden: ["button navigation", "div navigation", "onClick push without link"],
    rationale:
      "Navigation needs real link semantics for keyboard behavior, context menus, prefetching, and assistive technology.",
    requirement: "Navigation must use link semantics instead of action controls.",
    remediation: "Use a link component or anchor with an href for route changes.",
    references: [AFENDA_GOV_NAVIGATION, "WCAG:2.4.4", "WCAG:4.1.2"],
    enforcement: HYBRID,
  },
  {
    id: "navigation.current-location-indicator",
    category: NAVIGATION,
    severity: ERROR,
    appliesTo: ["navigation", "sidebar", "tabs", "breadcrumb", "menu-item"],
    rationale:
      "Users need to understand where they are in complex enterprise navigation.",
    requirement:
      "Current page, step, tab, or section must be visually and programmatically indicated.",
    remediation:
      "Use visible active styling and aria-current=\"page\", aria-current=\"step\", or equivalent where the item represents current location.",
    references: [AFENDA_GOV_NAVIGATION, "WCAG:2.4.8", "WCAG:1.3.1"],
    enforcement: MANUAL,
  },
  {
    id: "navigation.skip-link-target",
    category: NAVIGATION,
    severity: ERROR,
    appliesTo: ["skip-link", "main", "app-shell", "page-layout"],
    rationale:
      "Skip links must resolve to the primary content region to support reliable keyboard navigation.",
    requirement:
      "Skip links must target the main content landmark with a stable id.",
    remediation:
      "Ensure the skip link href points to the main element id, for example href=\"#main\" and <main id=\"main\">.",
    references: [AFENDA_GOV_NAVIGATION, "WCAG:2.4.1"],
    enforcement: HYBRID,
  },
  {
    id: "navigation.landmark-structure",
    category: NAVIGATION,
    severity: ERROR,
    appliesTo: ["app-shell", "page-layout", "header", "main", "aside", "footer", "navigation"],
    rationale:
      "Landmarks let keyboard and assistive technology users understand and jump through enterprise app structure.",
    requirement:
      "Application shells and pages must expose semantic landmarks for primary regions.",
    remediation:
      "Use semantic header, nav, main, aside, and footer elements with accessible labels where regions repeat.",
    references: [AFENDA_GOV_NAVIGATION, "WCAG:1.3.1", "WCAG:2.4.1"],
    enforcement: HYBRID,
  },
  {
    id: "navigation.unique-nav-labels",
    category: NAVIGATION,
    severity: WARNING,
    appliesTo: ["navigation", "sidebar", "topbar", "footer-nav", "secondary-nav"],
    rationale:
      "Repeated navigation regions need distinguishable names so assistive technology users can choose the correct region.",
    requirement:
      "Multiple navigation landmarks on the same page must have unique accessible labels.",
    remediation:
      "Add concise aria-label values such as Primary navigation, Secondary navigation, Breadcrumb, or Footer navigation.",
    references: [AFENDA_GOV_NAVIGATION, "WCAG:1.3.1", "WCAG:2.4.6"],
    enforcement: MANUAL,
  },
  {
    id: "navigation.breadcrumb-semantics",
    category: NAVIGATION,
    severity: WARNING,
    appliesTo: ["breadcrumb", "breadcrumb-item", "record-detail", "nested-page"],
    rationale:
      "Breadcrumbs communicate hierarchy and reduce disorientation in deep enterprise workflows.",
    requirement:
      "Breadcrumb navigation must expose hierarchy and identify the current page.",
    remediation:
      "Use a labeled nav region, ordered list semantics, real links for ancestors, and aria-current on the current page.",
    references: [AFENDA_GOV_NAVIGATION, "WCAG:2.4.8", "WCAG:1.3.1"],
    enforcement: HYBRID,
  },
  {
    id: "navigation.menu-semantics",
    category: NAVIGATION,
    severity: WARNING,
    appliesTo: ["menu", "dropdown-menu", "menubar", "command-menu", "application-menu"],
    rationale:
      "Menu semantics must match the interaction pattern so keyboard and assistive technology behavior remains predictable.",
    requirement:
      "Application menus must use correct menu semantics and keyboard behavior; simple site navigation should remain link navigation.",
    remediation:
      "Use a tested menu primitive for application menus and avoid role=menu for ordinary navigation link lists.",
    references: [
      AFENDA_GOV_NAVIGATION,
      "WCAG:2.1.1",
      "WCAG:4.1.2",
      "WAI-ARIA-APG:menu-button",
    ],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
