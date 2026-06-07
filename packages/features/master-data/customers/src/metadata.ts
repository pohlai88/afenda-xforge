import type { EntityMetadata } from "@repo/metadata";

export const customerMetadata: EntityMetadata = {
  entity: "customer",
  labels: {
    singular: "Customer",
    plural: "Customers",
  },
  table: {
    defaultSort: "name",
    columns: [
      {
        key: "code",
        label: "Code",
      },
      {
        key: "name",
        label: "Name",
      },
      {
        key: "email",
        label: "Email",
        kind: "email",
      },
      {
        key: "status",
        label: "Status",
        kind: "status",
      },
    ],
  },
};
