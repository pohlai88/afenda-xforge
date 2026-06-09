import { recruitmentOnboardingRouteContracts } from "./contract.ts";

export type RecruitmentOnboardingManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof recruitmentOnboardingRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const recruitmentOnboardingManifest: RecruitmentOnboardingManifest = {
  id: "hr-suite.talent-management.recruitment-onboarding",
  title: "Recruitment Onboarding",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/recruitment-onboarding.",
  domain: "talent-management",
  packageName: "@repo/features-talent-management-recruitment-onboarding",
  routeContracts: recruitmentOnboardingRouteContracts,
  suite: "hr-suite",
};
