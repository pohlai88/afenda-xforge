import { SignOut } from "@repo/auth/components/sign-out";
import { resolveLayeredCustomizedEntityMetadata } from "@repo/customization/resolution";
import { ForbiddenError } from "@repo/errors";
import { companyMetadata } from "@repo/features-master-data-companies/metadata";
import { customerMetadata } from "@repo/features-master-data-customers/metadata";
import type { EntityMetadata } from "@repo/metadata";
import { EntityMetadataPanel, getEntityLabels } from "@repo/metadata-ui";
import Link from "next/link";
import type { ReactElement } from "react";
import { DashboardGrid } from "../_components/dashboard-grid.tsx";
import { KpiCard } from "../_components/kpi-card.tsx";
import {
  type DashboardEntityCustomizationLayers,
  loadDashboardMetadataCustomizations,
} from "./_customizations.ts";
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
      <EntityMetadataPanel
        defaultSortColumn={metadata.table?.defaultSort}
        forbidden
        metadata={metadata}
        rows={[]}
        searchPlaceholder={searchPlaceholder}
        title={title}
        totalRecords={0}
      />
    );
  }

  if (state.status === "error") {
    return (
      <EntityMetadataPanel
        defaultSortColumn={metadata.table?.defaultSort}
        error={state.message}
        metadata={metadata}
        rows={[]}
        searchPlaceholder={searchPlaceholder}
        title={title}
        totalRecords={0}
      />
    );
  }

  return (
    <EntityMetadataPanel
      defaultSortColumn={metadata.table?.defaultSort}
      metadata={metadata}
      pageSize={5}
      rows={state.data.items}
      searchPlaceholder={searchPlaceholder}
      title={title}
      totalRecords={state.data.total}
    />
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

const resolveDashboardMetadata = (
  metadata: EntityMetadata,
  layers: DashboardEntityCustomizationLayers
): EntityMetadata => {
  try {
    return resolveLayeredCustomizedEntityMetadata(metadata, layers, {
      companyAware: Boolean(layers.company),
    });
  } catch (error) {
    console.warn("Invalid dashboard metadata customization ignored.", {
      entity: metadata.entity,
      error: error instanceof Error ? error.message : String(error),
    });

    return metadata;
  }
};

export default async function DashboardPage(): Promise<ReactElement> {
  try {
    const dashboard = await loadDashboardData();
    const customizations = await loadDashboardMetadataCustomizations(
      dashboard.tenantId
    );
    const resolvedCustomerMetadata = resolveDashboardMetadata(
      customerMetadata,
      customizations.customers
    );
    const resolvedCompanyMetadata = resolveDashboardMetadata(
      companyMetadata,
      customizations.companies
    );
    const customerLabels = getEntityLabels(resolvedCustomerMetadata);
    const companyLabels = getEntityLabels(resolvedCompanyMetadata);

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
            resolvedCustomerMetadata,
            dashboard.customers,
            `Search ${customerLabels.plural.toLowerCase()}...`
          )}
          {renderSection(
            companyLabels.plural,
            resolvedCompanyMetadata,
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
