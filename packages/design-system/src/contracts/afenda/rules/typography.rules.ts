import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const TYPOGRAPHY = "typography" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_TYPOGRAPHY_RULES = [
  {
    id: "typography.tokenized-type-scale",
    category: TYPOGRAPHY,
    severity: ERROR,
    appliesTo: ["heading", "body-text", "label", "metric", "caption"],
    forbidden: ["hard-coded font-size", "arbitrary line-height", "one-off font-weight"],
    rationale:
      "Tokenized typography keeps hierarchy, density, and brand expression consistent across product surfaces.",
    requirement:
      "Typography must use approved type scale, line-height, weight, and tracking tokens.",
    remediation:
      "Use governed text styles or typography tokens instead of local one-off CSS values.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:type-scale-contract",
      "AFENDA:theme-token-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "typography.density-aware-scale",
    category: TYPOGRAPHY,
    severity: ERROR,
    appliesTo: ["app-shell", "table", "form", "card", "list", "dashboard"],
    rationale:
      "Enterprise products often support compact, comfortable, and spacious modes, but typography must remain governed.",
    requirement:
      "Typography must resolve through approved density-aware text tokens.",
    remediation:
      "Use density-aware text styles instead of local font-size and line-height overrides.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:density-contract",
      "AFENDA:theme-token-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "typography.semantic-heading-order",
    category: TYPOGRAPHY,
    severity: ERROR,
    appliesTo: ["page", "modal", "drawer", "section", "card"],
    rationale:
      "Visual heading size must not replace semantic document structure.",
    requirement:
      "Pages and major surfaces must use semantic heading order without skipping levels for visual styling.",
    remediation:
      "Use h1-h6 for structure and apply visual typography tokens separately.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:semantics-contract",
      "WCAG:1.3.1",
    ],
    enforcement: HYBRID,
  },
  {
    id: "typography.copy-symbols",
    category: TYPOGRAPHY,
    severity: WARNING,
    appliesTo: ["text", "loading-state", "heading"],
    forbidden: ["...", "Loading...", "Saving..."],
    rationale:
      "Consistent typographic symbols improve polish and machine-generated copy quality.",
    requirement:
      "Use proper ellipsis and balanced or pretty heading wrapping.",
    remediation:
      "Use the ellipsis glyph and text-wrap balance or pretty on headings.",
    references: ["AFENDA:typography-contract", "AFENDA:content-contract"],
    enforcement: STATIC,
  },
  {
    id: "typography.heading-balance",
    category: TYPOGRAPHY,
    severity: WARNING,
    appliesTo: ["heading", "hero-title", "card-title", "empty-state-title"],
    rationale:
      "Headings that wrap poorly reduce polish and make hierarchy harder to scan.",
    requirement:
      "Headings should use balanced or intentional wrapping where supported.",
    remediation:
      "Use text-wrap: balance or authored line breaks for major headings while preserving semantic heading structure.",
    references: ["AFENDA:typography-contract"],
    enforcement: HYBRID,
  },
  {
    id: "typography.readable-measure",
    category: TYPOGRAPHY,
    severity: WARNING,
    appliesTo: ["paragraph", "description", "empty-state", "help-text", "article"],
    rationale:
      "Long text lines reduce readability and make enterprise guidance harder to scan.",
    requirement:
      "Long-form text must use a readable measure and appropriate line height.",
    remediation:
      "Constrain prose width, use readable line-height tokens, and avoid full-width paragraphs in wide layouts.",
    references: ["AFENDA:typography-contract", "WCAG:1.4.8"],
    enforcement: MANUAL,
  },
  {
    id: "typography.zoom-resilience",
    category: TYPOGRAPHY,
    severity: ERROR,
    appliesTo: ["text", "table", "form", "navigation", "modal", "dashboard"],
    rationale:
      "Enterprise UI must remain readable and usable when users zoom or increase text size.",
    requirement:
      "Text must not clip, overlap, disappear, or require two-dimensional scrolling at common zoom levels.",
    remediation:
      "Use responsive containers, relative sizing, wrapping, and avoid fixed-height text regions.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:accessibility-contract",
      "WCAG:1.4.4",
      "WCAG:1.4.10",
    ],
    enforcement: HYBRID,
  },
  {
    id: "typography.numeric-comparison",
    category: TYPOGRAPHY,
    severity: WARNING,
    appliesTo: ["metric", "table-number", "currency", "timestamp"],
    rationale:
      "Tabular numerals make dense operational data easier to compare.",
    requirement:
      "Comparable numbers, currency, metrics, quantities, and timestamps must use tabular numerals and consistent alignment.",
    remediation:
      "Apply font-variant-numeric: tabular-nums or an equivalent utility.",
    references: ["AFENDA:typography-contract", "AFENDA:data-display-contract"],
    enforcement: HYBRID,
  },
  {
    id: "typography.data-grid-truncation",
    category: TYPOGRAPHY,
    severity: WARNING,
    appliesTo: ["table-cell", "data-grid", "list-row", "search-result"],
    rationale:
      "Enterprise users need to inspect operational records without losing critical identifiers.",
    requirement:
      "Truncated text must preserve meaning and provide a way to reveal the full value.",
    remediation:
      "Use smart truncation, title/detail reveal, copy affordance, or expanded row patterns for critical fields.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:data-display-contract",
      "AFENDA:interaction-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "typography.localized-text-expansion",
    category: TYPOGRAPHY,
    severity: WARNING,
    appliesTo: ["button", "badge", "tab", "navigation", "table-cell", "form-label"],
    rationale:
      "Translated labels can expand, wrap, or change grammar, which can break dense product UI.",
    requirement:
      "Typographic containers must tolerate localized text expansion without clipping critical meaning.",
    remediation:
      "Avoid fixed text widths, allow wrapping or responsive alternatives, and test long localized labels.",
    references: ["AFENDA:typography-contract", "AFENDA:locale-contract"],
    enforcement: MANUAL,
  },
  {
    id: "typography.no-placeholder-as-label",
    category: TYPOGRAPHY,
    severity: ERROR,
    appliesTo: ["form-field", "input", "select", "textarea"],
    rationale:
      "Placeholder text disappears during entry and is not a reliable form label.",
    requirement:
      "Form fields must have persistent visible or programmatically associated labels.",
    remediation:
      "Use field labels, helper text, and validation text instead of relying on placeholder copy.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:forms-contract",
      "AFENDA:accessibility-contract",
      "WCAG:3.3.2",
    ],
    enforcement: HYBRID,
  },
  {
    id: "typography.status-text-not-color-only",
    category: TYPOGRAPHY,
    severity: ERROR,
    appliesTo: ["badge", "status", "metric", "alert", "table-cell"],
    rationale:
      "Typography and text labels must carry status meaning when color alone is insufficient.",
    requirement:
      "Critical status text must include readable labels, symbols, or semantic affordances beyond color alone.",
    remediation:
      "Pair tone color with text labels such as Active, Blocked, Failed, Pending, or Requires review.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:accessibility-contract",
      "AFENDA:status-tone-contract",
      "WCAG:1.4.1",
    ],
    enforcement: HYBRID,
  },
  {
    id: "typography.no-text-as-image",
    category: TYPOGRAPHY,
    severity: ERROR,
    appliesTo: ["image", "banner", "hero", "empty-state", "marketing-surface"],
    forbidden: ["text rendered only in image", "non-decorative text in raster asset"],
    rationale:
      "Text rendered as imagery cannot reliably adapt to zoom, localization, contrast, or assistive technology.",
    requirement:
      "Meaningful text must be rendered as real text, not only inside images.",
    remediation:
      "Render text with HTML/CSS and reserve images for decoration, illustration, or supplemental content.",
    references: ["AFENDA:typography-contract", "WCAG:1.4.5"],
    enforcement: MANUAL,
  },
  {
    id: "typography.font-loading-stability",
    category: TYPOGRAPHY,
    severity: WARNING,
    appliesTo: ["app-shell", "page", "dashboard", "table", "marketing-surface"],
    rationale:
      "Font loading shifts can degrade perceived quality and make dense enterprise UI feel unstable.",
    requirement:
      "Font loading must minimize layout shift and preserve readable fallback rendering.",
    remediation:
      "Use font-display strategy, metric-compatible fallbacks, and avoid late-loading critical typography.",
    references: [
      "AFENDA:typography-contract",
      "AFENDA:performance-contract",
      "AFENDA:visual-stability-contract",
    ],
    enforcement: STATIC,
  },
] as const satisfies readonly AfendaRuntimeRule[];
