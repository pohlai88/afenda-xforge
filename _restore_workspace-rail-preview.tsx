"use client";

import { Badge } from "@repo/ui/components/badge";
import type { ReactElement } from "react";

import { PreviewHeader, PreviewPageShell } from "./theme-studio-shared.tsx";

export function WorkspaceRailPreview(): ReactElement {
  return (
    <PreviewPageShell>
      <PreviewHeader
        description="The workspace rail is the Theme Studio shell — breadcrumb context switchers in the app topbar, orbit capture and tree navigation in the sidebar, page content on a flat canvas. Validate hierarchy, contrast, and selection affordances here."
        previewNumber="07"
        scores={[
          { label: "Rail hierarchy", value: 96 },
          { label: "Tree navigation", value: 93 },
          { label: "Context switching", value: 91 },
        ]}
        title="Workspace Rail Preview"
      />

      <section className="space-y-4 border-border border-t pt-6">
        <p className="text-muted-foreground text-sm leading-6">
          Interact with the workspace shell:
        </p>
        <ul className="grid gap-3 text-sm sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <Badge variant="outline">app-nav-topbar</Badge>
            <span>Organization / department / team / project breadcrumb switchers on flat chrome</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">my-orbit</Badge>
            <span>Collapsible orbit status, create-new capture, and labels</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">nav-main</Badge>
            <span>Preview pages tree — switch routes from the workspace section</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">nav-secondary</Badge>
            <span>Feature shortcuts for Storybook parity, tokens, and lanes</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">site-content</Badge>
            <span>Flat canvas — no inset card shell around main content</span>
          </li>
          <li className="flex items-start gap-2">
            <Badge variant="outline">nav-user</Badge>
            <span>Profile menu anchored to the sidebar footer</span>
          </li>
        </ul>
      </section>
    </PreviewPageShell>
  );
}
