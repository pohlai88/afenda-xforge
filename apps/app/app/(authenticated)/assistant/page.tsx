import { DashboardGrid, KpiCard } from "@repo/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import { AssistantComposer } from "./assistant-composer.tsx";

export default function AssistantPage(): ReactElement {
  return (
    <section className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                XForge
              </p>
              <h1 className="font-semibold text-4xl tracking-tight">
                Machine assistant
              </h1>
              <p className="max-w-3xl text-muted-foreground">
                This page routes through{" "}
                <span className="font-medium text-foreground">
                  @repo/machine
                </span>{" "}
                and the canonical internal AI endpoint. It stays tenant-scoped,
                permission-checked, and feature-backed.
              </p>
            </div>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
            href="/dashboard"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-8">
          <DashboardGrid columns={3} gap="md">
            <KpiCard
              module="Scope"
              title="Tenant"
              tone="info"
              value="Tenant + company aware"
            />
            <KpiCard
              module="Access"
              title="Permission"
              tone="success"
              value="ai.read required"
            />
            <KpiCard
              module="Modules"
              title="Assistant"
              tone="primary"
              value="Auto, general, customers, companies"
            />
          </DashboardGrid>
        </div>
      </header>

      <AssistantComposer />
    </section>
  );
}
