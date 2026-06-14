import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_BRAND,
  AFENDA_GOV_COMPONENT_VARIANT,
  AFENDA_GOV_DENSITY,
  AFENDA_GOV_ELEVATION,
  AFENDA_GOV_ICON,
  AFENDA_GOV_SPACING,
  AFENDA_GOV_STATUS_TONE,
  AFENDA_GOV_THEME_TOKEN,
  AFENDA_GOV_VISUAL_DESIGN,
} from "../catalogs/governance-reference.catalog";

const VISUAL_DESIGN = "visual-design" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_VISUAL_DESIGN_RULES = [
  {
    id: "visual-design.hierarchy",
    category: VISUAL_DESIGN,
    severity: ERROR,
    appliesTo: ["page", "dashboard", "card", "form", "table", "detail-panel"],
    rationale:
      "Enterprise screens need clear visual priority so users can distinguish primary work from supporting metadata.",
    requirement:
      "Visual hierarchy must clearly separate primary content, secondary content, actions, and metadata.",
    remediation:
      "Use scale, weight, spacing, grouping, and contrast intentionally instead of rendering all elements with equal emphasis.",
    references: [AFENDA_GOV_VISUAL_DESIGN],
    enforcement: MANUAL,
  },
  {
    id: "visual-design.tokenized-color",
    category: VISUAL_DESIGN,
    severity: ERROR,
    appliesTo: ["color", "background", "border", "text", "icon", "status"],
    forbidden: ["hard-coded hex color", "hard-coded rgb color", "hard-coded hsl color", "arbitrary brand color"],
    rationale:
      "Tokenized color keeps themes, brands, statuses, and accessibility checks governed across the system.",
    requirement:
      "Product surfaces must use approved semantic, brand, or status color tokens.",
    remediation:
      "Replace one-off colors with design-system tokens or add the missing token to the governed palette contract.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_THEME_TOKEN],
    enforcement: HYBRID,
  },
  {
    id: "visual-design.brand-consistency",
    category: VISUAL_DESIGN,
    severity: ERROR,
    appliesTo: ["page", "dashboard", "module", "tenant-theme", "marketing-surface"],
    rationale:
      "Enterprise surfaces must feel like one product while still allowing governed tenant and module customization.",
    requirement:
      "Brand expression must use approved theme, module, and tenant customization tokens.",
    remediation:
      "Use governed brand tokens and avoid one-off color, radius, shadow, illustration, or gradient choices.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_BRAND, AFENDA_GOV_THEME_TOKEN],
    enforcement: MANUAL,
  },
  {
    id: "visual-design.contrast-pairing",
    category: VISUAL_DESIGN,
    severity: ERROR,
    appliesTo: ["text", "icon", "badge", "button", "card", "status", "surface"],
    rationale:
      "Visual polish is invalid if foreground and background pairings do not remain readable across themes.",
    requirement:
      "Foreground and background pairings must use approved contrast-safe token combinations.",
    remediation:
      "Use paired semantic tokens and verify APCA targets with WCAG AA compatibility.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_THEME_TOKEN, "APCA", "WCAG:1.4.3"],
    enforcement: HYBRID,
  },
  {
    id: "visual-design.status-treatment",
    category: VISUAL_DESIGN,
    severity: ERROR,
    appliesTo: ["badge", "status", "tag", "alert", "workflow-state", "approval-state"],
    rationale:
      "Status visuals must be consistent and understandable without relying on color alone.",
    requirement:
      "Status indicators must use governed tone, label, icon, and contrast treatment where applicable.",
    remediation:
      "Use approved status tone tokens and pair color with text, icon, or shape when the status carries meaning.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_STATUS_TONE, "WCAG:1.4.1"],
    enforcement: HYBRID,
  },
  {
    id: "visual-design.elevation-purpose",
    category: VISUAL_DESIGN,
    severity: WARNING,
    appliesTo: ["card", "popover", "modal", "drawer", "dropdown", "floating-action"],
    forbidden: ["decorative shadow stack", "elevation without layering purpose"],
    rationale:
      "Elevation should communicate layering and interaction, not add arbitrary decoration.",
    requirement:
      "Elevation must indicate actual surface hierarchy, overlay state, or interaction affordance.",
    remediation:
      "Use governed elevation tokens and remove shadows that do not represent layering or interaction state.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_ELEVATION],
    enforcement: MANUAL,
  },
  {
    id: "visual-design.component-consistency",
    category: VISUAL_DESIGN,
    severity: WARNING,
    appliesTo: ["button", "badge", "card", "table", "form", "dialog", "popover"],
    rationale:
      "Enterprise quality depends on consistent component anatomy, not only attractive individual screens.",
    requirement:
      "Components must use governed variants, sizes, tones, radius, and state treatments.",
    remediation:
      "Use approved component variants and avoid local visual overrides unless promoted into the design system.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_COMPONENT_VARIANT],
    enforcement: HYBRID,
  },
  {
    id: "visual-design.spacing-rhythm",
    category: VISUAL_DESIGN,
    severity: WARNING,
    appliesTo: ["page", "section", "card", "form", "toolbar", "list"],
    rationale:
      "Consistent spacing rhythm makes dense enterprise interfaces easier to scan and maintain.",
    requirement:
      "Spacing must follow governed rhythm and clearly group related content.",
    remediation:
      "Use spacing tokens, section rhythm, and intentional grouping instead of ad hoc margins.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_SPACING],
    enforcement: MANUAL,
  },
  {
    id: "visual-design.density-balance",
    category: VISUAL_DESIGN,
    severity: WARNING,
    appliesTo: ["dashboard", "table", "data-grid", "toolbar", "filter-bar", "card-grid"],
    rationale:
      "Enterprise density must preserve scanability, hit targets, and information priority.",
    requirement:
      "Dense layouts must balance compactness with readable grouping, adequate target size, and clear priority.",
    remediation:
      "Use density presets, progressive disclosure, and responsive grouping instead of uniformly shrinking every element.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_DENSITY],
    enforcement: MANUAL,
  },
  {
    id: "visual-design.icon-consistency",
    category: VISUAL_DESIGN,
    severity: WARNING,
    appliesTo: ["icon", "icon-button", "menu-item", "status", "empty-state"],
    rationale:
      "Mixed icon weights, sizes, and meanings reduce perceived quality and can create ambiguous controls.",
    requirement:
      "Icons must use a consistent family, size scale, stroke weight, and semantic mapping within a surface.",
    remediation:
      "Use approved icon tokens/components and avoid mixing icon libraries or inconsistent stroke weights.",
    references: [AFENDA_GOV_VISUAL_DESIGN, AFENDA_GOV_ICON],
    enforcement: MANUAL,
  },
  {
    id: "visual-design.non-generic-composition",
    category: VISUAL_DESIGN,
    severity: WARNING,
    appliesTo: ["page", "hero", "dashboard", "empty-state", "marketing-surface"],
    forbidden: [
      "generic centered card layout for major surfaces",
      "ungoverned decorative gradient",
      "interchangeable template composition",
    ],
    rationale:
      "Canonical AFENDA surfaces should feel intentional and product-specific, not like generic generated UI.",
    requirement:
      "Major surfaces must use composition, hierarchy, and visual language that fit the product context.",
    remediation:
      "Choose a deliberate visual direction, vary composition by surface purpose, and avoid default generated layouts.",
    references: [AFENDA_GOV_VISUAL_DESIGN, "WEB-DESIGN-GUIDELINES:creative-direction"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
