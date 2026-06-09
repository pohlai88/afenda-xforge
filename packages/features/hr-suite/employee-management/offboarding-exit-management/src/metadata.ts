export type OffboardingExitManagementMetadata = {
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

export const offboardingExitManagementMetadata: OffboardingExitManagementMetadata =
  {
    id: "hr-suite.employee-management.offboarding-exit-management",
    title: "Offboarding Exit Management",
    description:
      "Governed metadata for the employee-management offboarding-exit-management feature extracted from the legacy HR suite.",
    domain: "employee-management",
    labels: {
      singular: "Offboarding Exit Management record",
      plural: "Offboarding Exit Management records",
    },
    source: "legacy-hr-suite",
    suite: "hr-suite",
  };
