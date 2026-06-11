"use client";

import {
  ModeToggle,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@repo/ui";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { PaletteIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import type { ThemeStudioPage } from "./theme-studio-routes.ts";
import {
  isThemeStudioPathActive,
  THEME_STUDIO_PAGES,
} from "./theme-studio-routes.ts";

type ThemeStudioShellProps = {
  children: ReactNode;
};

export function ThemeStudioShell({
  children,
}: ThemeStudioShellProps): ReactElement {
  const pathname = usePathname();
  const activePage = THEME_STUDIO_PAGES.find((page) =>
    isThemeStudioPathActive(pathname, page.href)
  );

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as CSSProperties}>
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader className="border-sidebar-border border-b p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary font-black text-primary-foreground text-sm shadow-sm">
              TS
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sidebar-foreground text-sm">
                Theme Studio
              </p>
              <p className="text-muted-foreground text-xs">
                Live preview pages
              </p>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground text-xs leading-5">
            Navigate between kitchen-sink previews while tuning tenant branding.
            Same page set as the Storybook Theme Studio group.
          </p>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Preview pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {THEME_STUDIO_PAGES.map((page) => (
                  <ThemeStudioNavItem
                    active={isThemeStudioPathActive(pathname, page.href)}
                    key={page.slug}
                    page={page}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-sidebar-border border-t p-3">
          <Badge className="w-full justify-center gap-2" variant="outline">
            <PaletteIcon className="size-3.5" />
            Scorecard gate ≥ 85
          </Badge>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="flex h-14 shrink-0 items-center gap-3 border-border border-b px-4">
          <SidebarTrigger />
          <div className="min-w-0">
            <p className="truncate font-semibold text-sm">Theme Studio</p>
            <p className="truncate text-muted-foreground text-xs">
              {activePage?.label ?? "Preview pages"}
            </p>
          </div>
          <div className="ms-auto">
            <ModeToggle />
          </div>
        </header>

        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ThemeStudioNavItem({
  active,
  page,
}: {
  active: boolean;
  page: ThemeStudioPage;
}): ReactElement {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="h-auto items-start py-2.5"
        isActive={active}
        size="lg"
        tooltip={page.label}
      >
        <Link href={page.href}>
          <span className="flex w-full min-w-0 flex-col gap-0.5 text-left">
            <span className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  "font-medium text-xs",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                Preview {page.number}
              </span>
              <Badge
                className="shrink-0"
                size="sm"
                variant={active ? "lane" : "outline"}
              >
                {page.weight}
              </Badge>
            </span>
            <span
              className={cn(
                "truncate font-semibold leading-tight",
                active
                  ? "text-lane-active-muted-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              {page.label}
            </span>
            <span className="line-clamp-2 text-muted-foreground text-xs leading-snug">
              {page.description}
            </span>
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
