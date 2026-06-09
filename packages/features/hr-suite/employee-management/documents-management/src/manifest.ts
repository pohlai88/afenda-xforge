import { documentsManagementRouteContracts } from "./contract.ts";

export type DocumentsManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof documentsManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const documentsManagementManifest: DocumentsManagementManifest = {
  id: "hr-suite.employee-management.documents-management",
  title: "Documents Management",
  description:
    "Governed package for the legacy HR Suite documents-management slice at afenda-erp/packages/features/hr-suite/src/employee-management/documents-management.",
  domain: "employee-management",
  packageName: "@repo/features-employee-management-documents-management",
  routeContracts: documentsManagementRouteContracts,
  suite: "hr-suite",
};
