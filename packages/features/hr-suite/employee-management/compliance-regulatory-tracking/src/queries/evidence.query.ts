import "server-only";

import type {
  ComplianceEvidenceArtifact,
  ListComplianceEvidenceQuery,
} from "../contracts/index.ts";
import { listComplianceEvidenceQuerySchema } from "../contracts/index.ts";
import type { ComplianceReadContext } from "../schema.ts";
import {
  loadComplianceScopedSnapshot,
  maskEvidenceForRead,
  matchesSearch,
  normalizeSearchTerm,
  paginate,
} from "./shared.ts";

export async function listComplianceEvidenceArtifactsRecords(
  query: ListComplianceEvidenceQuery = {},
  context?: ComplianceReadContext
): Promise<readonly ComplianceEvidenceArtifact[]> {
  const parsed = listComplianceEvidenceQuerySchema.parse(query);
  const scoped = await loadComplianceScopedSnapshot(context);
  const term = normalizeSearchTerm(parsed.search);
  const items = maskEvidenceForRead(
    scoped.evidence
      .filter((entry) =>
        parsed.status ? entry.status === parsed.status : true
      )
      .filter((entry) =>
        parsed.sensitivity ? entry.sensitivity === parsed.sensitivity : true
      )
      .filter((entry) =>
        parsed.employeeId ? entry.employeeId === parsed.employeeId : true
      )
      .filter((entry) =>
        matchesSearch(
          [entry.title, entry.evidenceType, entry.sourceDocumentNumber],
          term
        )
      ),
    scoped.ctx.canViewSensitive
  );

  return paginate(items, parsed.page, parsed.pageSize);
}
