import { z } from "zod";

import type { DocumentsManagementRouteContract } from "./route.contract.ts";
import { documentsManagementRouteContractSchema } from "./route.contract.ts";

export type DocumentsManagementManifest = {
  description: string;
  domain: "employee-management";
  id: "hr-suite.employee-management.documents-management";
  packageName: "@repo/features-employee-management-documents-management";
  routeContracts: readonly DocumentsManagementRouteContract[];
  suite: "hr-suite";
  title: "Documents Management";
};

export const documentsManagementManifestSchema: z.ZodType<DocumentsManagementManifest> =
  z.object({
    id: z.literal("hr-suite.employee-management.documents-management"),
    title: z.literal("Documents Management"),
    description: z.string().trim().min(1),
    domain: z.literal("employee-management"),
    packageName: z.literal(
      "@repo/features-employee-management-documents-management"
    ),
    routeContracts: documentsManagementRouteContractSchema.array(),
    suite: z.literal("hr-suite"),
  });
