"use client";

import {
  Button,
  Input,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Pin,
  Search,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { KeyboardEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OrbitTrailItem, OrbitTrailPressure } from "./orbit-trail.ts";
import {
  createOrbitTrailItem,
  formatOrbitTrailAge,
  isOrbitTrailAddSyntax,
  ORBIT_TRAIL_FOCUS_EVENT,
  ORBIT_TRAIL_STORAGE_KEY,
  ORBIT_TRAIL_VISIBLE_LIMIT,
  sortOrbitTrailItems,
} from "./orbit-trail.ts";

const pressureDotClass: Record<OrbitTrailPressure, string> = {
  critical: "bg-red-500",
  important: "bg-sky-500",
  routine: "bg-muted-foreground/45",
  urgent: "bg-amber-500",
};

export function AuthenticatedSidebarOrbitTrailBlock(): ReactElement {
  const [items, setItems] = useState<OrbitTrailItem[]>([]);
  const [query, setQuery] = useState("");
  const [collapsedScopes, setCollapsedScopes] = useState<Set<string>>(
    () => new Set()
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(readStoredOrbitTrailItems());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ORBIT_TRAIL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const { pinnedItems, projectGroups } = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const openItems = items.filter((item) => !item.done);
    const filteredItems =
      normalizedQuery && !isOrbitTrailAddSyntax(query)
        ? openItems.filter((item) =>
            [item.title, item.scope, item.rawInput]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery)
          )
        : openItems;
    const sortedItems = sortOrbitTrailItems(filteredItems);
    const visiblePinnedItems = sortedItems
      .filter((item) => item.pinned)
      .slice(0, ORBIT_TRAIL_VISIBLE_LIMIT);
    const remainingVisibleCount =
      ORBIT_TRAIL_VISIBLE_LIMIT - visiblePinnedItems.length;
    const visibleProjectItems = sortedItems
      .filter((item) => !item.pinned)
      .slice(0, Math.max(0, remainingVisibleCount));
    const groups = new Map<string, OrbitTrailItem[]>();

    for (const item of visibleProjectItems) {
      groups.set(item.scope, [...(groups.get(item.scope) ?? []), item]);
    }

    return {
      pinnedItems: visiblePinnedItems,
      projectGroups: Array.from(groups.entries()).map(
        ([scope, groupItems]) => ({
          items: groupItems,
          scope,
        })
      ),
    };
  }, [items, query]);

  const addCurrentInput = useCallback((): void => {
    const nextItem = createOrbitTrailItem(query);
    if (!nextItem) {
      return;
    }

    setItems((current) => [nextItem, ...current]);
    setQuery("");
  }, [query]);

  useEffect(() => {
    const focusInput = (event: Event): void => {
      if (!(event instanceof CustomEvent)) {
        inputRef.current?.focus();
        return;
      }

      const forceAdd = event.detail?.forceAdd === true;
      const focusProject = event.detail?.focusProject === true;

      if (forceAdd && query.trim()) {
        addCurrentInput();
        return;
      }

      if (focusProject && !query.trim()) {
        setQuery("/");
      }

      inputRef.current?.focus();
    };

    window.addEventListener(ORBIT_TRAIL_FOCUS_EVENT, focusInput);
    return () =>
      window.removeEventListener(ORBIT_TRAIL_FOCUS_EVENT, focusInput);
  }, [addCurrentInput, query]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== "Enter" || !isOrbitTrailAddSyntax(query)) {
      return;
    }

    event.preventDefault();
    addCurrentInput();
  };

  const toggleScope = (scope: string): void => {
    setCollapsedScopes((current) => {
      const next = new Set(current);
      if (next.has(scope)) {
        next.delete(scope);
      } else {
        next.add(scope);
      }
      return next;
    });
  };

  const togglePin = (itemId: string): void => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, pinned: !item.pinned } : item
      )
    );
  };

  const markDone = (itemId: string): void => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, done: true } : item
      )
    );
  };

  return (
    <>
      <SidebarGroup className="min-w-0 p-0">
        <SidebarGroupContent className="min-w-0 space-y-1">
          <div className="relative group-data-[collapsible=icon]:hidden">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search or add Orbit Trail item"
              className="h-8 border-0 bg-sidebar-accent/30 pl-7 text-xs shadow-none focus-visible:ring-1"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search or add..."
              ref={inputRef}
              value={query}
            />
          </div>
          <p className="px-2 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
            @who ! /where #when
          </p>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="min-w-0 p-0">
        <SidebarGroupLabel className="h-4 px-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
          Pinned
        </SidebarGroupLabel>
        <SidebarGroupContent className="min-w-0">
          {pinnedItems.length > 0 ? (
            <ul className="space-y-0.5 group-data-[collapsible=icon]:hidden">
              {pinnedItems.map((item) => (
                <OrbitTrailRow
                  item={item}
                  key={item.id}
                  onDone={() => markDone(item.id)}
                  onPin={() => togglePin(item.id)}
                />
              ))}
            </ul>
          ) : (
            <p className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-muted-foreground group-data-[collapsible=icon]:hidden">
              Nothing pinned
            </p>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="min-w-0 p-0">
        <SidebarGroupLabel className="h-4 px-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/50">
          Projects
        </SidebarGroupLabel>
        <SidebarGroupContent className="min-w-0 space-y-1">
          {projectGroups.length > 0 ? (
            projectGroups.map((group) => {
              const collapsed = collapsedScopes.has(group.scope);
              return (
                <div className="min-w-0" key={group.scope}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        className="h-7 gap-1.5 px-2 text-[10px] leading-4 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:justify-center"
                        onClick={() => toggleScope(group.scope)}
                        tooltip={`${group.scope} · ${group.items.length}`}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            pressureDotClass[
                              group.items[0]?.pressure ?? "routine"
                            ]
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate font-medium group-data-[collapsible=icon]:hidden">
                          {group.scope}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums group-data-[collapsible=icon]:hidden">
                          {group.items.length}
                        </span>
                        {collapsed ? (
                          <ChevronRight className="size-3 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                        ) : (
                          <ChevronDown className="size-3 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>

                  {collapsed ? null : (
                    <ul className="space-y-0.5 group-data-[collapsible=icon]:hidden">
                      {group.items.map((item) => (
                        <OrbitTrailRow
                          item={item}
                          key={item.id}
                          onDone={() => markDone(item.id)}
                          onPin={() => togglePin(item.id)}
                        />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          ) : (
            <p className="px-2 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-muted-foreground group-data-[collapsible=icon]:hidden">
              No project trail
            </p>
          )}

          <Link
            className="block rounded-md px-2 py-1 font-medium text-[10px] leading-4 text-muted-foreground hover:bg-sidebar-accent/45 hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:hidden"
            href="/infrastructure/matrix"
          >
            Show more
          </Link>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function OrbitTrailRow({
  item,
  onDone,
  onPin,
}: {
  item: OrbitTrailItem;
  onDone: () => void;
  onPin: () => void;
}): ReactElement {
  return (
    <li className="group flex h-7 min-w-0 items-center gap-1 rounded-md pr-1 pl-4 text-[10px] leading-4 focus-within:bg-sidebar-accent/35 hover:bg-sidebar-accent/35">
      <span
        aria-label={`${item.pressure} pressure`}
        className={cn(
          "size-2 shrink-0 rounded-full",
          pressureDotClass[item.pressure]
        )}
        role="img"
      />
      <span className="min-w-0 flex-1 truncate text-sidebar-foreground">
        {item.title}
      </span>
      <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
        {formatOrbitTrailAge(item.createdAt)}
      </span>
      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <Button
          aria-label={item.pinned ? `Unpin ${item.title}` : `Pin ${item.title}`}
          className={cn("size-6", item.pinned && "opacity-100")}
          onClick={onPin}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Pin className={cn("size-3", item.pinned && "fill-current")} />
        </Button>
        <Button
          aria-label={`Complete ${item.title}`}
          className="size-6"
          onClick={onDone}
          size="icon"
          type="button"
          variant="ghost"
        >
          <CheckCircle2 className="size-3" />
        </Button>
      </div>
    </li>
  );
}

function readStoredOrbitTrailItems(): OrbitTrailItem[] {
  try {
    const stored = window.localStorage.getItem(ORBIT_TRAIL_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isOrbitTrailItem);
  } catch {
    return [];
  }
}

function isOrbitTrailItem(value: unknown): value is OrbitTrailItem {
  if (!(value && typeof value === "object")) {
    return false;
  }

  const item = value as Partial<OrbitTrailItem>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.rawInput === "string" &&
    typeof item.scope === "string" &&
    typeof item.createdAt === "string" &&
    typeof item.pinned === "boolean" &&
    typeof item.done === "boolean" &&
    ["routine", "important", "urgent", "critical"].includes(item.pressure ?? "")
  );
}
