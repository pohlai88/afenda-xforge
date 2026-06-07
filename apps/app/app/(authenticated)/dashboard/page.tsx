import { SignOut } from "@repo/auth/components/sign-out";
import { ForbiddenError } from "@repo/errors";
import { companyMetadata } from "@repo/features-master-data-companies/metadata";
import { customerMetadata } from "@repo/features-master-data-customers/metadata";
import type { EntityMetadata } from "@repo/metadata";
import { EntityMetadataTable, getEntityLabels } from "@repo/metadata-ui";
import { DashboardGrid, KpiCard } from "@repo/ui";
import Link from "next/link";
import type { ReactElement } from "react";
import { loadDashboardData } from "./_data.ts";

type SectionState =
  | {
      data: {
        items: readonly {
          [key: string]: string | number | boolean | Date | null | undefined;
          id: string;
        }[];
        total: number;
      };
      status: "ready";
    }
  | {
      message: string;
      status: "error";
    }
  | {
      status: "forbidden";
    };

const renderSection = (
  title: string,
  metadata: EntityMetadata,
  state: SectionState,
  searchPlaceholder: string
): ReactElement => {
  if (state.status === "forbidden") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
          <p className="text-muted-foreground">
            You do not have permission to view this section.
          </p>
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
          <p className="text-muted-foreground">{state.message}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="font-semibold text-xl tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">
          {state.data.total} total record{state.data.total === 1 ? "" : "s"}
        </p>
      </div>
      <EntityMetadataTable
        defaultSortColumn={metadata.table?.defaultSort}
        metadata={metadata}
        pageSize={5}
        rows={state.data.items}
        searchPlaceholder={searchPlaceholder}
      />
    </section>
  );
};

const renderDashboardAccessError = (message: string): ReactElement => (
  <section className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
        XForge
      </p>
      <h1 className="font-semibold text-3xl tracking-tight">
        Dashboard unavailable
      </h1>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </section>
);

export default async function DashboardPage(): Promise<ReactElement> {
  try {
    const dashboard = await loadDashboardData();
    const customerLabels = getEntityLabels(customerMetadata);
    const companyLabels = getEntityLabels(companyMetadata);

    return (
      <section className="space-y-8">
        <header className="rounded-[var(--radius-xl)] border border-border bg-card/95 p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                  XForge
                </p>
                <h1 className="font-semibold text-4xl tracking-tight">
                  Governed tenant dashboard
                </h1>
                <p className="max-w-2xl text-muted-foreground">
                  Signed in as{" "}
                  <span className="font-medium text-foreground">
                    {dashboard.userEmail ?? "Authenticated user"}
                  </span>{" "}
                  on tenant{" "}
                  <span className="font-medium text-foreground">
                    {dashboard.tenantId}
                  </span>{" "}
                  with role{" "}
                  <span className="font-medium text-foreground">
                    {dashboard.tenantRole}
                  </span>
                  .
                </p>
              </div>
              <DashboardGrid columns={3} gap="md">
                <KpiCard
                  module={customerLabels.plural}
                  title="Customers"
                  tone="primary"
                  value={
                    dashboard.customers.status === "ready"
                      ? dashboard.customers.data.total
                      : "Restricted"
                  }
                />
                <KpiCard
                  module={companyLabels.plural}
                  title="Companies"
                  tone="success"
                  value={
                    dashboard.companies.status === "ready"
                      ? dashboard.companies.data.total
                      : "Restricted"
                  }
                />
                <KpiCard
                  module="Tenant access"
                  title="Role"
                  tone="info"
                  value={dashboard.tenantRole}
                />
              </DashboardGrid>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
                href="/assistant"
              >
                Open assistant
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
                href="/audit"
              >
                Open audit
              </Link>
              <SignOut className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90" />
            </div>
          </div>
        </header>

        <div className="grid gap-8">
          {renderSection(
            customerLabels.plural,
            customerMetadata,
            dashboard.customers,
            `Search ${customerLabels.plural.toLowerCase()}...`
          )}
          {renderSection(
            companyLabels.plural,
            companyMetadata,
            dashboard.companies,
            `Search ${companyLabels.plural.toLowerCase()}...`
          )}
        </div>
      </section>
    );
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return renderDashboardAccessError(
        "Tenant membership is required before the dashboard can load."
      );
    }

    return renderDashboardAccessError(
      error instanceof Error
        ? error.message
        : "The dashboard could not be loaded."
    );
  }
}
