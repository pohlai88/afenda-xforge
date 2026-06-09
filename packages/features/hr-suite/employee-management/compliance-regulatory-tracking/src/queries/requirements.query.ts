import "server-only";

import type {
  ComplianceRequirement,
  ListComplianceRequirementsQuery,
} from "../contracts/index.ts";
import { listComplianceRequirementsQuerySchema } from "../contracts/index.ts";
import {
  buildComplianceReadModels,
  projectComplianceRequirements,
} from "../projector.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

const loadProjectedRequirements = async (
  context?: ComplianceReadContext
): Promise<ComplianceRequirement[]> => {
  const scoped = await loadComplianceScopedSnapshot(context);
  const { requirements } = buildComplianceReadModels({
    obligations: scoped.obligations,
    workerProfiles: scoped.workerProfiles,
    evidence: scoped.evidence,
    exceptions: scoped.exceptions,
    correctiveActions: scoped.correctiveActions,
  });

  return projectComplianceRequirements(requirements);
};

export async function listComplianceRequirementsRecords(
  query: ListComplianceRequirementsQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceRequirement[]> {
  const parsed = listComplianceRequirementsQuerySchema.parse(query);
  const requirements = await loadProjectedRequirements(context);
  const term = normalizeSearchTerm(parsed.search);

  return paginate(
    requirements
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.riskLevel ? entry.riskLevel === parsed.riskLevel : true
      )
      .filter((entry) =>
        parsed.employeeId ? entry.employeeId === parsed.employeeId : true
      )
      .filter((entry) =>
        parsed.countryCode ? entry.countryCode === parsed.countryCode : true
      )
      .filter((entry) =>
        parsed.legalEntityCode
          ? entry.legalEntityCode === parsed.legalEntityCode
          : true
      )
      .filter((entry) =>
        parsed.workLocationCode
          ? entry.workLocationCode === parsed.workLocationCode
          : true
      )
      .filter((entry) =>
        parsed.departmentId ? entry.departmentId === parsed.departmentId : true
      )
      .filter((entry) =>
        matchesSearch(
          [
            entry.obligationCode,
            entry.obligationTitle,
            entry.statusReason ?? "",
          ],
          term
        )
      ),
    parsed.page,
    parsed.pageSize
  );
}

export async function getComplianceRequirementById(
  id: string,
  context?: ComplianceReadContext
): Promise<ComplianceRequirement | null> {
  return (
    (await loadProjectedRequirements(context)).find(
      (entry) => entry.id === id
    ) ?? null
  );
}
