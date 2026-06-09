import { shiftSchedulingRouteContracts } from "./contract.ts";

export type ShiftSchedulingManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof shiftSchedulingRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const shiftSchedulingManifest: ShiftSchedulingManifest = {
  id: "hr-suite.time-attendance.shift-scheduling",
  title: "Shift Scheduling",
  description:
    "Governed package manifest for the shift-scheduling slice extracted from the legacy HR suite.",
  domain: "time-attendance",
  packageName: "@repo/features-time-attendance-shift-scheduling",
  routeContracts: shiftSchedulingRouteContracts,
  suite: "hr-suite",
};
