import Link from "next/link";
import type { ReactElement } from "react";
import { DashboardGrid } from "../_components/dashboard-grid.tsx";
import { KpiCard } from "../_components/kpi-card.tsx";

export default function HrHubPage(): ReactElement {
  return (
    <section className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                XForge
              </p>
              <h1 className="font-semibold text-4xl tracking-tight">HR hub</h1>
              <p className="max-w-3xl text-muted-foreground">
                Entry point for governed HR surfaces. This hub keeps document
                storage, registration, and tenant-scoped access in one place.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90"
              href="/hr/documents"
            >
              Open documents
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <DashboardGrid columns={3} gap="md">
            <KpiCard
              module="Surface"
              title="Documents"
              tone="primary"
              value="/hr/documents"
            />
            <KpiCard
              module="Blob"
              title="Upload mode"
              tone="info"
              value="Server + direct browser"
            />
            <KpiCard
              module="Registration"
              title="Record store"
              tone="success"
              value="Tenant-scoped"
            />
          </DashboardGrid>
        </div>
      </header>
    </section>
  );
}
