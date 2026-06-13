"use client";

import {
  Button,
  Input,
  ScrollArea,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import { Search, X } from "lucide-react";
import type { ChangeEvent, ReactElement } from "react";
import { useId, useMemo, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  HR_SUITE_FEATURE,
  resolveHrSuiteSiteNavSearch,
} from "./hr-suite-site-nav.ts";
import type { SiteSidebarInteractionMode } from "./site-sidebar-nav-groups.tsx";
import {
  SiteSidebarBestRecommendation,
  SiteSidebarNavEmoji,
  SiteSidebarNavGroups,
  SiteSidebarShortcuts,
} from "./site-sidebar-nav-groups.tsx";
import {
  SITE_LEFT_SIDEBAR_SCROLL_AREA_CLASS,
  WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS,
  WORKSPACE_STANDARD_METADATA_LABEL_CLASS,
} from "./workspace-shell.classes.ts";

type HrSuiteSiteSidebarProps = {
  activeFeatureId: string;
  mode?: SiteSidebarInteractionMode;
  onSelect: (featureId: string) => void;
};

function HrSuiteSiteSidebarSearch({
  resultCount,
  searchQuery,
  setSearchQuery,
}: {
  resultCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}): ReactElement {
  const searchInputId = useId();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div
      className="group-data-[collapsible=icon]:hidden"
      data-slot="site-sidebar-search"
    >
      <label className="sr-only" htmlFor={searchInputId}>
        Search HR Suite
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-describedby={
            searchQuery.trim() ? `${searchInputId}-result-count` : undefined
          }
          className="h-8 bg-background ps-8 pe-8 text-[0.8125rem]"
          id={searchInputId}
          onChange={handleSearchChange}
          placeholder="Search HR Suite"
          type="search"
          value={searchQuery}
        />
        {searchQuery ? (
          <Button
            aria-label="Clear HR Suite search"
            className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
            onClick={() => setSearchQuery("")}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </div>
      {searchQuery.trim() ? (
        <p
          className="mt-1 px-1 text-[0.6875rem] text-muted-foreground leading-none"
          id={`${searchInputId}-result-count`}
        >
          {resultCount === 1 ? "1 match" : `${resultCount} matches`}
        </p>
      ) : null}
    </div>
  );
}

export function HrSuiteSiteSidebar({
  activeFeatureId,
  mode = "preview",
  onSelect,
}: HrSuiteSiteSidebarProps): ReactElement {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const searchResult = useMemo(
    () => resolveHrSuiteSiteNavSearch(searchQuery),
    [searchQuery]
  );

  return (
    <>
      <SidebarHeader
        className="shrink-0 gap-2 bg-background p-2 pb-0"
        data-slot="site-staging-sidebar-feature"
      >
        <HrSuiteSiteSidebarSearch
          resultCount={searchResult.resultCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </SidebarHeader>

      <SidebarContent className="min-h-0 gap-0 overflow-hidden bg-background p-0">
        <ScrollArea className={SITE_LEFT_SIDEBAR_SCROLL_AREA_CLASS}>
          <div
            className="flex min-w-0 flex-col gap-0.5 px-2"
            data-slot="site-sidebar-feature-shortcuts"
          >
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-8 px-2"
                  tooltip={HR_SUITE_FEATURE.navLabel}
                  type="button"
                >
                  <SiteSidebarNavEmoji emoji={HR_SUITE_FEATURE.emoji} />
                  <span className={WORKSPACE_STANDARD_METADATA_LABEL_CLASS}>
                    {HR_SUITE_FEATURE.navLabel}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SiteSidebarShortcuts
              activeFeatureId={activeFeatureId}
              items={searchResult.shortcuts}
              mode={mode}
              onSelect={onSelect}
            />
          </div>
          <div
            className={`flex min-w-0 flex-col ${WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS}`}
            data-slot="site-sidebar-body"
          >
            {searchResult.bestItem ? (
              <SiteSidebarBestRecommendation
                activeFeatureId={activeFeatureId}
                activePathname={pathname}
                item={searchResult.bestItem}
                mode={mode}
                onSelect={onSelect}
              />
            ) : null}
            <SiteSidebarNavGroups
              activeFeatureId={activeFeatureId}
              activePathname={pathname}
              groups={searchResult.groups}
              mode={mode}
              onSelect={onSelect}
            />
            {searchResult.isSearching && searchResult.resultCount === 0 ? (
              <SidebarMenu className="px-2" data-slot="site-sidebar-no-results">
                <SidebarMenuItem>
                  <p className="px-2 py-1 text-[0.75rem] text-muted-foreground leading-5">
                    No matching HR Suite feature.
                  </p>
                </SidebarMenuItem>
              </SidebarMenu>
            ) : null}
          </div>
        </ScrollArea>
      </SidebarContent>
    </>
  );
}
