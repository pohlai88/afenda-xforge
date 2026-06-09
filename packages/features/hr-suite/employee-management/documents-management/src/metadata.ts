import type { DocumentsManagementMetadata } from "./contracts/index.ts";
import { documentsManagementMetadataSchema } from "./contracts/index.ts";

export const documentsManagementMetadata: DocumentsManagementMetadata =
  documentsManagementMetadataSchema.parse({
    id: "hr-suite.employee-management.documents-management",
    title: "Documents Management",
    description:
      "Governed metadata for the employee-management documents feature extracted from the legacy HR suite.",
    domain: "employee-management",
    labels: {
      singular: "Documents Management record",
      plural: "Documents Management records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  });
