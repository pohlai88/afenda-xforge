export type HrSuiteFeaturePackage = {
  domain: string;
  feature: string;
  legacySourcePath: string;
  packageName: string;
  packagePath: string;
  title: string;
};

export const hrSuiteFeatureDomains = [
  "employee-management",
  "industry-specific",
  "payroll-compensation",
  "talent-management",
  "time-attendance",
] as const;

export const hrSuiteFeaturePackages: readonly HrSuiteFeaturePackage[] = [
  {
    domain: "employee-management",
    feature: "compliance-regulatory-tracking",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/employee-management/compliance-regulatory-tracking",
    packageName:
      "@repo/features-employee-management-compliance-regulatory-tracking",
    packagePath:
      "packages/features/hr-suite/employee-management/compliance-regulatory-tracking",
    title: "Compliance Regulatory Tracking",
  },
  {
    domain: "employee-management",
    feature: "documents-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/employee-management/documents-management",
    packageName: "@repo/features-employee-management-documents-management",
    packagePath:
      "packages/features/hr-suite/employee-management/documents-management",
    title: "Documents Management",
  },
  {
    domain: "employee-management",
    feature: "employee-lifecycle-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/employee-management/employee-lifecycle-management",
    packageName:
      "@repo/features-employee-management-employee-lifecycle-management",
    packagePath:
      "packages/features/hr-suite/employee-management/employee-lifecycle-management",
    title: "Employee Lifecycle Management",
  },
  {
    domain: "employee-management",
    feature: "employee-records-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/employee-management/employee-records-management",
    packageName:
      "@repo/features-employee-management-employee-records-management",
    packagePath:
      "packages/features/hr-suite/employee-management/employee-records-management",
    title: "Employee Records Management",
  },
  {
    domain: "employee-management",
    feature: "employee-selfservice-portal",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/employee-management/employee-selfservice-portal",
    packageName:
      "@repo/features-employee-management-employee-selfservice-portal",
    packagePath:
      "packages/features/hr-suite/employee-management/employee-selfservice-portal",
    title: "Employee Selfservice Portal",
  },
  {
    domain: "employee-management",
    feature: "offboarding-exit-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/employee-management/offboarding-exit-management",
    packageName:
      "@repo/features-employee-management-offboarding-exit-management",
    packagePath:
      "packages/features/hr-suite/employee-management/offboarding-exit-management",
    title: "Offboarding Exit Management",
  },
  {
    domain: "employee-management",
    feature: "organizational-chart-hierarchy",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/employee-management/organizational-chart-hierarchy",
    packageName:
      "@repo/features-employee-management-organizational-chart-hierarchy",
    packagePath:
      "packages/features/hr-suite/employee-management/organizational-chart-hierarchy",
    title: "Organizational Chart Hierarchy",
  },
  {
    domain: "industry-specific",
    feature: "field-worker-remote-workforce-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/industry-specific/field-worker-remote-workforce-management",
    packageName:
      "@repo/features-industry-specific-field-worker-remote-workforce-management",
    packagePath:
      "packages/features/hr-suite/industry-specific/field-worker-remote-workforce-management",
    title: "Field Worker Remote Workforce Management",
  },
  {
    domain: "industry-specific",
    feature: "food-handler-certification-health-compliance",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/industry-specific/food-handler-certification-health-compliance",
    packageName:
      "@repo/features-industry-specific-food-handler-certification-health-compliance",
    packagePath:
      "packages/features/hr-suite/industry-specific/food-handler-certification-health-compliance",
    title: "Food Handler Certification Health Compliance",
  },
  {
    domain: "industry-specific",
    feature: "government-classification-pay-grades",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/industry-specific/government-classification-pay-grades",
    packageName:
      "@repo/features-industry-specific-government-classification-pay-grades",
    packagePath:
      "packages/features/hr-suite/industry-specific/government-classification-pay-grades",
    title: "Government Classification Pay Grades",
  },
  {
    domain: "industry-specific",
    feature: "manufacturing-safety-training-osha-compliance",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/industry-specific/manufacturing-safety-training-osha-compliance",
    packageName:
      "@repo/features-industry-specific-manufacturing-safety-training-osha-compliance",
    packagePath:
      "packages/features/hr-suite/industry-specific/manufacturing-safety-training-osha-compliance",
    title: "Manufacturing Safety Training Osha Compliance",
  },
  {
    domain: "industry-specific",
    feature: "retail-seasonal-hourly-workforce-scheduling",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/industry-specific/retail-seasonal-hourly-workforce-scheduling",
    packageName:
      "@repo/features-industry-specific-retail-seasonal-hourly-workforce-scheduling",
    packagePath:
      "packages/features/hr-suite/industry-specific/retail-seasonal-hourly-workforce-scheduling",
    title: "Retail Seasonal Hourly Workforce Scheduling",
  },
  {
    domain: "industry-specific",
    feature: "union-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/industry-specific/union-management",
    packageName: "@repo/features-industry-specific-union-management",
    packagePath:
      "packages/features/hr-suite/industry-specific/union-management",
    title: "Union Management",
  },
  {
    domain: "payroll-compensation",
    feature: "benefits-administration",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/payroll-compensation/benefits-administration",
    packageName: "@repo/features-payroll-compensation-benefits-administration",
    packagePath:
      "packages/features/hr-suite/payroll-compensation/benefits-administration",
    title: "Benefits Administration",
  },
  {
    domain: "payroll-compensation",
    feature: "bonus-incentive-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/payroll-compensation/bonus-incentive-management",
    packageName:
      "@repo/features-payroll-compensation-bonus-incentive-management",
    packagePath:
      "packages/features/hr-suite/payroll-compensation/bonus-incentive-management",
    title: "Bonus Incentive Management",
  },
  {
    domain: "payroll-compensation",
    feature: "compensation-planning-modeling",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/payroll-compensation/compensation-planning-modeling",
    packageName:
      "@repo/features-payroll-compensation-compensation-planning-modeling",
    packagePath:
      "packages/features/hr-suite/payroll-compensation/compensation-planning-modeling",
    title: "Compensation Planning Modeling",
  },
  {
    domain: "payroll-compensation",
    feature: "expenses-reimbursement",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/payroll-compensation/expenses-reimbursement",
    packageName: "@repo/features-payroll-compensation-expenses-reimbursement",
    packagePath:
      "packages/features/hr-suite/payroll-compensation/expenses-reimbursement",
    title: "Expenses Reimbursement",
  },
  {
    domain: "payroll-compensation",
    feature: "multi-country-payroll",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/payroll-compensation/multi-country-payroll",
    packageName: "@repo/features-payroll-compensation-multi-country-payroll",
    packagePath:
      "packages/features/hr-suite/payroll-compensation/multi-country-payroll",
    title: "Multi Country Payroll",
  },
  {
    domain: "payroll-compensation",
    feature: "payroll-processing",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/payroll-compensation/payroll-processing",
    packageName: "@repo/features-payroll-compensation-payroll-processing",
    packagePath:
      "packages/features/hr-suite/payroll-compensation/payroll-processing",
    title: "Payroll Processing",
  },
  {
    domain: "payroll-compensation",
    feature: "salary-benchmarking-survey",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/payroll-compensation/salary-benchmarking-survey",
    packageName:
      "@repo/features-payroll-compensation-salary-benchmarking-survey",
    packagePath:
      "packages/features/hr-suite/payroll-compensation/salary-benchmarking-survey",
    title: "Salary Benchmarking Survey",
  },
  {
    domain: "talent-management",
    feature: "candidate-selfservice-portal",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/candidate-selfservice-portal",
    packageName:
      "@repo/features-talent-management-candidate-selfservice-portal",
    packagePath:
      "packages/features/hr-suite/talent-management/candidate-selfservice-portal",
    title: "Candidate Selfservice Portal",
  },
  {
    domain: "talent-management",
    feature: "career-pathing-development-plans",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/career-pathing-development-plans",
    packageName:
      "@repo/features-talent-management-career-pathing-development-plans",
    packagePath:
      "packages/features/hr-suite/talent-management/career-pathing-development-plans",
    title: "Career Pathing Development Plans",
  },
  {
    domain: "talent-management",
    feature: "competency-skills-framework",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/competency-skills-framework",
    packageName: "@repo/features-talent-management-competency-skills-framework",
    packagePath:
      "packages/features/hr-suite/talent-management/competency-skills-framework",
    title: "Competency Skills Framework",
  },
  {
    domain: "talent-management",
    feature: "employee-engagement-surveys",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/employee-engagement-surveys",
    packageName: "@repo/features-talent-management-employee-engagement-surveys",
    packagePath:
      "packages/features/hr-suite/talent-management/employee-engagement-surveys",
    title: "Employee Engagement Surveys",
  },
  {
    domain: "talent-management",
    feature: "learning-management-system-lms",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/learning-management-system-lms",
    packageName:
      "@repo/features-talent-management-learning-management-system-lms",
    packagePath:
      "packages/features/hr-suite/talent-management/learning-management-system-lms",
    title: "Learning Management System Lms",
  },
  {
    domain: "talent-management",
    feature: "performance-appraisals",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/performance-appraisals",
    packageName: "@repo/features-talent-management-performance-appraisals",
    packagePath:
      "packages/features/hr-suite/talent-management/performance-appraisals",
    title: "Performance Appraisals",
  },
  {
    domain: "talent-management",
    feature: "recruitment-onboarding",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/recruitment-onboarding",
    packageName: "@repo/features-talent-management-recruitment-onboarding",
    packagePath:
      "packages/features/hr-suite/talent-management/recruitment-onboarding",
    title: "Recruitment Onboarding",
  },
  {
    domain: "talent-management",
    feature: "succession-planning",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/succession-planning",
    packageName: "@repo/features-talent-management-succession-planning",
    packagePath:
      "packages/features/hr-suite/talent-management/succession-planning",
    title: "Succession Planning",
  },
  {
    domain: "talent-management",
    feature: "training-development",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/talent-management/training-development",
    packageName: "@repo/features-talent-management-training-development",
    packagePath:
      "packages/features/hr-suite/talent-management/training-development",
    title: "Training Development",
  },
  {
    domain: "time-attendance",
    feature: "absence-analytics-trends",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/time-attendance/absence-analytics-trends",
    packageName: "@repo/features-time-attendance-absence-analytics-trends",
    packagePath:
      "packages/features/hr-suite/time-attendance/absence-analytics-trends",
    title: "Absence Analytics Trends",
  },
  {
    domain: "time-attendance",
    feature: "flexible-work-arrangement-tracking",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/time-attendance/flexible-work-arrangement-tracking",
    packageName:
      "@repo/features-time-attendance-flexible-work-arrangement-tracking",
    packagePath:
      "packages/features/hr-suite/time-attendance/flexible-work-arrangement-tracking",
    title: "Flexible Work Arrangement Tracking",
  },
  {
    domain: "time-attendance",
    feature: "geolocation-remote-checkin",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/time-attendance/geolocation-remote-checkin",
    packageName: "@repo/features-time-attendance-geolocation-remote-checkin",
    packagePath:
      "packages/features/hr-suite/time-attendance/geolocation-remote-checkin",
    title: "Geolocation Remote Checkin",
  },
  {
    domain: "time-attendance",
    feature: "leave-attendance-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/time-attendance/leave-attendance-management",
    packageName: "@repo/features-time-attendance-leave-attendance-management",
    packagePath:
      "packages/features/hr-suite/time-attendance/leave-attendance-management",
    title: "Leave Attendance Management",
  },
  {
    domain: "time-attendance",
    feature: "overtime-management",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/time-attendance/overtime-management",
    packageName: "@repo/features-time-attendance-overtime-management",
    packagePath:
      "packages/features/hr-suite/time-attendance/overtime-management",
    title: "Overtime Management",
  },
  {
    domain: "time-attendance",
    feature: "shift-scheduling",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/time-attendance/shift-scheduling",
    packageName: "@repo/features-time-attendance-shift-scheduling",
    packagePath: "packages/features/hr-suite/time-attendance/shift-scheduling",
    title: "Shift Scheduling",
  },
  {
    domain: "time-attendance",
    feature: "time-clock-integration",
    legacySourcePath:
      "afenda-erp/packages/features/hr-suite/src/time-attendance/time-clock-integration",
    packageName: "@repo/features-time-attendance-time-clock-integration",
    packagePath:
      "packages/features/hr-suite/time-attendance/time-clock-integration",
    title: "Time Clock Integration",
  },
] as const satisfies readonly HrSuiteFeaturePackage[];

export function listHrSuiteFeaturePackagesByDomain(
  domain: string
): readonly HrSuiteFeaturePackage[] {
  return hrSuiteFeaturePackages.filter((entry) => entry.domain === domain);
}
