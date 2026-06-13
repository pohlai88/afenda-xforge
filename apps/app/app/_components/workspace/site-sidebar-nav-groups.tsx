"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/ui/collapsible";
import { cn } from "@repo/ui/lib/utils";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import type { ReactElement } from "react";
import { Link } from "@/i18n/navigation";
import type {
  HrSuiteSiteNavGroup,
  HrSuiteSiteNavItem,
} from "./hr-suite-site-nav.ts";
import { isPathActive } from "./path-utils.ts";
import {
  WORKSPACE_METADATA_GROUP_LABEL_CLASS,
  WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
  WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS,
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SIDEBAR_DENSE_ITEM_TO_ITEM_GAP_CLASS,
  WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS,
  WORKSPACE_STANDARD_METADATA_LABEL_CLASS,
} from "./workspace-shell.classes.ts";

export type SiteSidebarInteractionMode = "live" | "preview";

function isNavRouteActive(pathname: string, item: HrSuiteSiteNavItem): boolean {
  if (!item.liveHref) {
    return false;
  }

  if (item.liveHref === "/hr") {
    return pathname === item.liveHref;
  }

  return isPathActive(pathname, item.liveHref);
}

/** sidebar-15 NavFavorites / NavWorkspaces emoji slot. */
export function SiteSidebarNavEmoji({
  emoji,
}: {
  emoji: string;
}): ReactElement {
  return (
    <span
      aria-hidden
      className="inline-flex size-4 shrink-0 items-center justify-center text-sm leading-none"
      data-slot="site-nav-emoji"
    >
      {emoji}
    </span>
  );
}

