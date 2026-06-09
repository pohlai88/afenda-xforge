import type { EntityMetadata } from "@repo/metadata";
import {
  createMetadataRenderContext,
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
  EntityMetadataPanel,
  MetadataForm,
  MetadataSectionStack,
  MetadataStateBoundary,
} from "@repo/metadata-ui";
import type {
  MetadataActionContract,
  MetadataFieldContract,
  MetadataSectionContract,
} from "@repo/metadata-ui/contracts";
import type { DashboardTableRow } from "@repo/ui";
import type { ReactElement } from "react";

const metadata: EntityMetadata = {
  entity: "invoice",
  id: "billing.invoices",
  labels: {
    plural: "Invoices",
    singular: "Invoice",
  },
  table: {
    columns: [
      {
        field: "number",
        key: "number",
        label: "Invoice",
      },
      {
        field: "status",
        key: "status",
        kind: "status",
        label: "Status",
      },
    ],
    defaultSort: "number",
  },
  title: "Invoices",
};

const rows: readonly DashboardTableRow[] = [
  {
    id: "inv-001",
    number: "INV-001",
    status: "active",
  },
];

const actions: readonly MetadataActionContract[] = [
  {
    key: "save",
    kind: "update",
    label: "Save",
  },
];

const fields: readonly MetadataFieldContract[] = [
  {
    key: "name",
    kind: "text",
    label: "Name",
  },
];

const sections: readonly MetadataSectionContract<
  EntityMetadata,
  DashboardTableRow
>[] = [
  {
    fields,
    key: "profile",
    kind: "form",
    title: "Profile",
  },
  {
    key: "table",
    kind: "table",
    metadata,
    rows,
    title: "Records",
  },
];

export function runPublicApiConsumerSmoke(): {
  compatibilityOk: boolean;
  formType: unknown;
  panelType: unknown;
  qualityGrade: string;
  sectionStackType: unknown;
  stateBoundaryType: unknown;
} {
  const context = createMetadataRenderContext(
    {
      permissions: {
        "invoice.update": true,
      },
    },
    {
      mode: "update",
    }
  );
  const compatibility = createMetadataUiCompatibilityReport();
  const quality = createMetadataUiQualityAssessment({
    compatibility,
    defaultRendererCoverage: true,
    governanceFallbackCoverage: true,
    gracefulUnknownFallbacks: true,
    telemetryCorrelationCoverage: true,
    verification: {
      boundaryLint: true,
      lint: true,
      test: true,
      typecheck: true,
    },
  });

  const form = MetadataForm({
    actions,
    context,
    fields,
  }) as ReactElement;
  const stack = MetadataSectionStack({
    context,
    sections,
  }) as ReactElement;
  const stateBoundary = MetadataStateBoundary({
    context,
    state: "ready",
  }) as ReactElement | null;
  const panel = EntityMetadataPanel({
    context,
    metadata,
    rows,
  }) as ReactElement;

  return {
    compatibilityOk: compatibility.ok,
    formType: form.type,
    panelType: panel.type,
    qualityGrade: quality.grade,
    sectionStackType: stack.type,
    stateBoundaryType: stateBoundary?.type ?? null,
  };
}
