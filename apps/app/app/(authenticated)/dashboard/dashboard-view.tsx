import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";
import {
  dashboardOverviewKpiSectionTemplates,
} from "@repo/features-system-admin-control-plane/metadata/dashboard-overview";
import {
  EntityMetadataPanel,
  getEntityLabels,
  MetadataSectionStack,
  renderMetadataTableCell,
} from "@repo/metadata-ui/components";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import { Badge } from "@repo/ui/components/badge";
import type { ReactElement, ReactNode } from "react";
import { AuthenticatedFeatureScope } from "../../_components/authenticated-feature-scope.tsx";
import { DashboardGrid } from "../_components/dashboard-grid.tsx";
import type { DashboardActivityState } from "./_data.ts";

const DASHBOARD_SHELL_FEATURE_ID = "system-admin.overview";
const CUSTOMERS_FEATURE_ID = "master-data.customers";
const COMPANIES_FEATURE_ID = "master-data.companies";

const auditOutcomeColumn = {
  field: "outcome",
  key: "outcome",
  kind: "status" as const,
  label: "Outcome",
};

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
  activity: DashboardActivityState;
  companies: {
    customizationLayers?: CustomizationLayerSet | null;
    metadata: EntityMetadata;
    state: DashboardSectionState;
  };
  context: MetadataRenderContext;
  customers: {
    customizationLayers?: CustomizationLayerSet | null;
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
  customizationLayers: CustomizationLayerSet | null | undefined,
  state: DashboardSectionState,
  searchPlaceholder: string,
  context: MetadataRenderContext
): ReactElement => {
  if (state.status === "forbidden") {
    return (
      <EntityMetadataPanel
        context={context}
        customizationLayers={customizationLayers}
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
        context={context}
        customizationLayers={customizationLayers}
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
      context={context}
      customizationLayers={customizationLayers}
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

const resolveDashboardKpiValue = (
  key: string,
  customers: DashboardViewProps["customers"],
  companies: DashboardViewProps["companies"],
  tenantRole: string
): number | string => {
  if (key === "dashboard-kpi-customers") {
    return customers.state.status === "ready"
      ? customers.state.data.total
      : "Restricted";
  }

  if (key === "dashboard-kpi-companies") {
    return companies.state.status === "ready"
      ? companies.state.data.total
      : "Restricted";
  }

  return tenantRole;
};

export function DashboardView({
  activity,
  companies,
  context,
  customers,
  headerActions,
  tenantId,
  tenantRole,
  userEmail,
}: DashboardViewProps): ReactElement {
  const customerLabels = getEntityLabels(customers.metadata);
  const companyLabels = getEntityLabels(companies.metadata);
  const kpiSections = dashboardOverviewKpiSectionTemplates.map((template) => ({
    description:
      template.key === "dashboard-kpi-customers"
        ? customerLabels.plural
        : template.key === "dashboard-kpi-companies"
          ? companyLabels.plural
          : template.description,
    key: template.key,
    kind: "stat" as const,
    title: template.title,
    metadataAttributes: {
      tone: template.tone,
      value: resolveDashboardKpiValue(
        template.key,
        customers,
        companies,
        tenantRole
      ),
    },
  }));

  return (
    <AuthenticatedFeatureScope
      className="space-y-8"
      featureId={DASHBOARD_SHELL_FEATURE_ID}
    >
      <header className="rounded-xl border border-lane-active-border bg-card/95 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
                  XForge
                </p>
                <Badge variant="lane">Overview lane</Badge>
              </div>
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
              {kpiSections.map((section) => (
                <MetadataSectionStack
                  context={context}
                  key={section.key}
                  sections={[section]}
                />
              ))}
            </DashboardGrid>
          </div>
          {headerActions ? (
            <div className="flex flex-wrap items-center gap-3">
              {headerActions}
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid gap-8">
        <AuthenticatedFeatureScope featureId={CUSTOMERS_FEATURE_ID}>
          {renderSection(
            customerLabels.plural,
            customers.metadata,
            customers.customizationLayers,
            customers.state,
            `Search ${customerLabels.plural.toLowerCase()}...`,
            context
          )}
        </AuthenticatedFeatureScope>
        <AuthenticatedFeatureScope featureId={COMPANIES_FEATURE_ID}>
          {renderSection(
            companyLabels.plural,
            companies.metadata,
            companies.customizationLayers,
            companies.state,
            `Search ${companyLabels.plural.toLowerCase()}...`,
            context
          )}
        </AuthenticatedFeatureScope>
        {activity.status === "ready" && activity.data.events.length > 0 ? (
          <MetadataSectionStack
            context={context}
            resolveSectionContent={({ section }) =>
              section.key === "dashboard-activity-feed" ? (
                <ul className="space-y-3">
                  {activity.data.events.map((event) => (
                    <li
                      className="rounded-lg border border-border/70 bg-card/80 p-4"
                      key={event.id}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{event.summary}</p>
                          <p className="text-muted-foreground text-xs">
                            {event.action} ·{" "}
                            {event.occurredAt.toLocaleString()}
                          </p>
                        </div>
                        {renderMetadataTableCell(
                          auditOutcomeColumn,
                          event.outcome,
                          context
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null
            }
            sections={[
              {
                description: `${activity.data.total} total audit event${activity.data.total === 1 ? "" : "s"} in tenant scope.`,
                key: "dashboard-activity-feed",
                kind: "activity",
                title: "Recent audit activity",
              },
            ]}
          />
        ) : null}
      </div>
    </AuthenticatedFeatureScope>
  );
}
