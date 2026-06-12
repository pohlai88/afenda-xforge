"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { useThemeStudioHrSuite } from "./theme-studio-hr-suite-context.tsx";

export function HrSuiteSitePreview(): ReactElement {
  const { activeFeature } = useThemeStudioHrSuite();
  const isWired = Boolean(activeFeature.liveHref);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-lg">{activeFeature.label}</h2>
          <Badge variant={isWired ? "default" : "secondary"}>
            {isWired ? "Live in app" : "Scaffold"}
          </Badge>
        </div>
        <p className="max-w-3xl text-muted-foreground text-sm leading-6">
          {activeFeature.description ??
            "HR Suite feature surface — select another module in the site sidebar to preview scope and topbar wiring."}
        </p>
        <p className="font-mono text-muted-foreground text-xs">
          {activeFeature.featureId}
        </p>
      </div>

      {activeFeature.liveHref ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={activeFeature.liveHref}>Open live route</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/theme-studio/workspace-rail">Stay on workspace rail</Link>
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          This module is registered in HR Suite metadata but does not yet have
          an authenticated app route. API scaffolding may still exist under{" "}
          <code className="text-foreground">apps/api</code>.
        </p>
      )}

      <section className="space-y-3 border-border border-t pt-6">
        <p className="font-medium text-sm">Site chrome on this route</p>
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li>
            <Badge className="mr-2" variant="outline">site-topbar</Badge>
            HR SUITE scope + active feature title
          </li>
          <li>
            <Badge className="mr-2" variant="outline">site-sidebar</Badge>
            Full HR Suite module tree by domain
          </li>
          <li>
            <Badge className="mr-2" variant="outline">site-content</Badge>
            Feature preview canvas (this panel)
          </li>
          <li>
            <Badge className="mr-2" variant="outline">app-nav</Badge>
            Global Infrastructure / Resources rail (left)
          </li>
        </ul>
      </section>
    </div>
  );
}