function SiteNavRowButton({
  activeFeatureId,
  activePathname,
  item,
  mode,
  onSelect,
}: {
  activeFeatureId: string;
  activePathname?: string;
  item: HrSuiteSiteNavItem;
  mode: SiteSidebarInteractionMode;
  onSelect: (featureId: string) => void;
}): ReactElement {
  const active =
    item.liveHref && activePathname
      ? isNavRouteActive(activePathname, item)
      : activeFeatureId === item.featureId;
  const isShortcut = item.emoji != null;
  const rowClass = isShortcut
    ? "h-8 text-[0.8125rem] leading-none tracking-normal"
    : "h-7 text-[0.8125rem] leading-none tracking-normal";
  const label = item.label;

  const rowContent = (
    <>
      {item.emoji ? <SiteSidebarNavEmoji emoji={item.emoji} /> : null}
      <span className="truncate">{label}</span>
    </>
  );

  if (item.liveHref) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className={rowClass}
          isActive={active}
          tooltip={item.label}
        >
          <Link href={item.liveHref} onClick={() => onSelect(item.featureId)}>
            {rowContent}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (mode === "live") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-disabled
          className={rowClass}
          disabled
          isActive={active}
          tooltip={`${item.label} is not wired yet`}
          type="button"
        >
          {rowContent}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={rowClass}
        isActive={active}
        onClick={() => onSelect(item.featureId)}
        tooltip={item.label}
        type="button"
      >
        {rowContent}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function itemContainsFeature(
  item: HrSuiteSiteNavItem,
  featureId: string
): boolean {
  return (
    item.featureId === featureId ||
    (item.children ?? []).some((child) => itemContainsFeature(child, featureId))
  );
}

function SiteNavTreeNode({
  activeFeatureId,
  activePathname,
  item,
  mode,
  onSelect,
}: {
  activeFeatureId: string;
  activePathname?: string;
  item: HrSuiteSiteNavItem;
  mode: SiteSidebarInteractionMode;
  onSelect: (featureId: string) => void;
}): ReactElement {
  const children = item.children ?? [];

  if (children.length === 0) {
    return (
      <SiteNavRowButton
        activeFeatureId={activeFeatureId}
        activePathname={activePathname}
        item={item}
        mode={mode}
        onSelect={onSelect}
      />
    );
  }

  const active =
    (activePathname &&
      children.some((child) => isNavRouteActive(activePathname, child))) ||
    itemContainsFeature(item, activeFeatureId);

  return (
    <SidebarMenuItem data-slot="site-sidebar-tree-folder">
      <Collapsible className="group/tree-folder" defaultOpen>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={cn(
              "h-7 px-2 text-[0.8125rem] leading-none tracking-normal",
              WORKSPACE_SHELL_INTERACTIVE_CLASS
            )}
            data-slot="site-sidebar-tree-folder-label"
            isActive={active}
            tooltip={item.label}
            type="button"
          >
            <Folder className="size-4 shrink-0 text-muted-foreground group-data-[state=open]/tree-folder:hidden" />
            <FolderOpen className="hidden size-4 shrink-0 text-muted-foreground group-data-[state=open]/tree-folder:block" />
            <span className="min-w-0 truncate">{item.label}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform group-data-[state=open]/tree-folder:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenu
            className={cn(
              "ms-3 border-sidebar-border/70 border-l pl-2",
              WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS
            )}
            data-slot="site-sidebar-tree-children"
          >
            {children.map((child) => (
              <SiteNavTreeNode
                activeFeatureId={activeFeatureId}
                activePathname={activePathname}
                item={child}
                key={`${child.featureId}:${child.liveHref ?? child.label}`}
                mode={mode}
                onSelect={onSelect}
              />
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

function SiteShortcutCardButton({
  activeFeatureId,
  item,
  mode,
  onSelect,
}: {
  activeFeatureId: string;
  item: HrSuiteSiteNavItem;
  mode: SiteSidebarInteractionMode;
  onSelect: (featureId: string) => void;
}): ReactElement {
  const active = activeFeatureId === item.featureId;
  const label = item.cardLabel ?? item.label;
  const description = item.cardDescription ?? item.searchSummary;
  const cardClass = cn(
    "h-[4.25rem] flex-col items-start justify-between gap-0.5 rounded-md border border-sidebar-border bg-background p-1.5 text-left text-[0.75rem] shadow-xs",
    "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:shadow-none"
  );

  const cardContent = (
    <>
      {item.emoji ? <SiteSidebarNavEmoji emoji={item.emoji} /> : null}
      <span className="min-w-0 text-balance font-medium leading-4">
        {label}
      </span>
      {description ? (
        <span className="line-clamp-1 min-w-0 text-[0.6875rem] text-muted-foreground leading-none group-data-[collapsible=icon]:hidden">
          {description}
        </span>
      ) : null}
    </>
  );

  if (item.liveHref) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className={cardClass}
          isActive={active}
          tooltip={item.label}
        >
          <Link href={item.liveHref} onClick={() => onSelect(item.featureId)}>
            {cardContent}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (mode === "live") {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-disabled
          className={cardClass}
          disabled
          isActive={active}
          tooltip={`${item.label} is not wired yet`}
          type="button"
        >
          {cardContent}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className={cardClass}
        isActive={active}
        onClick={() => onSelect(item.featureId)}
        tooltip={item.label}
        type="button"
      >
        {cardContent}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Curated HR shortcuts rendered as compact sidebar cards. */
export function SiteSidebarShortcuts({
  activeFeatureId,
  items,
  mode = "preview",
  onSelect,
}: {
  activeFeatureId: string;
  items: readonly HrSuiteSiteNavItem[];
  mode?: SiteSidebarInteractionMode;
  onSelect: (featureId: string) => void;
}): ReactElement | null {
  const mostUsedItems = items.filter((item) => item.isMostUsed);

  if (mostUsedItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup
      aria-label="HR Suite shortcuts"
      className="px-2 py-0"
      data-slot="site-sidebar-shortcuts-section"
    >
      <SidebarMenu
        className={cn(
          "grid grid-cols-2 gap-1.5 group-data-[collapsible=icon]:grid-cols-1 group-data-[collapsible=icon]:gap-0.5"
        )}
        data-slot="site-sidebar-shortcuts-items"
      >
        {mostUsedItems.map((item) => (
          <SiteShortcutCardButton
            activeFeatureId={activeFeatureId}
            item={item}
            key={item.featureId}
            mode={mode}
            onSelect={onSelect}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function SiteSidebarBestRecommendation({
  activeFeatureId,
  activePathname,
  item,
  mode = "preview",
  onSelect,
}: {
  activeFeatureId: string;
  activePathname?: string;
  item: HrSuiteSiteNavItem;
  mode?: SiteSidebarInteractionMode;
  onSelect: (featureId: string) => void;
}): ReactElement {
  return (
    <SidebarGroup
      className="px-2 py-0"
      data-slot="site-sidebar-best-match-section"
    >
      <div
        className={WORKSPACE_METADATA_GROUP_LABEL_CLASS}
        data-slot="site-sidebar-search-label"
      >
        Best match
      </div>
      <SidebarMenu
        className={cn(
          WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
          WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS
        )}
        data-slot="site-sidebar-best-match-items"
      >
        <SiteNavRowButton
          activeFeatureId={activeFeatureId}
          activePathname={activePathname}
          item={item}
          mode={mode}
          onSelect={onSelect}
        />
      </SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * sidebar-15 NavWorkspaces-style collapsible groups — emoji on trigger, chevron at right edge,
 * flat leaf rows in SidebarGroupContent (no tree / SidebarMenuSub).
 */
export function SiteSidebarNavGroups({
  activeFeatureId,
  activePathname,
  groups,
  mode = "preview",
  onSelect,
}: {
  activeFeatureId: string;
  activePathname?: string;
  groups: readonly HrSuiteSiteNavGroup[];
  mode?: SiteSidebarInteractionMode;
  onSelect: (featureId: string) => void;
}): ReactElement {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS
      )}
      data-slot="site-sidebar-nav-groups"
    >
      {groups.map((group) => (
        <SidebarGroup
          className="px-2 py-0"
          data-nav-label={group.navLabel}
          data-slot="site-sidebar-metadata-section"
          key={group.navLabel}
        >
          <Collapsible className="group/collapsible" defaultOpen>
            <SidebarMenu
              className={WORKSPACE_SIDEBAR_DENSE_ITEM_TO_ITEM_GAP_CLASS}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={cn(
                      "h-6 px-2",
                      WORKSPACE_SHELL_INTERACTIVE_CLASS
                    )}
                    data-slot="site-sidebar-metadata-label"
                    tooltip={group.navLabel}
                    type="button"
                  >
                    <SiteSidebarNavEmoji emoji={group.tone.emoji} />
                    <span
                      className={cn(
                        "min-w-0 truncate",
                        WORKSPACE_STANDARD_METADATA_LABEL_CLASS
                      )}
                    >
                      {group.navLabel}
                    </span>
                    <ChevronRight className="ml-auto size-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                  <SidebarGroupContent>
                    <SidebarMenu
                      className={cn(
                        WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
                        WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS
                      )}
                      data-slot="site-sidebar-metadata-items"
                    >
                      {group.items.map((item) => (
                        <SiteNavTreeNode
                          activeFeatureId={activeFeatureId}
                          activePathname={activePathname}
                          item={item}
                          key={item.featureId}
                          mode={mode}
                          onSelect={onSelect}
                        />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarMenuItem>
            </SidebarMenu>
          </Collapsible>
        </SidebarGroup>
      ))}
    </div>
  );
}
