import type { EntityMetadata } from "@repo/metadata";

export const companyMetadata: EntityMetadata = {
  entity: "company",
  labels: {
    singular: "Company",
    plural: "Companies",
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
    ],
  },
};
