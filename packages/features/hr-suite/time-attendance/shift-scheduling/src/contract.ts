export type ShiftSchedulingStatus = "draft" | "active" | "archived";

export type ShiftSchedulingRecord = {
  id: string;
  name: string;
  status: ShiftSchedulingStatus;
};

export type ListShiftSchedulingQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateShiftSchedulingInput = {
  name: string;
};

export type UpdateShiftSchedulingInput = {
  id: string;
  name?: string;
  status?: ShiftSchedulingStatus;
};

export const hrTimeSftReadPermission = {
  module: "hr",
  object: "shift_schedule",
  function: "read",
} as const;

export const hrTimeSftWritePermission = {
  module: "hr",
  object: "shift_schedule",
  function: "write",
} as const;

export const hrTimeSftApprovePermission = {
  module: "hr",
  object: "shift_schedule",
  function: "approve",
} as const;

export const hrTimeSftRoutePaths = {
  hub: "/apps/hrm/shift-scheduling",
} as const;

export type HrTimeSftRoutePath =
  (typeof hrTimeSftRoutePaths)[keyof typeof hrTimeSftRoutePaths];

export const hrSftRoutePaths = {
  hub: "/hr/shift-scheduling",
} as const;

export type HrSftRoutePath =
  (typeof hrSftRoutePaths)[keyof typeof hrSftRoutePaths];

export const shiftSchedulingRouteContracts = [] as const;

export const shiftSchedulingFeatureId =
  "hr-suite.time-attendance.shift-scheduling" as const;
