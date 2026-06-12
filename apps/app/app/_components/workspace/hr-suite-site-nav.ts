import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Clock,
  Factory,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Users,
  Wallet,
} from "lucide-react";

export type HrSuiteSiteNavItem = {
  description?: string;
  featureId: string;
  icon: LucideIcon;
  label: string;
  /** Live app route when the feature surface is wired in `apps/app`. */
  liveHref?: string;
};

export type HrSuiteSiteNavGroup = {
  icon: LucideIcon;
  items: readonly HrSuiteSiteNavItem[];
  label: string;
};

export const HR_SUITE_SITE_SCOPE_LABEL = "HR SUITE";

export const HR_SUITE_SITE_NAV_GROUPS: readonly HrSuiteSiteNavGroup[] = [
  {
    label: "Employee management",
    icon: Users,
    items: [
      {
        featureId: "hr-suite.hub",
        label: "HR hub",
        icon: LayoutDashboard,
        liveHref: "/hr",
        description: "Suite entry — documents operator overview",
      },
      {
        featureId: "hr-suite.employee-management.documents-management",
        label: "Documents management",
        icon: FileText,
        liveHref: "/hr/documents",
        description: "Tenant-scoped employee documents, upload, and registry",
      },
      {
        featureId: "hr-suite.employee-management.employee-records-management",
        label: "Employee records management",
        icon: Users,
        description: "Core employee record store and governed mutations",
      },
      {
        featureId: "hr-suite.employee-management.employee-selfservice-portal",
        label: "Employee self-service portal",
        icon: Users,
        description: "Profile, leave, tasks, and employee-facing requests",
      },
      {
        featureId: "hr-suite.employee-management.employee-lifecycle-management",
        label: "Employee lifecycle management",
        icon: Users,
        description: "Stages, transitions, automation, and lifecycle history",
      },
      {
        featureId: "hr-suite.employee-management.organizational-chart-hierarchy",
        label: "Organizational chart hierarchy",
        icon: Users,
        description: "Units, positions, reporting lines, and headcount",
      },
      {
        featureId: "hr-suite.employee-management.compliance-regulatory-tracking",
        label: "Compliance & regulatory tracking",
        icon: FileText,
        description: "Obligations, evidence, deadlines, and audit readiness",
      },
      {
        featureId: "hr-suite.employee-management.offboarding-exit-management",
        label: "Offboarding exit management",
        icon: Users,
        description: "Exit cases, approvals, blockers, and clearance",
      },
    ],
  },
  {
    label: "Talent management",
    icon: GraduationCap,
    items: [
      {
        featureId: "hr-suite.talent-management.recruitment-onboarding",
        label: "Recruitment onboarding",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.performance-appraisals",
        label: "Performance appraisals",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.succession-planning",
        label: "Succession planning",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.training-development",
        label: "Training development",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.candidate-selfservice-portal",
        label: "Candidate self-service portal",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.career-pathing-development-plans",
        label: "Career pathing development plans",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.competency-skills-framework",
        label: "Competency skills framework",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.employee-engagement-surveys",
        label: "Employee engagement surveys",
        icon: GraduationCap,
      },
      {
        featureId: "hr-suite.talent-management.learning-management-system-lms",
        label: "Learning management system",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Payroll & compensation",
    icon: Wallet,
    items: [
      {
        featureId: "hr-suite.payroll-compensation.payroll-processing",
        label: "Payroll processing",
        icon: Wallet,
      },
      {
        featureId: "hr-suite.payroll-compensation.benefits-administration",
        label: "Benefits administration",
        icon: Wallet,
      },
      {
        featureId: "hr-suite.payroll-compensation.expenses-reimbursement",
        label: "Expenses reimbursement",
        icon: Wallet,
      },
      {
        featureId: "hr-suite.payroll-compensation.multi-country-payroll",
        label: "Multi-country payroll",
        icon: Wallet,
      },
      {
        featureId: "hr-suite.payroll-compensation.bonus-incentive-management",
        label: "Bonus incentive management",
        icon: Wallet,
      },
      {
        featureId: "hr-suite.payroll-compensation.compensation-planning-modeling",
        label: "Compensation planning modeling",
        icon: Wallet,
      },
      {
        featureId: "hr-suite.payroll-compensation.salary-benchmarking-survey",
        label: "Salary benchmarking survey",
        icon: Wallet,
      },
    ],
  },
  {
    label: "Time & attendance",
    icon: Clock,
    items: [
      {
        featureId: "hr-suite.time-attendance.leave-attendance-management",
        label: "Leave attendance management",
        icon: Clock,
      },
      {
        featureId: "hr-suite.time-attendance.overtime-management",
        label: "Overtime management",
        icon: Clock,
      },
      {
        featureId: "hr-suite.time-attendance.absence-analytics-trends",
        label: "Absence analytics trends",
        icon: Clock,
      },
      {
        featureId: "hr-suite.time-attendance.flexible-work-arrangement-tracking",
        label: "Flexible work arrangement tracking",
        icon: Clock,
      },
      {
        featureId: "hr-suite.time-attendance.time-clock-integration",
        label: "Time clock integration",
        icon: Clock,
      },
      {
        featureId: "hr-suite.time-attendance.shift-scheduling",
        label: "Shift scheduling",
        icon: Clock,
      },
      {
        featureId: "hr-suite.time-attendance.geolocation-remote-checkin",
        label: "Geolocation remote checkin",
        icon: Clock,
      },
    ],
  },
  {
    label: "Industry specific",
    icon: Factory,
    items: [
      {
        featureId: "hr-suite.industry-specific.union-management",
        label: "Union management",
        icon: Building2,
      },
      {
        featureId:
          "hr-suite.industry-specific.food-handler-certification-health-compliance",
        label: "Food handler certification",
        icon: Factory,
      },
      {
        featureId:
          "hr-suite.industry-specific.field-worker-remote-workforce-management",
        label: "Field worker remote workforce",
        icon: Factory,
      },
      {
        featureId:
          "hr-suite.industry-specific.government-classification-pay-grades",
        label: "Government classification pay grades",
        icon: Factory,
      },
      {
        featureId:
          "hr-suite.industry-specific.retail-seasonal-hourly-workforce-scheduling",
        label: "Retail seasonal hourly scheduling",
        icon: Factory,
      },
      {
        featureId:
          "hr-suite.industry-specific.manufacturing-safety-training-osha-compliance",
        label: "Manufacturing safety training",
        icon: Factory,
      },
    ],
  },
];

export const HR_SUITE_SITE_NAV_ITEMS = HR_SUITE_SITE_NAV_GROUPS.flatMap(
  (group) => group.items
);

export const HR_SUITE_DEFAULT_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

export function resolveHrSuiteSiteNavItem(
  featureId: string
): HrSuiteSiteNavItem | undefined {
  return HR_SUITE_SITE_NAV_ITEMS.find((item) => item.featureId === featureId);
}
