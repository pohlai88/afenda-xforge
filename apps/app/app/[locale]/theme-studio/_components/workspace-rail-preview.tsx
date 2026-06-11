"use client";

import { Badge } from "@repo/ui/components/badge";
import type { ReactElement } from "react";

export function WorkspaceRailPreview(): ReactElement {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-muted-foreground text-sm leading-6">
        This route renders the full workspace shell from{" "}
        <code className="text-foreground">@repo/ui/components/compose/workspace</code>{" "}
        via <code className="text-foreground">WorkspaceFrame</code>. Use the chrome
        around this canvas — not a second shell inside the page.
      </p>

      <section className="space-y-4 border-border border-t pt-6">
        <p className="font-medium text-sm">Validate in the live shell</p>
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <Badge variant="outline">app-nav-topbar</Badge>
            <span>Org / department / team / project switchers</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">nav-main</Badge>
            <span>Theme Studio preview routes in the sidebar</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">nav-secondary</Badge>
            <span>Feature shortcuts for tokens and lanes</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">site-topbar</Badge>
            <span>Active preview label and theme toggle</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">site-content</Badge>
            <span>This panel — flat canvas below the site topbar</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">nav-user</Badge>
            <span>Profile menu in the sidebar footer</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
