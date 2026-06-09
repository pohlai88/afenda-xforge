import { candidateSelfservicePortalRouteContracts } from "./contract.ts";

export type CandidateSelfservicePortalManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof candidateSelfservicePortalRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const candidateSelfservicePortalManifest: CandidateSelfservicePortalManifest =
  {
    id: "hr-suite.talent-management.candidate-selfservice-portal",
    title: "Candidate Selfservice Portal",
    description:
      "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/candidate-selfservice-portal.",
    domain: "talent-management",
    packageName:
      "@repo/features-talent-management-candidate-selfservice-portal",
    routeContracts: candidateSelfservicePortalRouteContracts,
    suite: "hr-suite",
  };
