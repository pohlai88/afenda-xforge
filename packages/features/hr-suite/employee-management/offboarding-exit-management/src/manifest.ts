import { offboardingExitManagementRouteContracts } from "./contract.ts";

export type OffboardingExitManagementManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof offboardingExitManagementRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const offboardingExitManagementManifest: OffboardingExitManagementManifest =
  {
    id: "hr-suite.employee-management.offboarding-exit-management",
    title: "Offboarding Exit Management",
    description:
      "Governed package for the legacy HR Suite offboarding-exit-management slice at afenda-erp/packages/features/hr-suite/src/employee-management/offboarding-exit-management.",
    domain: "employee-management",
    packageName:
      "@repo/features-employee-management-offboarding-exit-management",
    routeContracts: offboardingExitManagementRouteContracts,
    suite: "hr-suite",
  };
