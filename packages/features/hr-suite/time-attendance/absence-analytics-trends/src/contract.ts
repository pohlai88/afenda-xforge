export type AbsenceAnalyticsTrendsStatus = "draft" | "active" | "archived";

export type AbsenceAnalyticsTrendsRecord = {
  id: string;
  name: string;
  status: AbsenceAnalyticsTrendsStatus;
};

export type ListAbsenceAnalyticsTrendsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type CreateAbsenceAnalyticsTrendsInput = {
  name: string;
};

export type UpdateAbsenceAnalyticsTrendsInput = {
  id: string;
  name?: string;
  status?: AbsenceAnalyticsTrendsStatus;
};

export const hrTimeAatReadPermission = {
  module: "hr",
  object: "absence_analytics",
  function: "read",
} as const;

export const hrTimeAatExportPermission = {
  module: "hr",
  object: "absence_analytics",
  function: "export",
} as const;

export const hrAatRoutePaths = {
  hub: "/hr/absence-analytics-trends",
} as const;

export type HrAatRoutePath =
  (typeof hrAatRoutePaths)[keyof typeof hrAatRoutePaths];

export const hrTimeAatAuditActions = {
  analytics: {
    generated: "hr.aat.analytics.generated",
    snapshotPersisted: "hr.aat.analytics.snapshot.persisted",
  },
  threshold: {
    updated: "hr.aat.threshold.updated",
  },
  report: {
    generated: "hr.aat.report.generated",
    exported: "hr.aat.report.exported",
  },
  risk: {
    reviewed: "hr.aat.risk.reviewed",
  },
  correctiveAction: {
    linked: "hr.aat.corrective_action.linked",
  },
  notification: {
    enqueued: "hr.aat.notification.enqueued",
  },
} as const;

export const HR_TIME_AAT_AUDIT_MODULE_KEY = "hr.aat" as const;

export type HrTimeAatAuditAction =
  | (typeof hrTimeAatAuditActions)["analytics"][keyof (typeof hrTimeAatAuditActions)["analytics"]]
  | (typeof hrTimeAatAuditActions)["threshold"][keyof (typeof hrTimeAatAuditActions)["threshold"]]
  | (typeof hrTimeAatAuditActions)["report"][keyof (typeof hrTimeAatAuditActions)["report"]]
  | (typeof hrTimeAatAuditActions)["risk"][keyof (typeof hrTimeAatAuditActions)["risk"]]
  | (typeof hrTimeAatAuditActions)["correctiveAction"][keyof (typeof hrTimeAatAuditActions)["correctiveAction"]]
  | (typeof hrTimeAatAuditActions)["notification"][keyof (typeof hrTimeAatAuditActions)["notification"]];

export const absenceAnalyticsTrendsRouteContracts = [] as const;

export const absenceAnalyticsTrendsFeatureId =
  "hr-suite.time-attendance.absence-analytics-trends" as const;
