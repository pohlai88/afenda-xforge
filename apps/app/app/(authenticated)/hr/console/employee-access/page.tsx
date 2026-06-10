import Link from "next/link";
import type { ReactElement } from "react";
import { StatusBadge } from "../../../_components/status-badge.tsx";
import { EmployeeAccessPanel } from "../_components/employee-access-panel.tsx";
import { loadEmployeeAccessLinks } from "../_employee-access-actions.ts";
import { loadHrConsoleEmployeeAccessHubData } from "../_data.ts";

export default async function HrConsoleEmployeeAccessPage(): Promise<ReactElement> {
  const result = await loadHrConsoleEmployeeAccessHubData();
  const links = result.status === "ready" ? await loadEmployeeAccessLinks() : [];

  if (result.status === "forbidden") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <h1 className="font-semibold text-3xl tracking-tight">
          Employee access unavailable
        </h1>
      </section>
    );
  }

  if (result.status === "error") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <h1 className="font-semibold text-3xl tracking-tight">
          Employee access unavailable
        </h1>
        <p className="mt-2 text-muted-foreground">{result.message}</p>
      </section>
    );
  }

  const { overview } = result.data;

  return (
    <section className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
              HR Console
            </p>
            <h1 className="font-semibold text-4xl tracking-tight">
              Employee access
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Governed auth-user to employee bindings for LAM self-service scope
              resolution.
            </p>
            <StatusBadge tone={overview.canDomainWrite ? "success" : "warning"}>
              {overview.canDomainWrite
                ? "Domain writes enabled"
                : "Read-only for your governance mode"}
            </StatusBadge>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
            href="/hr/console"
          >
            Back to overview
          </Link>
        </div>
      </header>

      <EmployeeAccessPanel
        canWrite={overview.canDomainWrite}
        links={links}
      />
    </section>
  );
}
