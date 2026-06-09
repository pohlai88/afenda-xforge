import { governmentClassificationPayGradesRouteContracts } from "./contract.ts";

export type GovernmentClassificationPayGradesManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof governmentClassificationPayGradesRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const governmentClassificationPayGradesManifest: GovernmentClassificationPayGradesManifest = {
  id: "hr-suite.industry-specific.government-classification-pay-grades",
  title: "Government Classification Pay Grades",
  description:
    "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/industry-specific/government-classification-pay-grades.",
  domain: "industry-specific",
  packageName: "@repo/features-industry-specific-government-classification-pay-grades",
  routeContracts: governmentClassificationPayGradesRouteContracts,
  suite: "hr-suite",
};
