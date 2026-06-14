import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_SEMANTICS,
} from "../catalogs/governance-reference.catalog";

const SEMANTICS = "semantics" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_SEMANTICS_RULES = [
  {
    id: "semantics.native-before-aria",
    category: SEMANTICS,
    severity: WARNING,
    appliesTo: ["component", "layout", "control", "region"],
    rationale:
      "Native HTML carries platform semantics, keyboard behavior, and accessibility mappings before custom ARIA is needed.",
    requirement:
      "Use native semantic elements before adding ARIA roles or scripted behavior.",
    remediation:
      "Prefer semantic HTML elements and only add ARIA when native semantics cannot represent the pattern.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:1.3.1", "HTML-AAM"],
    enforcement: MANUAL,
  },
  {
    id: "semantics.button-link-correctness",
    category: SEMANTICS,
    severity: ERROR,
    appliesTo: ["button", "link", "action", "navigation", "menu-item"],
    forbidden: ["button with href behavior", "link used for mutation", "div[onClick]", "span[onClick]"],
    rationale:
      "Actions and navigation have different native behavior, user expectations, and assistive technology mappings.",
    requirement:
      "Buttons must perform actions; links must navigate to resources or routes.",
    remediation:
      "Use button for mutations and in-place actions; use anchor or Link with href for navigation.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:2.1.1", "WCAG:4.1.2"],
    enforcement: HYBRID,
  },
  {
    id: "semantics.heading-structure",
    category: SEMANTICS,
    severity: ERROR,
    appliesTo: ["heading", "page", "section", "article"],
    rationale:
      "Headings define document structure and allow users to scan enterprise pages efficiently.",
    requirement:
      "Headings must represent semantic page and section structure, independent of visual size.",
    remediation:
      "Use h1 through h6 according to structure; do not choose heading levels for visual size only.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:1.3.1", "WCAG:2.4.6"],
    enforcement: MANUAL,
  },
  {
    id: "semantics.accessible-name",
    category: SEMANTICS,
    severity: ERROR,
    appliesTo: ["button", "link", "input", "select", "textarea", "custom-control", "icon-button"],
    rationale:
      "Interactive and form controls need an accessible name so assistive technology users can identify their purpose.",
    requirement:
      "Interactive elements and form controls must expose a meaningful accessible name.",
    remediation:
      "Prefer visible text or label association; use aria-label or aria-labelledby only when the component pattern requires it.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:4.1.2", "WCAG:2.5.3"],
    enforcement: HYBRID,
  },
  {
    id: "semantics.list-structure",
    category: SEMANTICS,
    severity: WARNING,
    appliesTo: ["list", "menu-list", "breadcrumb", "feed", "collection"],
    rationale:
      "Lists communicate item grouping, count, and sequence to assistive technology and browser tooling.",
    requirement:
      "Repeated related items must use list semantics when the relationship is meaningful.",
    remediation:
      "Use ul, ol, and li for meaningful item groups instead of unstructured div sequences.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:1.3.1"],
    enforcement: HYBRID,
  },
  {
    id: "semantics.table-structure",
    category: SEMANTICS,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "comparison-table", "report"],
    rationale:
      "Tabular data needs explicit row, column, and header relationships for reliable interpretation.",
    requirement:
      "Tabular data must use table semantics or an accessible grid pattern with header relationships.",
    remediation:
      "Use table, thead, tbody, th, scope, and caption where appropriate; only use grid roles for interactive grids.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:1.3.1", "WAI-ARIA-APG:grid"],
    enforcement: HYBRID,
  },
  {
    id: "semantics.status-semantics",
    category: SEMANTICS,
    severity: WARNING,
    appliesTo: ["toast", "status", "alert", "validation-message", "async-status"],
    rationale:
      "Status messages must expose the correct urgency so users receive useful updates without unnecessary interruption.",
    requirement:
      "Status, alert, and validation messages must use semantics that match their urgency and purpose.",
    remediation:
      "Use role=status or aria-live=polite for non-critical updates; use role=alert only for urgent errors.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:4.1.3"],
    enforcement: HYBRID,
  },
  {
    id: "semantics.disclosure-semantics",
    category: SEMANTICS,
    severity: ERROR,
    appliesTo: ["accordion", "disclosure", "details", "expand-collapse", "tree"],
    rationale:
      "Expandable regions must expose their expanded state and relationship to controlled content.",
    requirement:
      "Disclosure controls must expose expanded/collapsed state and control relationship.",
    remediation:
      "Use native details/summary where suitable or pair the trigger with aria-expanded and aria-controls.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:4.1.2", "WAI-ARIA-APG:disclosure"],
    enforcement: HYBRID,
  },
  {
    id: "semantics.valid-aria",
    category: SEMANTICS,
    severity: ERROR,
    appliesTo: ["aria", "component", "custom-control", "interactive-element"],
    forbidden: ["invalid aria-* attribute", "aria role/state mismatch", "aria-hidden on focusable element"],
    rationale:
      "Invalid ARIA can override correct native semantics and create broken accessibility trees.",
    requirement:
      "ARIA roles, states, and properties must be valid for the element and interaction pattern.",
    remediation:
      "Remove invalid ARIA, use native semantics, or apply the correct role/state combination from the pattern contract.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:4.1.2", "ARIA"],
    enforcement: STATIC,
  },
  {
    id: "semantics.presentation-role-safety",
    category: SEMANTICS,
    severity: ERROR,
    appliesTo: ["table", "list", "interactive-element", "layout", "component"],
    forbidden: [
      "role=presentation on meaningful content",
      "role=none on meaningful content",
      "role=presentation on focusable element",
      "role=none on focusable element",
      "role=\"presentation\" on meaningful content",
      "role=\"none\" on meaningful content",
    ],
    rationale:
      "Presentation roles can remove meaningful structure from the accessibility tree when used incorrectly.",
    requirement:
      "role=presentation and role=none must only be used on truly decorative or structural wrapper elements.",
    remediation:
      "Remove presentation roles from meaningful, focusable, table, list, or interactive elements.",
    references: [AFENDA_GOV_SEMANTICS, "WCAG:1.3.1", "ARIA"],
    enforcement: STATIC,
  },
] as const satisfies readonly AfendaRuntimeRule[];
