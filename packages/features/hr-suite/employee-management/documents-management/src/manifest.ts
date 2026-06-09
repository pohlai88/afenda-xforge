import type { DocumentsManagementManifest } from "./contracts/index.ts";
import {
  documentsManagementManifestSchema,
  documentsManagementRouteContracts,
} from "./contracts/index.ts";

export const documentsManagementManifest: DocumentsManagementManifest =
  documentsManagementManifestSchema.parse({
    id: "hr-suite.employee-management.documents-management",
    title: "Documents Management",
    description:
      "Governed package for the legacy HR Suite documents-management slice at afenda-erp/packages/features/hr-suite/src/employee-management/documents-management.",
    domain: "employee-management",
    packageName: "@repo/features-employee-management-documents-management",
    routeContracts: documentsManagementRouteContracts,
    suite: "hr-suite",
  });
