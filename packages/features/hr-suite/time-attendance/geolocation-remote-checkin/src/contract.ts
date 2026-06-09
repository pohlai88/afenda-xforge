export type GeolocationRemoteCheckinStatus = "draft" | "active" | "archived";

export type GeolocationRemoteCheckinRecord = {
  id: string;
  name: string;
  status: GeolocationRemoteCheckinStatus;
};

export type ListGeolocationRemoteCheckinQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateGeolocationRemoteCheckinInput = {
  name: string;
};

export type UpdateGeolocationRemoteCheckinInput = {
  id: string;
  name?: string;
  status?: GeolocationRemoteCheckinStatus;
};

export const GEO_AUDIT_KEYS = {
  checkinCaptured: "erp.hrm.geo.checkin.captured",
  locationValidated: "erp.hrm.geo.location.validated",
  deviceValidated: "erp.hrm.geo.device.validated",
  exceptionSubmitted: "erp.hrm.geo.exception.submitted",
  exceptionDecided: "erp.hrm.geo.exception.decided",
  outcomeCorrected: "erp.hrm.geo.outcome.corrected",
  lamPublished: "erp.hrm.geo.lam.published",
  payrollPublished: "erp.hrm.geo.payroll.published",
  policyUpdated: "erp.hrm.geo.policy.updated",
  geofenceUpdated: "erp.hrm.geo.geofence.updated",
  deviceRegistered: "erp.hrm.geo.device.registered",
} as const;

export const hrTimeGeoReadPermission = {
  module: "hr",
  object: "geo",
  function: "read",
} as const;

export const hrTimeGeoWritePermission = {
  module: "hr",
  object: "geo",
  function: "update",
} as const;

export const hrTimeGeoLocationDetailReadPermission = {
  module: "hr",
  object: "geo.location",
  function: "read",
} as const;

export const geolocationRemoteCheckinRoutePaths = {
  hub: "/hr/geolocation-remote-checkin",
} as const;

export type GeolocationRemoteCheckinRoutePath =
  (typeof geolocationRemoteCheckinRoutePaths)[keyof typeof geolocationRemoteCheckinRoutePaths];

export const geolocationRemoteCheckinRouteContracts = [
  geolocationRemoteCheckinRoutePaths,
] as const;

export const geolocationRemoteCheckinFeatureId =
  "hr-suite.time-attendance.geolocation-remote-checkin" as const;
