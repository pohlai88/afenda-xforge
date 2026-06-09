import { z } from "zod";

export const hrRecordsBoundedContextSchema = z.object({
  source: z.literal("legacy-hr-suite"),
  suite: z.literal("hr-suite"),
  domain: z.literal("employee-management"),
  feature: z.literal("employee-records-management"),
  packageName: z.string().trim().min(1),
});

export type HrRecordsBoundedContext = z.infer<
  typeof hrRecordsBoundedContextSchema
>;
