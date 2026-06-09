import type { Metadata } from "next";
import type { ReactElement } from "react";
import { webHomeMetadata, webSitePreset } from "./seo";

const appShellHref = new URL(
  "/",
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).toString();

export const metadata: Metadata = webHomeMetadata;

export default function HomePage(): ReactElement {
  return (
    <main className="relative isolate overflow-hidden bg-background px-6 py-10 text-foreground">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.18),_transparent_45%),linear-gradient(135deg,_rgba(2,6,23,0.05),_transparent_55%)]" />
      <section className="mx-auto flex min-h-[80dvh] w-full max-w-6xl flex-col justify-between gap-16">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              X
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-[0.32em]">
                XForge
              </p>
              <p className="font-medium text-sm">ERP control plane</p>
            </div>
          </div>
          <a
            className="rounded-full border border-border bg-background px-4 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
            href={appShellHref}
          >
            Open app shell
          </a>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-muted-foreground text-xs uppercase tracking-[0.28em]">
                App scaffold
              </div>
              <h1 className="max-w-4xl font-semibold text-5xl tracking-tight sm:text-6xl">
                Tenant-scoped operations without losing audit or permission
                finality.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground leading-8">
                This shell exists to prove the monorepo foundation, not to
                dilute it. It shares the design system, analytics hooks, and
                metadata conventions with the main app.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm">
                App Router
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm">
                Tailwind v4
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2 text-sm">
                Shared metadata
              </span>
            </div>
          </div>

          <aside className="grid gap-4 rounded-[2rem] border border-border bg-card/95 p-6 shadow-sm">
            <div className="rounded-2xl bg-muted/60 p-5">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
                Route model
              </p>
              <p className="mt-2 font-medium text-xl">Public web surface</p>
            </div>
            <div className="rounded-2xl bg-muted/60 p-5">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
                Shared stack
              </p>
              <p className="mt-2 text-muted-foreground text-sm leading-6">
                `@repo/analytics`, `@repo/design-system`, `@repo/next-config`,
                and `@repo/seo`.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
