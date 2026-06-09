export type FlexibleWorkArrangementTrackingStatus =
  | "draft"
  | "active"
  | "archived";

export type FlexibleWorkArrangementTrackingRecord = {
  id: string;
  name: string;
  status: FlexibleWorkArrangementTrackingStatus;
};

export type ListFlexibleWorkArrangementTrackingQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateFlexibleWorkArrangementTrackingInput = {
  name: string;
};

export type UpdateFlexibleWorkArrangementTrackingInput = {
  id: string;
  name?: string;
  status?: FlexibleWorkArrangementTrackingStatus;
};

export const hrTimeFwaReadPermission = {
  module: "hr",
  object: "fwa",
  function: "read",
} as const;

export const hrTimeFwaWritePermission = {
  module: "hr",
  object: "fwa",
  function: "update",
} as const;

export const hrTimeFwaComplianceReadPermission = {
  module: "hr",
  object: "compliance",
  function: "read",
} as const;

export const hrTimeFwaPayrollReadPermission = {
  module: "hr",
  object: "attendance",
  function: "read",
} as const;

export const hrFwaRoutePaths = {
  hub: "/hr/flexible-work-arrangement",
} as const;

export type HrFwaRoutePath =
  (typeof hrFwaRoutePaths)[keyof typeof hrFwaRoutePaths];

export const flexibleWorkArrangementTrackingRouteContracts = [] as const;

export const flexibleWorkArrangementTrackingFeatureId =
  "hr-suite.time-attendance.flexible-work-arrangement-tracking" as const;
