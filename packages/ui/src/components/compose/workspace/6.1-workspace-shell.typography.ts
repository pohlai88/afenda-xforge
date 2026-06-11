/**
 * Workspace shell typography + layout tokens.
 *
 * Uses the compact Afenda type scale from globals.css:
 * - type-read / type-head — 12px maximum for reading and topic titles
 * - type-caption / type-micro — sentence-case metadata
 * - type-label — 6px maximum for uppercase labels
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
  sidebarRoot: "type-read text-sidebar-foreground antialiased",
  appTopbarScopeLabel:
    "type-label tracking-[0.04em] leading-[7px] text-muted-foreground/65",
  appTopbarItemValue:
    "type-read truncate leading-[13px] tracking-[-0.01em] text-sidebar-foreground",
  appTopbarSwitcherValueMax: "max-w-[20ch]",
  appTopbarBreadcrumb:
    "type-read flex-nowrap gap-1 text-muted-foreground sm:gap-1",
  appTopbarSwitcherIdle: WORKSPACE_SHELL_CHROME_IDLE,
  appTopbarSeparator: "type-read text-muted-foreground/45 [&>svg]:size-3",
  siteTopbarTitle: "type-head tracking-[-0.01em] text-foreground",
  siteTopbarDescription:
    "type-caption leading-[10px] tracking-[0.01em] text-muted-foreground/70",
  sectionLabel: "type-label px-2 text-muted-foreground/70",
  navItem: "type-read tracking-[-0.005em] text-sidebar-foreground/88",
  navItemActive:
    "type-read font-medium tracking-[-0.005em] text-sidebar-foreground",
  menuLabel: "type-label text-muted-foreground/70",
  menuItem: "type-read tracking-[-0.005em]",
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
  /** Shared 16px horizontal inset — app nav topbar only. */
  shellInsetX: "px-4",
  /** Wider 32px horizontal inset — site topbar + site canvas. */
  siteInsetX: "px-8",
  topbarX: "px-8",
  appTopbarX: "px-4",
  /** Circular brand disk — matches legacy appshell 30px mark with chrome breathing room. */
  appTopbarBrand:
    "size-[1.875rem] shrink-0 overflow-hidden rounded-full border border-border bg-sidebar-accent leading-none",
  appTopbarBrandImg: "block size-full object-cover object-center",
  /** App chrome — flush with sidebar rail, no bottom rule (unified nav plane). */
  appTopbarSurface: "bg-sidebar text-sidebar-foreground",
  /** Site / page header — 1px rule separates title chrome from canvas. */
  siteTopbarSurface: `bg-background border-border ${WORKSPACE_SHELL_BORDER.hairlineBottom}`,
  topbarItem:
    "h-8 min-h-8 w-auto max-w-[calc(20ch+1.75rem)] gap-0.5 rounded-md px-1.5 py-0 has-[>svg]:px-1",
  contentRoot:
    "w-full max-w-none overflow-x-hidden overflow-y-auto overscroll-y-contain py-6",
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
