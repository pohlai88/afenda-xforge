export const complianceRegulatoryTrackingDashboardMetrics = {
  compliantRequirements: "compliant_requirements",
  pendingRequirements: "pending_requirements",
  atRiskRequirements: "at_risk_requirements",
  overdueRequirements: "overdue_requirements",
  expiredRequirements: "expired_requirements",
  openExceptions: "open_exceptions",
  waivedExceptions: "waived_exceptions",
  unresolvedExceptions: "unresolved_exceptions",
  openAlerts: "open_alerts",
  acknowledgedAlerts: "acknowledged_alerts",
  overdueCorrectiveActions: "overdue_corrective_actions",
  completedCorrectiveActions: "completed_corrective_actions",
  upcomingRenewals: "upcoming_renewals",
  overdueFilings: "overdue_filings",
  expiringWorkPermits: "expiring_work_permits",
  expiringVisas: "expiring_visas",
  expiredEvidence: "expired_evidence",
} as const;

export type ComplianceRegulatoryTrackingDashboardMetric =
  (typeof complianceRegulatoryTrackingDashboardMetrics)[keyof typeof complianceRegulatoryTrackingDashboardMetrics];

export const complianceRegulatoryTrackingDashboards = [
  {
    id: "compliance-risk-overview",
    label: "Compliance Risk Overview",
    description:
      "Summarizes requirement status, exceptions, corrective actions, and evidence risk.",
    metrics: [
      complianceRegulatoryTrackingDashboardMetrics.compliantRequirements,
      complianceRegulatoryTrackingDashboardMetrics.pendingRequirements,
      complianceRegulatoryTrackingDashboardMetrics.atRiskRequirements,
      complianceRegulatoryTrackingDashboardMetrics.overdueRequirements,
      complianceRegulatoryTrackingDashboardMetrics.expiredRequirements,
      complianceRegulatoryTrackingDashboardMetrics.openExceptions,
      complianceRegulatoryTrackingDashboardMetrics.overdueCorrectiveActions,
      complianceRegulatoryTrackingDashboardMetrics.expiredEvidence,
    ],
  },
  {
    id: "regulatory-deadline-watch",
    label: "Regulatory Deadline Watch",
    description:
      "Tracks renewals, filings, work eligibility expiries, and overdue compliance deadlines.",
    metrics: [
      complianceRegulatoryTrackingDashboardMetrics.upcomingRenewals,
      complianceRegulatoryTrackingDashboardMetrics.overdueFilings,
      complianceRegulatoryTrackingDashboardMetrics.expiringWorkPermits,
      complianceRegulatoryTrackingDashboardMetrics.expiringVisas,
      complianceRegulatoryTrackingDashboardMetrics.openAlerts,
    ],
  },
  {
    id: "exception-resolution-monitor",
    label: "Exception Resolution Monitor",
    description:
      "Monitors open, waived, unresolved, and corrected compliance exceptions.",
    metrics: [
      complianceRegulatoryTrackingDashboardMetrics.openExceptions,
      complianceRegulatoryTrackingDashboardMetrics.waivedExceptions,
      complianceRegulatoryTrackingDashboardMetrics.unresolvedExceptions,
      complianceRegulatoryTrackingDashboardMetrics.completedCorrectiveActions,
      complianceRegulatoryTrackingDashboardMetrics.overdueCorrectiveActions,
    ],
  },
] as const;

export type ComplianceRegulatoryTrackingDashboard =
  (typeof complianceRegulatoryTrackingDashboards)[number];
