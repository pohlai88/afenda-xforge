import { manufacturingSafetyTrainingOshaComplianceRouteContracts } from "./contract.ts";

export type ManufacturingSafetyTrainingOshaComplianceManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof manufacturingSafetyTrainingOshaComplianceRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const manufacturingSafetyTrainingOshaComplianceManifest: ManufacturingSafetyTrainingOshaComplianceManifest =
  {
    id: "hr-suite.industry-specific.manufacturing-safety-training-osha-compliance",
    title: "Manufacturing Safety Training Osha Compliance",
    description:
      "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/industry-specific/manufacturing-safety-training-osha-compliance.",
    domain: "industry-specific",
    packageName:
      "@repo/features-industry-specific-manufacturing-safety-training-osha-compliance",
    routeContracts: manufacturingSafetyTrainingOshaComplianceRouteContracts,
    suite: "hr-suite",
  };
