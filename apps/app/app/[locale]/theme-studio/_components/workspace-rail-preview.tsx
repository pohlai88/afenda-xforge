"use client";

import { Badge } from "@repo/ui/components/badge";
import type { ReactElement } from "react";

export function WorkspaceRailPreview(): ReactElement {
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-muted-foreground text-sm leading-6">
        This route renders the production app nav sidebar inside{" "}
        <code className="text-foreground">WorkspaceFrame</code> — same blocks as
        the authenticated shell. Validate chrome here; do not nest a second
        shell in this canvas.
      </p>

      <section className="space-y-4 border-border border-t pt-6">
        <p className="font-medium text-sm">Validate in the live shell</p>
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <Badge variant="outline">app-nav-topbar</Badge>
            <span>Org / department / team / project switchers</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">the-orbit</Badge>
            <span>System pulse, next SLA, workload pressure, and SLA meter</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">infrastructure</Badge>
            <span>Eisenhower tabs + Lynx, integration, audit, analysis, portal</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">resources</Badge>
            <span>Organization, department, team, press, career</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">site-sidebar</Badge>
            <span>Dev block 1 — preview surfaces and token/lane work</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">site-topbar</Badge>
            <span>Site sidebar trigger, scope label, and theme toggle</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">nav-user</Badge>
            <span>Demo profile menu in the sidebar footer</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
