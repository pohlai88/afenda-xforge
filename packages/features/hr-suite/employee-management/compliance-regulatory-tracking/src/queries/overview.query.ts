import "server-only";

import type { ComplianceOverview } from "../contracts/index.ts";
import {
  buildComplianceOverview,
  buildComplianceReadModels,
  projectComplianceAlerts,
  projectComplianceOverview,
  projectComplianceRequirements,
} from "../projector.ts";
import type { ComplianceReadContext } from "../schema.ts";
import { loadComplianceScopedSnapshot } from "./shared.ts";

export async function getComplianceOverviewSnapshot(
  context?: ComplianceReadContext
): Promise<ComplianceOverview> {
  const scoped = await loadComplianceScopedSnapshot(context);
  const { requirements, alerts } = buildComplianceReadModels({
    obligations: scoped.obligations,
    workerProfiles: scoped.workerProfiles,
    evidence: scoped.evidence,
    exceptions: scoped.exceptions,
    correctiveActions: scoped.correctiveActions,
  });

  return projectComplianceOverview(
    buildComplianceOverview({
      obligations: scoped.obligations,
      workerProfiles: scoped.workerProfiles,
      requirements: projectComplianceRequirements(requirements),
      alerts: projectComplianceAlerts(alerts),
      exceptions: scoped.exceptions,
    })
  );
}
