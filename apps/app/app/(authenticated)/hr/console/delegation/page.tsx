import Link from "next/link";
import type { ReactElement } from "react";
import { StatusBadge } from "../../../_components/status-badge.tsx";
import { loadHrConsoleDelegationData } from "../_data.ts";

export default async function HrConsoleDelegationPage(): Promise<ReactElement> {
  const result = await loadHrConsoleDelegationData();

  if (result.status === "forbidden") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <h1 className="font-semibold text-3xl tracking-tight">
          Delegation unavailable
        </h1>
      </section>
    );
  }

  if (result.status === "error") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <h1 className="font-semibold text-3xl tracking-tight">
          Delegation unavailable
        </h1>
        <p className="mt-2 text-muted-foreground">{result.message}</p>
      </section>
    );
  }

  const { grants, overview } = result.data;

  return (
    <section className="space-y-8">
      <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
              HR Console
            </p>
            <h1 className="font-semibold text-4xl tracking-tight">
              Delegation
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Active delegation grants for HR managers inside the console
              operator envelope.
            </p>
            <StatusBadge tone={overview.canDelegate ? "success" : "warning"}>
              {overview.canDelegate
                ? "Delegation writes enabled"
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

      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <h2 className="font-semibold text-2xl tracking-tight">
          Active grants
        </h2>
        {grants.length === 0 ? (
          <p className="mt-4 text-muted-foreground text-sm">
            No active delegation grants for this company.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {grants.map((grant) => (
              <li
                className="rounded-lg border border-border/70 bg-background/80 p-4"
                key={grant.id}
              >
                <p className="font-medium text-sm">
                  Grantee {grant.granteeId}
                </p>
                <p className="text-muted-foreground text-xs">
                  Grantor {grant.grantorId}
                </p>
                <p className="mt-2 font-mono text-xs">
                  {grant.capabilities.join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
