"use client";

import { Badge } from "@repo/ui";
import type { ReactElement } from "react";
import { Link } from "@/i18n/navigation";
import { WORKSPACE_APP_SIDEBAR_NAV_GROUPS } from "../../../_components/workspace/workspace-app-surfaces.ts";

export function OrbitView(): ReactElement {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <Badge variant="outline">Declared app surface catalog</Badge>
        <h2 className="font-semibold text-2xl tracking-tight">
          Available workspace surfaces
        </h2>
        <p className="text-muted-foreground text-sm leading-6">
          Orbit is the canonical map of authenticated app pages. A page belongs
          here when it is a real user-facing surface; detail, redirect,
          scaffold, and internal routes must be explicitly exempted instead.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {WORKSPACE_APP_SIDEBAR_NAV_GROUPS.map((group) => (
          <section className="min-w-0 space-y-3" key={group.label}>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-base">{group.label}</h3>
              <span className="h-px flex-1 bg-border" />
              <span className="text-muted-foreground text-xs tabular-nums">
                {group.items.length}
              </span>
            </div>

            <div className="divide-y divide-border rounded-md border">
              {group.items.map((surface) => {
                const Icon = surface.icon;

                return (
                  <Link
                    className="group flex min-w-0 items-start gap-3 px-3 py-3 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                    href={surface.href}
                    key={surface.href}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                    <span className="min-w-0 space-y-1">
                      <span className="block font-medium text-sm">
                        {surface.label}
                      </span>
                      {surface.description ? (
                        <span className="block text-muted-foreground text-xs leading-5">
                          {surface.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
