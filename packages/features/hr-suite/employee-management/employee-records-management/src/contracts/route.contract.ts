import { z } from "zod";

export const hrRecordsRouteContractSchema = z.object({
  version: z.literal("v1"),
  routes: z.object({
    archive: z.string().trim().min(1),
    assignments: z.string().trim().min(1),
    detail: z.string().trim().min(1),
    rehire: z.string().trim().min(1),
    statusHistory: z.string().trim().min(1),
    userAccounts: z.string().trim().min(1),
    userAccountsDeactivate: z.string().trim().min(1),
  }),
});

export type HrRecordsRouteContract = z.infer<
  typeof hrRecordsRouteContractSchema
>;

export const hrRecordsRouteContract = hrRecordsRouteContractSchema.parse({
  version: "v1",
  routes: {
    archive: "/hr/records/:employeeId/archive",
    assignments: "/hr/records/:employeeId/assignments",
    detail: "/hr/records/:employeeId",
    rehire: "/hr/records/:employeeId/rehire",
    statusHistory: "/hr/records/:employeeId/status-history",
    userAccounts: "/hr/records/user-accounts",
    userAccountsDeactivate: "/hr/records/user-accounts/deactivate",
  },
});
