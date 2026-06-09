import { z } from "zod";

export const hrRecordsEmploymentStatusSchema = z.enum([
  "draft",
  "active",
  "archived",
  "separated",
]);

export type HrRecordsEmploymentStatus = z.infer<
  typeof hrRecordsEmploymentStatusSchema
>;
