import type { EntityMetadata } from "@repo/metadata";
import { hrConsoleCapabilities } from "./feature-scope.ts";

export const hrConsoleMetadata: EntityMetadata = {
  id: "hr.console",
  entity: "hr-console",
  title: "HR Console",
  description:
    "Suite-level HR console for operator governance, delegation, and LAM configuration entrypoints.",
  labels: {
    singular: "HR Console Section",
    plural: "HR Console Sections",
  },
  presentation: {
    density: "default",
    icon: "users",
    size: "lg",
    tone: "info",
    variant: "outline",
  },
  permissionHint: {
    action: "view",
    claim: hrConsoleCapabilities.overviewRead,
    reason: "Read HR console overview",
    scope: "company",
    subject: "hr.console",
  },
  fields: [
    {
      key: "title",
      label: "Section",
      kind: "text",
      required: true,
    },
    {
      key: "domain",
      label: "Domain",
      kind: "select",
      required: true,
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      required: true,
    },
  ],
  actions: [
    {
      key: "delegation-grant",
      label: "Grant delegation",
      kind: "update",
      placement: "primary",
      permissionHint: hrConsoleCapabilities.delegationManage,
    },
  ],
  filters: [],
  sections: [],
  table: {
    defaultSort: "title",
    title: "HR Console",
    columns: [
      {
        key: "title",
        label: "Section",
        field: "title",
        sortable: true,
        width: "lg",
      },
      {
        key: "domain",
        label: "Domain",
        field: "domain",
        kind: "status",
        sortable: true,
        width: "md",
      },
      {
        key: "status",
        label: "Status",
        field: "status",
        kind: "status",
        sortable: true,
        width: "sm",
      },
    ],
  },
};
