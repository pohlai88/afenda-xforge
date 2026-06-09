import { overtimeManagementRouteContracts } from "./contract.ts";

export type OvertimeManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof overtimeManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const overtimeManagementManifest: OvertimeManagementManifest = {
  id: "hr-suite.time-attendance.overtime-management",
  title: "Overtime Management",
  description:
    "Governed package for the legacy HR Suite overtime-management slice at afenda-erp/packages/features/hr-suite/src/time-attendance/overtime-management.",
  domain: "time-attendance",
  packageName: "@repo/features-time-attendance-overtime-management",
  routeContracts: overtimeManagementRouteContracts,
  suite: "hr-suite",
};
