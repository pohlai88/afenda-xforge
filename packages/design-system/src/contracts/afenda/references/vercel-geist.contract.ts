import { z } from "zod";

import type {
  AfendaBaseColorToken,
  AfendaBrandColorToken,
} from "../registries/color-token.registry";
import { defineRegistry } from "../../registry.schema";

/**
 * Canonical Vercel Geist implementation contract for XForge.
 *
 * Primary sources (Vercel plugin + public Geist docs):
 * - https://vercel.com/geist/colors
 * - https://vercel.com/geist/typography
 * - https://vercel.com/geist/materials
 * - https://vercel.com/font
 * - https://vercel.com/design/guidelines
 *
 * Cross-audit reference (live CSS token extraction, 2026):
 * - design-bites vercel.com DESIGN.md (Sparkbites)
 *
 * Scope: typed vocabulary and implementation rules only — no React components.
 * Consumers: `@repo/ui`, `apps/app`, Geist Studio previews.
 */
export const VERCEL_GEIST_SOURCES = {
  colors: "https://vercel.com/geist/colors",
  introduction: "https://vercel.com/geist/introduction",
  typography: "https://vercel.com/geist/typography",
  materials: "https://vercel.com/geist/materials",
  font: "https://vercel.com/font",
  guidelines: "https://vercel.com/design/guidelines",
  crossAudit:
    "https://github.com/educlopez/design-bites/blob/main/design-mds/vercel.com/DESIGN.md",
} as const;

export const VERCEL_GEIST_THEME_PRESET_NAME = "vercel-geist" as const;

export const VERCEL_GEIST_PRINCIPLES = [
  "Achromatic first — interface hierarchy lives in gray steps (#FAFAFA → #F2F2F2 → #EBEBEB → #171717).",
  "Ink (#171717) is the brand — primary CTAs and headlines stay near-black, not marketing blue.",
  "Interactive blue (#0072F5) is the sole accent for links, focus rings, and skip links — use sparingly.",
  "Status chroma is dot-scale only (~10px indicators) — never large fills or decorative backgrounds.",
  "Geist Sans + Geist Mono with OpenType ligatures; weights capped at 600 (no bold 700).",
  "Shadow-as-border replaces CSS borders on containers (`0 0 0 1px` spread, not `border:`).",
  "Double-ring focus: 2px surface gap + 4px blue ring for keyboard visibility on any background.",
  "Two pill radii coexist: 6px functional UI vs 100px marketing CTAs — never mixed on one screen.",
  "Spacing uses a 4px base (`--geist-space`) with non-linear jumps at 10x and 16x.",
] as const;

/** Hard rules downstream UI must follow when implementing Geist surfaces. */
export const VERCEL_GEIST_IMPLEMENTATION_RULES = {
  color: [
    "Map `--primary` to ink (#171717) in light mode; polarity-flip to white CTAs on dark bands.",
    "Reserve `--accent` / link blue for interactive text, focus, and skip links — not hero fills.",
    "Use status palette only for badges, dots, and inline semantic markers ≤10px diameter.",
    "Do not introduce secondary brand hues on dashboard chrome.",
  ],
  typography: [
    "Use font presets `geist` (sans) and `geist-mono` (code).",
    "Display headings (32px+): weight 600, negative tracking ≈ -4% of font size.",
    "Body and controls: weight 400; code blocks weight 500 in Geist Mono.",
    "Never use font-weight 700+.",
  ],
  elevation: [
    "Prefer stacked box-shadow borders over `border:` on cards, inputs, and menus.",
    "Pick material tier by elevation: base/small (6px), medium/menu (12px), fullscreen (16px).",
    "Compose shadows: border layer + depth layer + optional surface-aware ring.",
  ],
  interaction: [
    "Ghost-first buttons: transparent default, #EBEBEB hover wash, ink text promotion.",
    "Focus uses double-ring pattern — see VERCEL_GEIST_FOCUS.",
    "Honor `prefers-reduced-motion`; Geist marketing motion does not override a11y policy.",
  ],
  layout: [
    "Default content max-width 1200px; wide surfaces 1400px; page margin 24px.",
    "Separate sections with spacing and surface tints — not horizontal rules.",
  ],
} as const;

