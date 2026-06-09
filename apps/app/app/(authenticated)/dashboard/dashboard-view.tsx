import { EntityMetadataPanel, getEntityLabels } from "@repo/metadata-ui";
import type { EntityMetadata } from "@repo/metadata";
import type { ReactElement, ReactNode } from "react";
import { DashboardGrid } from "../_components/dashboard-grid.tsx";
import { KpiCard } from "../_components/kpi-card.tsx";

export type DashboardSectionState =
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

export type DashboardViewProps = {
  companies: {
    metadata: EntityMetadata;
    state: DashboardSectionState;
  };
  customers: {
    metadata: EntityMetadata;
    state: DashboardSectionState;
  };
  headerActions?: ReactNode;
  tenantId: string;
  tenantRole: string;
  userEmail: string | null;
};

const renderSection = (
  title: string,
  metadata: EntityMetadata,
  state: DashboardSectionState,
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

export function DashboardView({
  companies,
  customers,
  headerActions,
  tenantId,
  tenantRole,
  userEmail,
}: DashboardViewProps): ReactElement {
  const customerLabels = getEntityLabels(customers.metadata);
  const companyLabels = getEntityLabels(companies.metadata);

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
                  {userEmail ?? "Authenticated user"}
                </span>{" "}
                on tenant{" "}
                <span className="font-medium text-foreground">{tenantId}</span>{" "}
                with role{" "}
                <span className="font-medium text-foreground">
                  {tenantRole}
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
                  customers.state.status === "ready"
                    ? customers.state.data.total
                    : "Restricted"
                }
              />
              <KpiCard
                module={companyLabels.plural}
                title="Companies"
                tone="success"
                value={
                  companies.state.status === "ready"
                    ? companies.state.data.total
                    : "Restricted"
                }
              />
              <KpiCard
                module="Tenant access"
                title="Role"
                tone="info"
                value={tenantRole}
              />
            </DashboardGrid>
          </div>
          {headerActions ? (
            <div className="flex flex-wrap items-center gap-3">{headerActions}</div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-8">
        {renderSection(
          customerLabels.plural,
          customers.metadata,
          customers.state,
          `Search ${customerLabels.plural.toLowerCase()}...`
        )}
        {renderSection(
          companyLabels.plural,
          companies.metadata,
          companies.state,
          `Search ${companyLabels.plural.toLowerCase()}...`
        )}
      </div>
    </section>
  );
}
