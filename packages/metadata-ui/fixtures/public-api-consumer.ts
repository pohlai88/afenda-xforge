import type { EntityMetadata } from "@repo/metadata";
import type { DashboardTableRow } from "@repo/ui";

import type {
  MetadataActionContract,
  MetadataConsumerScenarioDefinition,
  MetadataFieldContract,
  MetadataSectionContract,
} from "../src/contracts";

export const publicConsumerMetadata: EntityMetadata = {
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

export const publicConsumerRows: readonly DashboardTableRow[] = [
  {
    id: "inv-001",
    number: "INV-001",
    status: "active",
  },
];

export const publicConsumerActions: readonly MetadataActionContract[] = [
  {
    fallback: "disable",
    featureFlag: "billing-editor",
    key: "save",
    kind: "update",
    label: "Save",
  },
];

export const publicConsumerFields: readonly MetadataFieldContract[] = [
  {
    fallback: "disable",
    featureFlag: "billing-editor",
    key: "name",
    kind: "text",
    label: "Name",
  },
];

export const publicConsumerSections: readonly MetadataSectionContract<
  EntityMetadata,
  DashboardTableRow
>[] = [
  {
    fields: publicConsumerFields,
    key: "profile",
    kind: "form",
    title: "Profile",
  },
  {
    key: "table",
    kind: "table",
    metadata: publicConsumerMetadata,
    rows: publicConsumerRows,
    title: "Records",
  },
];

export const metadataConsumerScenarioMatrix: readonly MetadataConsumerScenarioDefinition[] =
  [
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "create-ready",
      mode: "create",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "read-ready",
      mode: "read",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "update-ready",
      mode: "update",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: false,
      featureFlags: { "billing-editor": true },
      id: "review-ready",
      mode: "review",
      permissions: { "invoice.update": true },
    },
    {
      expectedDisabled: true,
      featureFlags: { "billing-editor": true },
      id: "readonly-review",
      mode: "review",
      permissions: { "invoice.update": true },
      readonly: true,
    },
    {
      expectedDisabled: true,
      featureFlags: {},
      id: "feature-flag-denied",
      mode: "update",
      permissions: { "invoice.update": true },
    },
  ];