export const VERCEL_GEIST_COLOR_CATEGORIES = defineRegistry([
  "surface",
  "text",
  "interactive",
  "border",
  "status-dot",
  "marketing",
]);

export type VercelGeistColorCategory =
  (typeof VERCEL_GEIST_COLOR_CATEGORIES)[number];

export const VERCEL_GEIST_COLOR_ROLES = defineRegistry([
  "canvas",
  "canvas-soft",
  "canvas-recessed",
  "ink",
  "body",
  "mute",
  "primary",
  "on-primary",
  "link",
  "focus",
  "hairline",
  "hairline-strong",
  "success",
  "warning",
  "error",
  "info",
  "violet",
  "cyan",
]);

export type VercelGeistColorRole = (typeof VERCEL_GEIST_COLOR_ROLES)[number];

export type VercelGeistColorToken = {
  category: VercelGeistColorCategory;
  hex: string;
  oklch: string;
  role: VercelGeistColorRole;
  /** Human-readable Geist usage constraint. */
  usage: string;
};

const oklchValueSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("oklch("), "Geist OKLCH values required");

const hexValueSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Geist hex values must be 6-digit #RRGGBB");

export const vercelGeistColorTokenSchema = z
  .object({
    category: z.enum(VERCEL_GEIST_COLOR_CATEGORIES),
    hex: hexValueSchema,
    oklch: oklchValueSchema,
    role: z.enum(VERCEL_GEIST_COLOR_ROLES),
    usage: z.string().trim().min(1),
  })
  .strict();

/** Canonical Geist light-surface palette — audited against live Vercel CSS tokens. */
export const VERCEL_GEIST_COLORS: readonly VercelGeistColorToken[] = [
  {
    role: "canvas",
    category: "surface",
    hex: "#FFFFFF",
    oklch: "oklch(1 0 0)",
    usage: "Elevated cards, modals, popovers",
  },
  {
    role: "canvas-soft",
    category: "surface",
    hex: "#FAFAFA",
    oklch: "oklch(0.985 0 0)",
    usage: "Primary page background",
  },
  {
    role: "canvas-recessed",
    category: "surface",
    hex: "#F2F2F2",
    oklch: "oklch(0.961 0 0)",
    usage: "Toggle tracks, recessed inputs, overlay backdrop base",
  },
  {
    role: "ink",
    category: "text",
    hex: "#171717",
    oklch: "oklch(0.205 0 0)",
    usage: "Primary text, headings, primary CTA fill",
  },
  {
    role: "body",
    category: "text",
    hex: "#4D4D4D",
    oklch: "oklch(0.42 0 0)",
    usage: "Secondary labels, navigation default state",
  },
  {
    role: "mute",
    category: "text",
    hex: "#8F8F8F",
    oklch: "oklch(0.65 0 0)",
    usage: "Placeholder, decorative lines, disabled copy",
  },
  {
    role: "primary",
    category: "text",
    hex: "#171717",
    oklch: "oklch(0.205 0 0)",
    usage: "Primary action fill — same ink token as brand CTA",
  },
  {
    role: "on-primary",
    category: "text",
    hex: "#FFFFFF",
    oklch: "oklch(1 0 0)",
    usage: "Text on ink-filled buttons and dark bands",
  },
  {
    role: "link",
    category: "interactive",
    hex: "#0072F5",
    oklch: "oklch(0.579 0.215 258)",
    usage: "Inline links, skip-to-content, interactive accent",
  },
  {
    role: "focus",
    category: "interactive",
    hex: "#005FCC",
    oklch: "oklch(0.507 0.185 258)",
    usage: "1px input focus outline (darker than link for equal weight)",
  },
  {
    role: "hairline",
    category: "border",
    hex: "#EBEBEB",
    oklch: "oklch(0.94 0 0)",
    usage: "Hover wash, light divider shadow, ghost button hover",
  },
  {
    role: "hairline-strong",
    category: "border",
    hex: "#A1A1A1",
    oklch: "oklch(0.709 0 0)",
    usage: "Strong structural hairlines when shadow border is insufficient",
  },
  {
    role: "success",
    category: "status-dot",
    hex: "#45A557",
    oklch: "oklch(0.645 0.145 147)",
    usage: "Status indicator dot only — not a success background fill",
  },
  {
    role: "warning",
    category: "status-dot",
    hex: "#FF990A",
    oklch: "oklch(0.772 0.173 64)",
    usage: "Status indicator dot only",
  },
  {
    role: "error",
    category: "status-dot",
    hex: "#E5484D",
    oklch: "oklch(0.626 0.193 23)",
    usage: "Status indicator dot and inline error emphasis",
  },
  {
    role: "info",
    category: "status-dot",
    hex: "#0062D1",
    oklch: "oklch(0.515 0.189 258)",
    usage: "Informational status dot — distinct from link blue",
  },
  {
    role: "violet",
    category: "marketing",
    hex: "#7928CA",
    oklch: "oklch(0.491 0.228 300)",
    usage: "Marketing gradient pair (Preview) — hero scale only",
  },
  {
    role: "cyan",
    category: "marketing",
    hex: "#50E3C2",
    oklch: "oklch(0.829 0.133 175)",
    usage: "Marketing gradient pair (Develop) — hero scale only",
  },
] as const satisfies readonly VercelGeistColorToken[];

