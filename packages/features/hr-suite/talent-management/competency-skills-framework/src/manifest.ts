import { competencySkillsFrameworkRouteContracts } from "./contract.ts";

export type CompetencySkillsFrameworkManifest = {
  description: string;
  domain: string;
  id: string;
  packageName: string;
  routeContracts: typeof competencySkillsFrameworkRouteContracts;
  suite: "hr-suite";
  title: string;
};

export const competencySkillsFrameworkManifest: CompetencySkillsFrameworkManifest =
  {
    id: "hr-suite.talent-management.competency-skills-framework",
    title: "Competency Skills Framework",
    description:
      "Adoption scaffold for the legacy HR Suite slice at afenda-erp/packages/features/hr-suite/src/talent-management/competency-skills-framework.",
    domain: "talent-management",
    packageName: "@repo/features-talent-management-competency-skills-framework",
    routeContracts: competencySkillsFrameworkRouteContracts,
    suite: "hr-suite",
  };
