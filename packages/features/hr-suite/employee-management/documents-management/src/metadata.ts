export type DocumentsManagementMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const documentsManagementMetadata: DocumentsManagementMetadata = {
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
};
