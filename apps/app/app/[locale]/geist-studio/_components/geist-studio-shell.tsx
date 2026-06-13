"use client";

import { ModeToggle } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";

import { Link } from "@/i18n/navigation";

import { GEIST_STUDIO_SECTIONS } from "./geist-studio-routes.ts";
import { geistTypeStyle } from "./geist-type-style.ts";

type GeistStudioShellProps = {
  children: ReactNode;
};

export function GeistStudioShell({ children }: GeistStudioShellProps): ReactElement {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header
        className="sticky top-0 z-layer-sticky border-border/0 bg-background/95 backdrop-blur-sm"
        style={{ boxShadow: "0 1px 0 0 rgba(0,0,0,0.06)" }}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <div className="min-w-0">
            <p className="font-medium font-mono text-muted-foreground text-xs uppercase tracking-wide">
              @repo/design-system
            </p>
            <h1 className="truncate font-semibold" style={geistTypeStyle("label-subsection")}>
              Geist Studio
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              className="hidden text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-accent-foreground sm:inline"
              href="/theme-studio"
            >
              Theme Studio
            </Link>
            <ModeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Geist Studio sections" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {GEIST_STUDIO_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  className={cn(
                    "block rounded-md px-3 py-2 text-muted-foreground text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                  href={section.href}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 space-y-16">{children}</main>
      </div>
    </div>
  );
}
