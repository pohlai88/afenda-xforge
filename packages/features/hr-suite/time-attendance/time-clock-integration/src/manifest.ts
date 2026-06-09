import { timeClockIntegrationRouteContracts } from "./contract.ts";

export type TimeClockIntegrationManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof timeClockIntegrationRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const timeClockIntegrationManifest: TimeClockIntegrationManifest = {
  id: "hr-suite.time-attendance.time-clock-integration",
  title: "Time Clock Integration",
  description:
    "Governed package for the legacy HR Suite time-clock-integration slice at afenda-erp/packages/features/hr-suite/src/time-attendance/time-clock-integration.",
  domain: "time-attendance",
  packageName: "@repo/features-time-attendance-time-clock-integration",
  routeContracts: timeClockIntegrationRouteContracts,
  suite: "hr-suite",
};
