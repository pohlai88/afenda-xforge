type CssDeclaration = readonly [name: string, value: string];

/**
 * Navigation chrome (sidebar / menu rail): slightly deeper than content plane for
 * editorial frame hierarchy. Accent uses a restrained brand wash — not flat gray.
 */
export const SIDEBAR_LIGHT_DECLARATIONS: readonly CssDeclaration[] = [
  ["--sidebar", "oklch(0.970 0.005 258)"],
  ["--sidebar-foreground", "var(--foreground)"],
  ["--sidebar-primary", "var(--primary)"],
  ["--sidebar-primary-foreground", "var(--primary-foreground)"],
  ["--sidebar-accent", "oklch(0.948 0.014 198)"],
  ["--sidebar-accent-foreground", "oklch(0.22 0.022 198)"],
  ["--sidebar-border", "oklch(0.902 0.010 258)"],
  ["--sidebar-ring", "var(--ring)"],
] as const;

export const SIDEBAR_DARK_DECLARATIONS: readonly CssDeclaration[] = [
  ["--sidebar", "oklch(0.135 0.011 258)"],
  ["--sidebar-foreground", "var(--foreground)"],
  ["--sidebar-primary", "var(--primary)"],
  ["--sidebar-primary-foreground", "var(--primary-foreground)"],
  ["--sidebar-accent", "oklch(0.22 0.020 198)"],
  ["--sidebar-accent-foreground", "oklch(0.92 0.006 258)"],
  ["--sidebar-border", "oklch(0.28 0.014 258)"],
  ["--sidebar-ring", "var(--ring)"],
] as const;
