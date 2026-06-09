export type TimeClockIntegrationStatus = "draft" | "active" | "archived";

export type TimeClockIntegrationRecord = {
  id: string;
  name: string;
  status: TimeClockIntegrationStatus;
};

export type ListTimeClockIntegrationQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateTimeClockIntegrationInput = {
  name: string;
};

export type UpdateTimeClockIntegrationInput = {
  id: string;
  name?: string;
  status?: TimeClockIntegrationStatus;
};

export const hrTimeClockRoutePaths = {
  hub: "/hr/time-clock",
} as const;

export type HrTimeClockRoutePath =
  (typeof hrTimeClockRoutePaths)[keyof typeof hrTimeClockRoutePaths];

export const hrTimeClockCapabilities = {
  read: "hr.timeClock.read",
  write: "hr.timeClock.write",
  admin: "hr.timeClock.admin",
} as const;

export type HrTimeClockCapability =
  (typeof hrTimeClockCapabilities)[keyof typeof hrTimeClockCapabilities];

export const hrTimeClockReadPermission = {
  module: "hr",
  object: "time_clock",
  function: "read",
} as const;

export const timeClockIntegrationRouteContracts = [] as const;

export const timeClockIntegrationFeatureId =
  "hr-suite.time-attendance.time-clock-integration" as const;
