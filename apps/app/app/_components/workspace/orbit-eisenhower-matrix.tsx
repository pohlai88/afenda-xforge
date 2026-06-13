"use client";

import { cn } from "@repo/ui/lib/utils";
import { HatGlasses } from "lucide-react";
import type { ReactElement } from "react";
import { Link } from "@/i18n/navigation";
import { OrbitSyntaxGuideDropdown } from "./orbit-syntax-guide-dropdown.tsx";
import type {
  OrbitMatrixTabId,
  OrbitTrailItem,
  OrbitTrailPressure,
} from "./orbit-trail.ts";
import {
  countOpenOrbitTrailItemsByPressure,
  isOrbitMatrixPressureTab,
  ORBIT_EISENHOWER_TABS,
  ORBIT_TRAIL_PRESSURE_DOT_CLASS,
  partitionPressurePanelItems,
} from "./orbit-trail.ts";
import { OrbitTrailRow } from "./orbit-trail-row.tsx";
import {
  WORKSPACE_SIDEBAR_EMPTY_TEXT_CLASS,
  WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS,
  WORKSPACE_SIDEBAR_ROW_CLASS,
} from "./orbit-trail-sidebar.classes.ts";
import {
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS,
  WORKSPACE_SIDEBAR_ITEM_TO_ITEM_STACK_CLASS,
} from "./workspace-shell.classes.ts";

const MATRIX_TAB_CLASS = cn(
  WORKSPACE_SIDEBAR_ROW_CLASS,
  "min-w-0 basis-0 gap-1 px-1",
  "inline-flex w-full items-center justify-center rounded-md border border-transparent transition-all",
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS
);

export function OrbitEisenhowerMatrix({
  expandedTab,
  items,
  onDone,
  onPin,
  onToggleTab,
}: {
  items: readonly OrbitTrailItem[];
  expandedTab: OrbitMatrixTabId | null;
  onToggleTab: (tab: OrbitMatrixTabId) => void;
  onPin: (itemId: string) => void;
  onDone: (itemId: string) => void;
}): ReactElement {
  const guideExpanded = expandedTab === "guide";

  return (
    <div
      className={cn(
        "min-w-0 group-data-[collapsible=icon]:hidden",
        WORKSPACE_SIDEBAR_ITEM_TO_ITEM_STACK_CLASS
      )}
    >
      <div
        className={cn(
          "flex h-8 w-full min-w-0 rounded-lg bg-sidebar-accent/30 p-0.5",
          WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS
        )}
        role="tablist"
      >
        <button
          aria-expanded={guideExpanded}
          aria-label="Guide syntax"
          aria-selected={guideExpanded}
          className={cn(
            MATRIX_TAB_CLASS,
            "flex-1",
            guideExpanded &&
              "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          )}
          onClick={() => onToggleTab("guide")}
          role="tab"
          type="button"
        >
          <HatGlasses className="size-3 shrink-0" />
          <span className="truncate">Guide</span>
        </button>

        {ORBIT_EISENHOWER_TABS.map((tab) => {
          const expanded = expandedTab === tab.pressure;
          const tabCount = countOpenOrbitTrailItemsByPressure(
            items,
            tab.pressure
          );

          return (
            <button
              aria-expanded={expanded}
              aria-label={tab.syntax}
              aria-selected={expanded}
              className={cn(
                MATRIX_TAB_CLASS,
                "flex-1",
                expanded &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
              )}
              key={tab.pressure}
              onClick={() => onToggleTab(tab.pressure)}
              role="tab"
              type="button"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  ORBIT_TRAIL_PRESSURE_DOT_CLASS[tab.pressure]
                )}
              />
              <span className="truncate">{tab.syntax}</span>
              {tabCount > 0 ? (
                <span className="sr-only">{tabCount} trails</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {expandedTab === "guide" ? <OrbitSyntaxGuideDropdown /> : null}

      {expandedTab && isOrbitMatrixPressureTab(expandedTab) ? (
        <OrbitEisenhowerDropdown
          items={items}
          onDone={onDone}
          onPin={onPin}
          pressure={expandedTab}
        />
      ) : null}
    </div>
  );
}

function OrbitEisenhowerDropdown({
  items,
  onDone,
  onPin,
  pressure,
}: {
  items: readonly OrbitTrailItem[];
  pressure: OrbitTrailPressure;
  onPin: (itemId: string) => void;
  onDone: (itemId: string) => void;
}): ReactElement {
  const { normal: normalItems, pinned: pinnedItems } =
    partitionPressurePanelItems(items, pressure);
  const visibleCount = pinnedItems.length + normalItems.length;

  return (
    <div
      className={cn(
        "min-w-0 rounded-md bg-sidebar-accent/20 py-1",
        WORKSPACE_SIDEBAR_ITEM_TO_ITEM_STACK_CLASS
      )}
      role="tabpanel"
    >
      {visibleCount > 0 ? (
        <ul className={WORKSPACE_SIDEBAR_ITEM_TO_ITEM_STACK_CLASS}>
          {pinnedItems.map((item) => (
            <OrbitTrailRow
              item={item}
              key={item.id}
              onDone={() => onDone(item.id)}
              onPin={() => onPin(item.id)}
            />
          ))}
          {normalItems.map((item) => (
            <OrbitTrailRow
              item={item}
              key={item.id}
              onDone={() => onDone(item.id)}
              onPin={() => onPin(item.id)}
            />
          ))}
        </ul>
      ) : (
        <p className={WORKSPACE_SIDEBAR_EMPTY_TEXT_CLASS}>No trail items</p>
      )}

      <Link
        className={cn(
          WORKSPACE_SIDEBAR_ROW_CLASS,
          "block rounded-md",
          WORKSPACE_SIDEBAR_MUTED_TEXT_CLASS,
          WORKSPACE_SHELL_INTERACTIVE_CLASS
        )}
        href="/infrastructure/matrix"
      >
        Show more
      </Link>
    </div>
  );
}
