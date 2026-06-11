/**
 * Workspace shell typography + layout tokens.
 *
 * Hierarchy (Codex-style compact chrome):
 * - 13px — sidebar navigation
 * - 12px — app topbar values, breadcrumb, dropdown items
 * - 10px — dropdown menu labels
 * - 6px — app topbar scope micro labels
 *
 * Colors and surfaces use shadcn semantic tokens (bg-background, border-border,
 * text-sidebar-foreground, text-muted-foreground). Do not add hex values here.
 */
import { SIDEBAR_WIDTH_DEFAULT } from "../../../lib/sidebar-layout";

/** Host app `public/icons` — same assets as legacy appshell / erp. */
export const WORKSPACE_AFENDA_BRAND_ICON = {
  light: "/icons/afenda-icon-512-transparent.png",
  dark: "/icons/afenda-icon-512-transparent.png",
} as const;

const WORKSPACE_SHELL_CHROME_IDLE =
  "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground";

export const WORKSPACE_SHELL_TYPE = {
  sidebarRoot: "text-[13px] text-sidebar-foreground antialiased",
  appTopbarScopeLabel:
    "text-[6px] font-normal uppercase tracking-[0.04em] leading-[7px] text-muted-foreground/65",
  appTopbarItemValue:
    "truncate text-[12px] font-normal leading-[13px] tracking-[-0.01em] text-sidebar-foreground",
  appTopbarSwitcherValueMax: "max-w-[20ch]",
  appTopbarBreadcrumb:
    "flex-nowrap gap-1 text-[12px] text-muted-foreground sm:gap-1",
  appTopbarSwitcherIdle: WORKSPACE_SHELL_CHROME_IDLE,
  appTopbarSeparator: "text-[12px] text-muted-foreground/45 [&>svg]:size-3",
  siteTopbarTitle:
    "text-[13px] font-normal tracking-[-0.01em] text-foreground",
  siteTopbarDescription:
    "text-[8px] font-normal leading-[10px] tracking-[0.01em] text-muted-foreground/70",
  sectionLabel:
    "px-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70",
  navItem:
    "text-[13px] font-normal tracking-[-0.005em] text-sidebar-foreground/88",
  navItemActive:
    "text-[13px] font-medium tracking-[-0.005em] text-sidebar-foreground",
  menuLabel:
    "text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70",
  menuItem: "text-[12px] font-normal tracking-[-0.005em]",
} as const;

/** Canonical 1px hairlines — finest reliable border on all displays. */
export const WORKSPACE_SHELL_BORDER = {
  hairline: "border-[1px] border-border",
  hairlineBottom: "border-b-[1px]",
  /** Site column perimeter (SidebarInset). */
  siteContentOuter: "border-[1px] border-border",
} as const;

export const WORKSPACE_SHELL_SPACE = {
  chromeHeight: "2.75rem",
  sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
  sidebarRoot: "px-2.5 py-3",
  sidebarSectionGap: "space-y-[18px]",
  sidebarLabelGap: "mt-1.5",
  navListGap: "space-y-1",
  navRow: "h-8 gap-2 rounded-md px-2",
  topbarX: "px-3",
  /** Left inset aligns with sidebar nav (`sidebarRoot` px-2.5). */
  appTopbarX: "px-2.5 pr-3",
  /** Circular brand disk — matches legacy appshell 30px mark with chrome breathing room. */
  appTopbarBrand:
    "size-[1.875rem] shrink-0 overflow-hidden rounded-full border border-border bg-sidebar-accent leading-none",
  appTopbarBrandImg:
    "block size-full object-cover object-center",
  /** App chrome — flush with sidebar rail, no bottom rule (unified nav plane). */
  appTopbarSurface: "bg-sidebar text-sidebar-foreground",
  /** Site / page header — 1px rule separates title chrome from canvas. */
  siteTopbarSurface:
    "bg-background border-border " +
    WORKSPACE_SHELL_BORDER.hairlineBottom,
  topbarItem:
    "h-8 min-h-8 w-auto max-w-[calc(20ch+1.75rem)] gap-0.5 rounded-md px-1.5 py-0 has-[>svg]:px-1",
  contentRoot:
    "w-full max-w-none overflow-x-hidden overflow-y-auto overscroll-y-contain px-8 py-6",
  iconButton: "size-8 rounded-md",
} as const;

export const WORKSPACE_CONTENT_SPACE = {
  sectionGap: "space-y-6",
} as const;

export const WORKSPACE_SHELL_CHROME_HEIGHT = WORKSPACE_SHELL_SPACE.chromeHeight;
export const WORKSPACE_SHELL_SIDEBAR_WIDTH = WORKSPACE_SHELL_SPACE.sidebarWidth;

export const WORKSPACE_SHELL_RADIUS = {
  navItem: "rounded-md",
} as const;
