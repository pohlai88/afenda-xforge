import { SignOut } from "@repo/auth/components/sign-out";
import { resolveLayeredCustomizedEntityMetadata } from "@repo/customization/resolution";
import { ForbiddenError } from "@repo/errors";
import { companyMetadata } from "@repo/features-master-data-companies/metadata";
import { customerMetadata } from "@repo/features-master-data-customers/metadata";
import type { EntityMetadata } from "@repo/metadata";
import Link from "next/link";
import type { ReactElement } from "react";
import type { DashboardEntityCustomizationLayers } from "./_customizations.ts";
import { loadDashboardMetadataCustomizations } from "./_customizations.ts";
import { loadDashboardData } from "./_data.ts";
import { DashboardView } from "./dashboard-view.tsx";

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
  layers: DashboardEntityCustomizationLayers,
  companyId: string | null
): EntityMetadata => {
  try {
    return resolveLayeredCustomizedEntityMetadata(metadata, layers, {
      companyAware: Boolean(
        companyId && layers.company?.companyId === companyId
      ),
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
    const customizations = await loadDashboardMetadataCustomizations({
      companyId: dashboard.companyId,
      tenantId: dashboard.tenantId,
    });
    const resolvedCustomerMetadata = resolveDashboardMetadata(
      customerMetadata,
      customizations.customers,
      dashboard.companyId
    );
    const resolvedCompanyMetadata = resolveDashboardMetadata(
      companyMetadata,
      customizations.companies,
      dashboard.companyId
    );
    return (
      <DashboardView
        companies={{
          metadata: resolvedCompanyMetadata,
          state: dashboard.companies,
        }}
        customers={{
          metadata: resolvedCustomerMetadata,
          state: dashboard.customers,
        }}
        headerActions={
          <>
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
            <Link
              className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 font-medium text-sm transition hover:bg-muted"
              href="/hr/documents"
            >
              Open documents
            </Link>
            <SignOut className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90" />
          </>
        }
        tenantId={dashboard.tenantId}
        tenantRole={dashboard.tenantRole}
        userEmail={dashboard.userEmail}
      />
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
