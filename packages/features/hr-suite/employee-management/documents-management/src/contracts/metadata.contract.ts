import { z } from "zod";

import { trimmedStringSchema } from "./schema.ts";

export type DocumentsManagementMetadata = {
  description: string;
  domain: "employee-management";
  id: "hr-suite.employee-management.documents-management";
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: "Documents Management";
};

export const documentsManagementMetadataSchema: z.ZodType<DocumentsManagementMetadata> =
  z.object({
    id: z.literal("hr-suite.employee-management.documents-management"),
    title: z.literal("Documents Management"),
    description: z.string().trim().min(1),
    domain: z.literal("employee-management"),
    labels: z.object({
      singular: trimmedStringSchema,
      plural: trimmedStringSchema,
    }),
    source: z.literal("legacy-hr-suite"),
    suite: z.literal("hr-suite"),
  });