export const VERCEL_GEIST_FONT_PRESET_NAMES = defineRegistry([
  "geist",
  "geist-mono",
]);

export type VercelGeistFontPresetName =
  (typeof VERCEL_GEIST_FONT_PRESET_NAMES)[number];

export const VERCEL_GEIST_FONT_WEIGHTS = defineRegistry(["400", "500", "600"]);

export const VERCEL_GEIST_TYPOGRAPHY_STYLES = {
  "display-hero": {
    fontPreset: "geist",
    fontSize: "48px",
    fontWeight: "600",
    lineHeight: "48px",
    letterSpacing: "-2.28px",
    usage: "Marketing hero h1",
  },
  "display-section": {
    fontPreset: "geist",
    fontSize: "32px",
    fontWeight: "600",
    lineHeight: "40px",
    letterSpacing: "-1.28px",
    usage: "Section titles, metric values",
  },
  "label-subsection": {
    fontPreset: "geist",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    letterSpacing: "-0.28px",
    usage: "Subsection h2, UI emphasis",
  },
  body: {
    fontPreset: "geist",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "normal",
    letterSpacing: "normal",
    usage: "Default reading text",
  },
  control: {
    fontPreset: "geist",
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "14px",
    letterSpacing: "normal",
    usage: "Buttons, nav items",
  },
  caption: {
    fontPreset: "geist",
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "16px",
    letterSpacing: "normal",
    usage: "Captions, helper text",
  },
  code: {
    fontPreset: "geist-mono",
    fontSize: "13px",
    fontWeight: "500",
    lineHeight: "20px",
    letterSpacing: "normal",
    usage: "Inline code and pre blocks",
  },
} as const;

export const VERCEL_GEIST_RADIUS_TOKENS = {
  none: "0px",
  default: "6px",
  marketing: "8px",
  card: "12px",
  sheet: "12px 12px 0 0",
  fullscreen: "16px",
  avatar: "50%",
  pill: "9999px",
  "pill-marketing": "100px",
} as const;

export const VERCEL_GEIST_SPACING_TOKENS = {
  base: "4px",
  "2x": "8px",
  "3x": "12px",
  "4x": "16px",
  "6x": "24px",
  "8x": "32px",
  "10x": "40px",
  "16x": "64px",
  "24x": "96px",
  "32x": "128px",
  "48x": "192px",
  "64x": "256px",
  gap: "24px",
  "gap-half": "12px",
  "gap-quarter": "8px",
  "form-small": "32px",
  "form-default": "40px",
  "form-large": "48px",
} as const;

