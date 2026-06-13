"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { MoreHorizontal } from "lucide-react";
import type { ReactElement } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { isPathActive } from "./path-utils.ts";
import type { WorkspaceNavItem } from "./types.ts";
import {
  WORKSPACE_SHELL_ACTIVE_CLASS,
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS,
} from "./workspace-shell.classes.ts";

type AuthenticatedSidebarNavLinksProps = {
  items: readonly WorkspaceNavItem[];
};

export function AuthenticatedSidebarNavLinks({
  items,
}: AuthenticatedSidebarNavLinksProps): ReactElement {
  const pathname = usePathname();

  return (
    <SidebarMenu className={WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS}>
      {items.map((item) => {
        const Icon = item.icon;
        const children = item.children ?? [];
        const active =
          isPathActive(pathname, item.href) ||
          children.some((child) => isPathActive(pathname, child.href));
        const hasChildren = children.length > 0;
        const isScaffold = item.availability === "scaffold";

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              className={cn(
                "h-7 gap-1.5 px-2 text-[10px] leading-4 data-[active=true]:border-l-0 data-[active=true]:shadow-none",
                WORKSPACE_SHELL_ACTIVE_CLASS
              )}
              disabled={isScaffold}
              isActive={active}
              tooltip={
                isScaffold
                  ? `${item.label} is not wired yet`
                  : (item.description ?? item.label)
              }
              {...(isScaffold ? {} : { asChild: true })}
            >
              {isScaffold ? (
                <>
                  <Icon />
                  <span className="truncate">{item.label}</span>
                </>
              ) : (
                <Link href={item.href}>
                  <Icon />
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </SidebarMenuButton>
            {hasChildren ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label={`Open ${item.label} surfaces`}
                    className={cn(
                      "absolute top-1 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 group-data-[collapsible=icon]:hidden",
                      WORKSPACE_SHELL_INTERACTIVE_CLASS
                    )}
                    type="button"
                  >
                    <MoreHorizontal />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64"
                  side="right"
                >
                  <DropdownMenuLabel className="text-xs">
                    {item.label}
                  </DropdownMenuLabel>
                  {children.map((child) => {
                    const ChildIcon = child.icon;
                    const childIsScaffold = child.availability === "scaffold";

                    return (
                      <DropdownMenuItem
                        disabled={childIsScaffold}
                        key={child.href}
                        {...(childIsScaffold ? {} : { asChild: true })}
                      >
                        {childIsScaffold ? (
                          <span className="flex min-w-0 items-center gap-2">
                            <ChildIcon className="size-4" />
                            <span className="min-w-0">
                              <span className="block truncate">
                                {child.label}
                              </span>
                              <span className="block truncate text-muted-foreground text-xs">
                                Not wired yet
                              </span>
                            </span>
                          </span>
                        ) : (
                          <Link href={child.href}>
                            <ChildIcon className="size-4" />
                            <span className="min-w-0">
                              <span className="block truncate">
                                {child.label}
                              </span>
                              {child.description ? (
                                <span className="block truncate text-muted-foreground text-xs">
                                  {child.description}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
