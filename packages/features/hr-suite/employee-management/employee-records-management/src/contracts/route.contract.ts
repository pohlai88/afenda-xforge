import { z } from "zod";

export const hrRecordsRouteContractSchema = z.object({
  version: z.literal("v1"),
  routes: z.object({
    archive: z.string().trim().min(1),
    assignments: z.string().trim().min(1),
    detail: z.string().trim().min(1),
    rehire: z.string().trim().min(1),
    statusHistory: z.string().trim().min(1),
  }),
});

export type HrRecordsRouteContract = z.infer<
  typeof hrRecordsRouteContractSchema
>;
