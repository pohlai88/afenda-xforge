import { MetadataSectionStack } from "@repo/metadata-ui/components";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import type { ReactElement } from "react";
import { AuthenticatedFeatureScope } from "../../../_components/authenticated-feature-scope.tsx";
import { DashboardGrid } from "../_components/dashboard-grid.tsx";
import { AssistantComposer } from "./assistant-composer.tsx";

const ASSISTANT_FEATURE_ID = "system-admin.overview";

export type AssistantViewProps = {
  context: MetadataRenderContext;
};

const assistantSections = [
  {
    description: "Scope",
    key: "assistant-kpi-tenant",
    kind: "stat" as const,
    metadataAttributes: {
      tone: "info",
      value: "Tenant + company aware",
    },
    title: "Tenant",
  },
  {
    description: "Access",
    key: "assistant-kpi-permission",
    kind: "stat" as const,
    metadataAttributes: {
      tone: "success",
      value: "ai.read required",
    },
    title: "Permission",
  },
  {
    description: "Modules",
    key: "assistant-kpi-modules",
    kind: "stat" as const,
    metadataAttributes: {
      tone: "primary",
      value: "Auto, general, customers, companies",
    },
    title: "Assistant",
  },
] as const;

export function AssistantView({ context }: AssistantViewProps): ReactElement {
  return (
    <AuthenticatedFeatureScope featureId={ASSISTANT_FEATURE_ID}>
      <section className="space-y-8">
        <header className="rounded-xl border border-border bg-card/95 p-8 shadow-sm">
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
                  and the canonical internal AI endpoint. It stays
                  tenant-scoped, permission-checked, and feature-backed.
                </p>
              </div>
            </div>

            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>

          <div className="mt-8">
            <DashboardGrid columns={3} gap="md">
              {assistantSections.map((section) => (
                <MetadataSectionStack
                  context={context}
                  key={section.key}
                  sections={[section]}
                />
              ))}
            </DashboardGrid>
          </div>
        </header>

        <AssistantComposer />
      </section>
    </AuthenticatedFeatureScope>
  );
}
