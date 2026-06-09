import { foodHandlerCertificationHealthComplianceRouteContracts } from "./contract.ts";

export type FoodHandlerCertificationHealthComplianceManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof foodHandlerCertificationHealthComplianceRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const foodHandlerCertificationHealthComplianceManifest: FoodHandlerCertificationHealthComplianceManifest = {
  id: "hr-suite.industry-specific.food-handler-certification-health-compliance",
  title: "Food Handler Certification Health Compliance",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/industry-specific/food-handler-certification-health-compliance.",
  domain: "industry-specific",
  packageName: "@repo/features-industry-specific-food-handler-certification-health-compliance",
  routeContracts: foodHandlerCertificationHealthComplianceRouteContracts,
  suite: "hr-suite",
};