export const VERCEL_GEIST_MATERIALS = {
  base: { className: "material-base", radius: "6px", usage: "Everyday surfaces" },
  small: { className: "material-small", radius: "6px", usage: "Slightly raised controls" },
  medium: { className: "material-medium", radius: "12px", usage: "Raised cards" },
  large: { className: "material-large", radius: "12px", usage: "Further raised panels" },
  menu: { className: "material-menu", radius: "12px", usage: "Dropdown menus" },
  modal: { className: "material-modal", radius: "12px", usage: "Modal dialogs" },
  tooltip: { className: "material-tooltip", radius: "6px", usage: "Tooltips with stem" },
  fullscreen: {
    className: "material-fullscreen",
    radius: "16px",
    usage: "Fullscreen overlays",
  },
} as const;

export const VERCEL_GEIST_SHADOWS = {
  border: "0 0 0 1px rgba(0, 0, 0, 0.08)",
  borderBase: "0 0 0 1px #00000014",
  borderSmall: "0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.04)",
  borderMedium:
    "0 0 0 1px rgba(0, 0, 0, 0.08), 0 2px 2px rgba(0, 0, 0, 0.04), 0 8px 8px -8px rgba(0, 0, 0, 0.04)",
  menu:
    "0 0 0 1px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.02), 0 4px 8px -4px rgba(0, 0, 0, 0.04), 0 16px 24px -8px rgba(0, 0, 0, 0.06)",
  modal:
    "0 0 0 1px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.02), 0 8px 16px -4px rgba(0, 0, 0, 0.04), 0 24px 32px -8px rgba(0, 0, 0, 0.06)",
} as const;

export const VERCEL_GEIST_FOCUS = {
  ring: "0 0 0 2px #FFFFFF, 0 0 0 4px #0072F5",
  inputOutline: "#005FCC",
  overlayOpacity: 0.8,
} as const;

export const VERCEL_GEIST_MOTION = {
  swiftEasing: "cubic-bezier(0.175, 0.885, 0.32, 1.1)",
  overlayScale: 0.96,
  overlayDuration: "0.3s",
  popoverDuration: "0.2s",
} as const;

export const VERCEL_GEIST_LAYOUT = {
  pageWidth: "1200px",
  pageWidthWide: "1400px",
  pageMargin: "24px",
  headerHeight: "64px",
  headerSubMenuHeight: "46px",
} as const;

/**
 * Documented gaps between XForge globals.css defaults and Geist contract.
 * Theme preset `vercel` alone only overrides tenant brand vars — not these surfaces.
 */
export const VERCEL_GEIST_GLOBALS_CSS_CONFLICTS = [
  {
    token: "--background",
    issue: "Afenda :root uses cool teal-tinted white; Geist canvas-soft is achromatic #FAFAFA.",
    afendaDefault: "oklch(0.985 0.003 258)",
    geistTarget: "canvas-soft",
    studioFix: "resolveGeistSemanticCssVars",
  },
  {
    token: "--foreground",
    issue: "Afenda foreground carries hue 258; Geist ink is neutral #171717.",
    afendaDefault: "oklch(0.20 0.015 258)",
    geistTarget: "ink",
    studioFix: "resolveGeistSemanticCssVars",
  },
  {
    token: "--accent",
    issue:
      "Afenda --accent is teal wash for shadcn hovers; Geist ghost hover uses hairline #EBEBEB — not link blue.",
    afendaDefault: "oklch(0.952 0.012 198)",
    geistTarget: "hairline",
    studioFix: "resolveGeistSemanticCssVars (accent ≠ brand-accent / link)",
  },
  {
    token: "--secondary",
    issue: "Afenda --secondary is fixed in globals.css; not driven by theme preset.",
    afendaDefault: "oklch(0.955 0.008 258)",
    geistTarget: "body",
    studioFix: "resolveGeistSemanticCssVars",
  },
  {
    token: "--border / --input",
    issue: "Afenda borders are teal-tinted; Geist uses achromatic hairlines.",
    afendaDefault: "oklch(0.905 0.010 258)",
    geistTarget: "hairline",
    studioFix: "resolveGeistSemanticCssVars",
  },
  {
    token: "--ring",
    issue: "Afenda ring is neutral gray; Geist focus ring is link blue #0072F5.",
    afendaDefault: "oklch(0.50 0.018 258)",
    geistTarget: "link",
    studioFix: "resolveGeistSemanticCssVars",
  },
  {
    token: "--radius",
    issue: "Afenda default 0.625rem (10px); Geist functional UI uses 6px.",
    afendaDefault: "0.625rem",
    geistTarget: "6px",
    studioFix: "resolveGeistSemanticCssVars",
  },
  {
    token: "--text-3xl … --text-9xl",
    issue:
      "Afenda density model clamps all Tailwind text-* size utilities to 0.75rem (12px). Geist display tracking (-1.28px, -2.28px) is authored for 32px/48px headlines — using text-3xl/text-5xl here smears glyphs.",
    afendaDefault: "0.75rem for text-lg through text-9xl",
    geistTarget: "display-section 32px, display-hero 48px",
    studioFix: "geistTypeStyle() from VERCEL_GEIST_TYPOGRAPHY_STYLES (inline px sizes)",
  },
  {
    token: "--tenant-*",
    issue:
      "Tenant branding only injects 4 vars (primary, primary-foreground, secondary, accent). Surfaces stay on Afenda globals.",
    afendaDefault: "4 tenant brand vars",
    geistTarget: "full semantic map",
    studioFix: "GeistStudioScope merges tenant + semantic overrides",
  },
] as const;

