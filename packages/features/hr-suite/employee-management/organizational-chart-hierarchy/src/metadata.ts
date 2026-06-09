export type HrOrgFeatureMetadata = {
  description: string;
  domain: string;
  id: string;
  labels: {
    plural: string;
    singular: string;
  };
  source: "legacy-hr-suite";
  suite: "hr-suite";
  title: string;
};

export const hrOrgUiCopy = {
  overview: {
    structureLabel: "Organizational structure",
  },
  orgChart: {
    title: "Organizational chart",
  },
  units: { surfaceHeaderTitle: "Units" },
  positions: { surfaceHeaderTitle: "Positions" },
  reportingLines: { surfaceHeaderTitle: "Reporting lines" },
  vacancies: { surfaceHeaderTitle: "Vacancies" },
  headcount: { surfaceHeaderTitle: "Headcount" },
  auditTrail: { surfaceHeaderTitle: "Audit trail" },
} as const;

export const hrOrgFeatureMetadata: HrOrgFeatureMetadata = {
  id: "hr-suite.employee-management.organizational-chart-hierarchy",
  title: "Organizational Chart Hierarchy",
  description:
    "Governed organizational chart hierarchy package for Xforge, excluding UI components.",
  domain: "employee-management",
  labels: {
    singular: "Organizational Chart Hierarchy record",
    plural: "Organizational Chart Hierarchy records",
  },
  source: "legacy-hr-suite",
  suite: "hr-suite",
};
