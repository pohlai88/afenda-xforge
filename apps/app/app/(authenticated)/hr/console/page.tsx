import Link from "next/link";
import type { ReactElement } from "react";
import { StatusBadge } from "../../_components/status-badge.tsx";
import { loadHrConsoleOverviewData } from "./_data.ts";

const governanceLabel = (
  mode: string,
  actingAsConsoleOperator?: boolean
): string => {
  if (mode === "unassigned_fallback") {
    return actingAsConsoleOperator
      ? "System Admin operating — no HR operator assigned"
      : "Unassigned fallback";
  }

  return "HR operator assigned — System Admin read-only on writes";
};

export default async function HrConsoleOverviewPage(): Promise<ReactElement> {
  const result = await loadHrConsoleOverviewData();

  if (result.status === "forbidden") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <h1 className="font-semibold text-3xl tracking-tight">
          HR Console unavailable
        </h1>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to view the HR console for this company.
        </p>
      </section>
    );
  }

  if (result.status === "error") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <h1 className="font-semibold text-3xl tracking-tight">
          HR Console unavailable
        </h1>
        <p className="mt-2 text-muted-foreground">{result.message}</p>
      </section>
    );
  }

  const { data } = result;

  return (
    <section className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
              HR Console
            </p>
            <h1 className="font-semibold text-4xl tracking-tight">Overview</h1>
            <p className="max-w-3xl text-muted-foreground">
              Governed HR configuration surface for operators and delegated HR
              managers. Domain writes are resolved from console governance mode.
            </p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="info">
                {governanceLabel(
                  data.governanceMode,
                  data.actingAsConsoleOperator
                )}
              </StatusBadge>
              <StatusBadge tone="neutral">Company {data.companyId}</StatusBadge>
            </div>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
            href="/hr"
          >
            Back to HR hub
          </Link>
        </div>

        {data.warnings.length > 0 ? (
          <ul className="mt-6 space-y-2 text-muted-foreground text-sm">
            {data.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.sections.map((section) => (
          <Link
            className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm transition hover:bg-muted/40"
            href={section.appPath}
            key={section.id}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-xl tracking-tight">
                  {section.title}
                </h2>
                <StatusBadge
                  tone={section.status === "ready" ? "success" : "warning"}
                >
                  {section.status}
                </StatusBadge>
              </div>
              <p className="text-muted-foreground text-sm">
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </section>
    </section>
  );
}