export type GeistGlobalsCssConflict =
  (typeof VERCEL_GEIST_GLOBALS_CSS_CONFLICTS)[number];
export type GeistAfendaBrandTokenMap = Record<
  AfendaBrandColorToken | "ring",
  VercelGeistColorRole
>;

export type GeistAfendaSurfaceTokenMap = Partial<
  Record<AfendaBaseColorToken, VercelGeistColorRole>
>;

export const VERCEL_GEIST_AFENDA_TOKEN_MAP = {
  light: {
    background: "canvas-soft",
    foreground: "ink",
    card: "canvas",
    "card-foreground": "ink",
    popover: "canvas",
    "popover-foreground": "ink",
    muted: "canvas-recessed",
    "muted-foreground": "mute",
    border: "hairline",
    input: "hairline",
    primary: "ink",
    "primary-foreground": "on-primary",
    secondary: "canvas-recessed",
    "secondary-foreground": "ink",
    accent: "hairline",
    "accent-foreground": "ink",
    ring: "link",
  },
  dark: {
    background: "ink",
    foreground: "on-primary",
    card: "canvas-recessed",
    "card-foreground": "on-primary",
    popover: "canvas-recessed",
    "popover-foreground": "on-primary",
    muted: "body",
    "muted-foreground": "mute",
    border: "hairline-strong",
    input: "hairline-strong",
    primary: "on-primary",
    "primary-foreground": "ink",
    secondary: "body",
    "secondary-foreground": "on-primary",
    accent: "body",
    "accent-foreground": "on-primary",
    ring: "link",
  },
} as const satisfies Record<
  "dark" | "light",
  GeistAfendaSurfaceTokenMap & GeistAfendaBrandTokenMap
>;

export function getVercelGeistColor(role: VercelGeistColorRole): VercelGeistColorToken {
  const token = VERCEL_GEIST_COLORS.find((entry) => entry.role === role);
  if (!token) {
    throw new Error(`Unknown Vercel Geist color role: ${role}`);
  }

  return token;
}

export const VERCEL_GEIST_NEUTRAL_SCALE = {
  50: "#FAFAFA",
  100: "#F2F2F2",
  200: "#EBEBEB",
  400: "#8F8F8F",
  600: "#4D4D4D",
  900: "#171717",
} as const;

export function resolveGeistBrandScale(mode: "dark" | "light"): Record<
  "accent" | "accent-foreground" | "primary" | "primary-foreground" | "secondary" | "secondary-foreground",
  string
