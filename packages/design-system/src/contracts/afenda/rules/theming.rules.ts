import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const THEMING = "theming" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_THEMING_RULES = [
  {
    id: "theming.token-source-of-truth",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["theme", "component", "css-var", "tenant-theme", "module-theme"],
    forbidden: [
      "hard-coded theme color in component",
      "one-off hex color",
      "one-off rgb color",
      "one-off oklch color outside token contract",
    ],
    rationale:
      "Theme values must remain governed so tenant, module, dark mode, and accessibility changes propagate consistently.",
    requirement:
      "Runtime surfaces must consume approved semantic, tenant, lane, or component tokens instead of local color values.",
    remediation:
      "Promote needed values into the theme token contract or use existing CSS variables and semantic token pairs.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:theme-token-contract",
      "AFENDA:design-system-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.token-publication-contract",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["theme-preset", "token-registry", "css-var", "design-system"],
    rationale:
      "Theme tokens must be published through a stable contract so product surfaces do not depend on private implementation details.",
    requirement:
      "Theme tokens must be declared in the approved registry, exported through the public contract, and backed by CSS variables.",
    remediation:
      "Add missing tokens to the theme token registry, schema, manifest, and public export before use.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:theme-token-contract",
      "AFENDA:design-system-contract",
      "AFENDA:manifest-contract",
    ],
    enforcement: STATIC,
  },
  {
    id: "theming.no-legacy-theme-preset",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["theme-preset", "tenant-theme", "user-theme", "theme-config"],
    forbidden: [
      "themePreset: xforge",
      "themePreset: vercel",
      "themePreset: teal",
      "themePreset: indigo",
      "themePreset: emerald",
      "themePreset: amber",
      "themePreset: rose",
    ],
    rationale:
      "Afenda must have one canonical theme preset authority without compatibility aliases or half-migrated theme states.",
    requirement:
      "Theme preset consumers must use only canonical Afenda theme preset names.",
    remediation:
      "Replace legacy theme preset names with afenda or vercel-geist, or remove unsupported optional presets until promoted through Afenda governance.",
    references: [
      "AFENDA:design-system-contract",
      "AFENDA:theming-contract",
      "AFENDA:quality-gate-contract",
    ],
    enforcement: STATIC,
  },
  {
    id: "theming.semantic-token-pairs",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["text", "surface", "button", "badge", "card", "status", "form"],
    rationale:
      "Foreground and background tokens must be paired intentionally to preserve readability across themes.",
    requirement:
      "Foreground/background combinations must use approved semantic token pairs with APCA-first and WCAG-compatible contrast.",
    remediation:
      "Use paired tokens such as primary/primary-foreground, accent/accent-foreground, or governed surface/content pairs.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:theme-token-contract",
      "APCA",
      "WCAG:1.4.3",
      "WCAG:1.4.11",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.tenant-brand-boundary",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["tenant-theme", "company-theme", "app-shell", "admin-shell", "report", "export"],
    rationale:
      "Tenant branding must customize approved expression slots without replacing product authority, security context, or system semantics.",
    requirement:
      "Tenant and company theme overrides must be limited to approved brand, lane, and module tokens.",
    remediation:
      "Apply tenant overrides through governed branding contracts and preserve shell, status, danger, permission, and audit semantics.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:tenant-context-contract",
      "AFENDA:brand-contract",
      "AFENDA:security-ui-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.tenant-theme-validation",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["tenant-theme", "company-theme", "theme-editor", "theme-import", "admin-setting"],
    rationale:
      "Tenant themes can break readability, status meaning, or brand boundaries if values are accepted without validation.",
    requirement:
      "Tenant and company theme overrides must be validated before preview, publish, import, or runtime activation.",
    remediation:
      "Validate contrast, hue reservation, token completeness, dark-mode parity, and reserved semantic slots before saving.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:theme-validation-contract",
      "AFENDA:tenant-context-contract",
      "AFENDA:security-ui-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.module-lane-boundary",
    category: THEMING,
    severity: WARNING,
    appliesTo: ["module-theme", "lane-theme", "navigation", "sidebar", "dashboard", "workspace"],
    rationale:
      "Module and lane colors help orientation, but too many independent colors create visual noise and destroy hierarchy.",
    requirement:
      "Module and lane themes must use governed accent slots and must not create independent theme systems.",
    remediation:
      "Limit module/lane expression to approved accent, border, icon, and metadata slots while preserving global surfaces.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:navigation-contract",
      "AFENDA:visual-design-contract",
      "AFENDA:status-tone-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.status-hue-reservation",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["theme-preset", "tenant-theme", "status", "badge", "chart", "lane"],
    rationale:
      "Brand colors must not collide with reserved semantic status hues in enterprise workflows.",
    requirement:
      "Theme and tenant colors must preserve governed hue distance from danger, warning, success, info, and destructive semantics.",
    remediation:
      "Validate tenant and module theme overrides against the hue reservation contract before publishing.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:hue-reservation-contract",
      "AFENDA:status-tone-contract",
    ],
    enforcement: STATIC,
  },
  {
    id: "theming.dark-mode-parity",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["theme-preset", "dark-theme", "component", "surface", "state"],
    rationale:
      "Dark mode must preserve the same semantic hierarchy, state meaning, and accessibility guarantees as light mode.",
    requirement:
      "Every supported theme must define light and dark values for semantic surfaces, content, focus, border, and state tokens.",
    remediation:
      "Add missing dark-mode token values and verify component states in both light and dark themes.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:theme-token-contract",
      "AFENDA:accessibility-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.focus-token-parity",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["focus-ring", "button", "input", "menu-item", "table-row", "interactive-element"],
    rationale:
      "Focus visibility is a functional requirement and must survive theme customization.",
    requirement:
      "All themes must provide visible, contrast-safe focus indicators for interactive controls.",
    remediation:
      "Use governed focus tokens and verify focus states across light, dark, tenant, and forced-color themes.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:focus-contract",
      "AFENDA:accessibility-contract",
      "WCAG:2.4.7",
      "WCAG:2.4.11",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.forced-colors-support",
    category: THEMING,
    severity: WARNING,
    appliesTo: ["theme", "button", "input", "focus-ring", "border", "status"],
    rationale:
      "Users relying on forced-colors or high-contrast modes still need visible structure, states, and focus indicators.",
    requirement:
      "Themes must not remove meaning, boundaries, or focus visibility in forced-colors environments.",
    remediation:
      "Use system colors, preserve outlines, avoid background-image-only states, and test forced-colors mode for core controls.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:accessibility-contract",
      "WCAG:1.4.11",
      "WCAG:2.4.7",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.no-color-only-meaning",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["status", "badge", "chart", "alert", "form-state", "workflow-state"],
    rationale:
      "Theme color changes cannot be the only channel for meaning because color perception, display conditions, and custom themes vary.",
    requirement:
      "Theme-dependent meaning must also be communicated through text, iconography, shape, semantics, or persistent state.",
    remediation:
      "Pair color with labels, icons, aria state, status text, or structural affordances.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:accessibility-contract",
      "WCAG:1.4.1",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.chart-token-governance",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["chart", "dashboard", "metric", "report", "analytics-surface"],
    rationale:
      "Charts need theme-aware colors that remain readable, distinguishable, and semantically stable.",
    requirement:
      "Charts must use governed chart tokens and must not reuse status or brand colors in misleading ways.",
    remediation:
      "Use chart palette tokens with contrast, distinguishability, dark-mode parity, and non-color labels or legends.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:chart-token-contract",
      "AFENDA:data-display-contract",
      "AFENDA:accessibility-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.native-color-scheme",
    category: THEMING,
    severity: WARNING,
    appliesTo: ["theme", "html", "select", "input", "textarea", "browser-chrome"],
    rationale:
      "Native controls and browser chrome should match the active theme instead of visually contradicting the app shell.",
    requirement:
      "Themes must set color-scheme and native control colors when light/dark mode changes.",
    remediation:
      "Set color-scheme on the root and verify select, input, textarea, scrollbar, and browser chrome colors.",
    references: ["AFENDA:theming-contract", "WCAG:1.4.11"],
    enforcement: HYBRID,
  },
  {
    id: "theming.theme-switch-stability",
    category: THEMING,
    severity: ERROR,
    appliesTo: ["theme-provider", "app-shell", "html", "layout", "client-boundary"],
    forbidden: ["theme flash on load", "hydration mismatch from theme", "unscoped theme mutation"],
    rationale:
      "Theme switching must not create flashes, hydration mismatch, or cross-scope visual state leaks.",
    requirement:
      "Runtime theme selection must initialize deterministically and switch without unthemed flashes or hydration drift.",
    remediation:
      "Resolve the initial theme before paint where possible, scope theme attributes to the app root, and avoid client-only theme defaults that disagree with server markup.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:hydration-contract",
      "AFENDA:performance-contract",
    ],
    enforcement: HYBRID,
  },
  {
    id: "theming.print-export-parity",
    category: THEMING,
    severity: WARNING,
    appliesTo: ["report", "export", "invoice", "pdf", "print-view"],
    rationale:
      "Enterprise exports must remain legible and legally usable outside the runtime theme environment.",
    requirement:
      "Printed and exported themed surfaces must preserve readability, identity, status meaning, and scope metadata.",
    remediation:
      "Define print/export tokens, avoid low-contrast backgrounds, include labels, and preserve tenant/company identity safely.",
    references: [
      "AFENDA:theming-contract",
      "AFENDA:export-contract",
      "AFENDA:tenant-context-contract",
      "AFENDA:data-display-contract",
    ],
    enforcement: HYBRID,
  },
] as const satisfies readonly AfendaRuntimeRule[];
