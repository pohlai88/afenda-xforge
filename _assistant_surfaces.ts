/**
 * Codex theme v1 — opaque shell reference.
 *
 * codex-theme-v1:
 * - surface #111111, ink #fcfcfc, accent #0169cc
 * - opaqueWindows: true (no blur / alpha stacks)
 * - fonts: Inter UI, Geist Mono code
 */
export const WORKSPACE_CODEX_THEME_V1 = {
  accent: "#0169cc",
  codeThemeId: "codex",
  contrast: 50,
  fonts: {
    code: '"Geist Mono", ui-monospace, "SFMono-Regular"',
    ui: "Inter",
  },
  ink: "#fcfcfc",
  opaqueWindows: true,
  semanticColors: {
    diffAdded: "#00a240",
    diffRemoved: "#e02e2a",
    skill: "#b06dff",
  },
  surface: "#111111",
  variant: "dark",
} as const;

/**
 * Flat workspace chrome — one background plane for nav + canvas.
 * Separation uses borders only; no stacked surface/card tones in the shell.
 */
export const WORKSPACE_SHELL_SURFACE = {
  appTopbar: "bg-background border-b border-border",
  siteTopbar: "bg-background border-b border-border",
  siteCanvas: "bg-background",
  sidebar:
    "[&_[data-slot=sidebar-inner]]:bg-background [&_[data-slot=sidebar-inner]]:text-foreground",
  sidebarHover: "hover:bg-muted",
  capture: "bg-muted/40",
  captureFocus: "focus-within:bg-muted/60",
  orbitPanel: "rounded-md border border-border bg-muted/20",
  orbitTrack: "bg-muted",
} as const;

/** Idle switcher — muted ink on flat background. */
export const WORKSPACE_SHELL_CHROME_IDLE =
  "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground";