> {
  const brandRoles = {
    primary: "ink",
    "primary-foreground": "on-primary",
    secondary: "body",
    "secondary-foreground": "ink",
    accent: "link",
    "accent-foreground": "on-primary",
  } as const satisfies Record<
    AfendaBrandColorToken,
    VercelGeistColorRole
  >;

  if (mode === "dark") {
    return {
      primary: getVercelGeistColor("on-primary").oklch,
      "primary-foreground": getVercelGeistColor("ink").oklch,
      secondary: getVercelGeistColor("body").oklch,
      "secondary-foreground": getVercelGeistColor("on-primary").oklch,
      accent: getVercelGeistColor("link").oklch,
      "accent-foreground": getVercelGeistColor("on-primary").oklch,
    };
  }

  return {
    primary: getVercelGeistColor(brandRoles.primary).oklch,
    "primary-foreground": getVercelGeistColor(brandRoles["primary-foreground"]).oklch,
    secondary: getVercelGeistColor(brandRoles.secondary).oklch,
    "secondary-foreground": getVercelGeistColor(brandRoles["secondary-foreground"]).oklch,
    accent: getVercelGeistColor(brandRoles.accent).oklch,
    "accent-foreground": getVercelGeistColor(brandRoles["accent-foreground"]).oklch,
  };
}

export type GeistSemanticCssVarMap = Record<string, string>;

/** Full semantic overrides for Geist surfaces — required because globals.css keeps XForge tints. */
export function resolveGeistSemanticCssVars(
  mode: "dark" | "light"
): GeistSemanticCssVarMap {
  const map = VERCEL_GEIST_AFENDA_TOKEN_MAP[mode];
  const vars: GeistSemanticCssVarMap = {};

  for (const [token, role] of Object.entries(map)) {
    vars[`--${token}`] = getVercelGeistColor(role).oklch;
  }

  vars["--brand-primary"] = vars["--primary"] ?? getVercelGeistColor("ink").oklch;
  vars["--brand-primary-foreground"] =
    vars["--primary-foreground"] ?? getVercelGeistColor("on-primary").oklch;
  vars["--brand-secondary"] = getVercelGeistColor("body").oklch;
  vars["--brand-secondary-foreground"] =
    getVercelGeistColor("ink").oklch;
  vars["--brand-accent"] = getVercelGeistColor("link").oklch;
  vars["--brand-accent-foreground"] =
    getVercelGeistColor("on-primary").oklch;
  vars["--tenant-primary"] = vars["--brand-primary"];
  vars["--tenant-primary-foreground"] = vars["--brand-primary-foreground"];
  vars["--tenant-secondary"] = vars["--brand-secondary"];
  vars["--tenant-secondary-foreground"] = vars["--brand-secondary-foreground"];
  vars["--tenant-accent"] = vars["--brand-accent"];
  vars["--tenant-accent-foreground"] = vars["--brand-accent-foreground"];
  vars["--geist-link"] = getVercelGeistColor("link").oklch;
  vars["--geist-focus"] = getVercelGeistColor("focus").oklch;
  vars["--geist-shadow-border"] = VERCEL_GEIST_SHADOWS.border;
  vars["--radius"] = VERCEL_GEIST_RADIUS_TOKENS.default;
  vars["--radius-control"] = VERCEL_GEIST_RADIUS_TOKENS.default;
  vars["--radius-panel"] = VERCEL_GEIST_RADIUS_TOKENS.card;

  return vars;
}

export function validateVercelGeistRegistry(): void {
  for (const token of VERCEL_GEIST_COLORS) {
    vercelGeistColorTokenSchema.parse(token);
  }

  const roles = VERCEL_GEIST_COLORS.map((token) => token.role);
  if (new Set(roles).size !== roles.length) {
    throw new Error("VERCEL_GEIST_COLORS contains duplicate roles");
  }

  for (const weight of VERCEL_GEIST_FONT_WEIGHTS) {
    if (!["400", "500", "600"].includes(weight)) {
      throw new Error(`Unsupported Geist font weight: ${weight}`);
    }
  }

  resolveGeistBrandScale("light");
  resolveGeistBrandScale("dark");
  resolveGeistSemanticCssVars("light");
  resolveGeistSemanticCssVars("dark");
}
