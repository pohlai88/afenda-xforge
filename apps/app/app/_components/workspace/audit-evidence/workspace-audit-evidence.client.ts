import type {
  WorkspaceAuditEvidenceListResult,
  WorkspaceAuditEvidenceScope,
} from "./workspace-audit-evidence.contract.ts";
import { buildWorkspaceAuditEvidenceQuery } from "./workspace-audit-evidence.query.ts";

type AuditApiEnvelope = {
  data?: WorkspaceAuditEvidenceListResult;
  error?: { message?: string };
};

export async function fetchWorkspaceAuditEvidence(
  scope: WorkspaceAuditEvidenceScope,
  options: { limit?: number; offset?: number; signal?: AbortSignal } = {}
): Promise<WorkspaceAuditEvidenceListResult> {
  const params = buildWorkspaceAuditEvidenceQuery(scope, options);
  const response = await fetch(`/api/audit?${params.toString()}`, {
    credentials: "same-origin",
    signal: options.signal,
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("You do not have permission to view audit evidence.");
    }

    throw new Error(`Unable to load audit evidence (${response.status}).`);
  }

  const payload = (await response.json()) as AuditApiEnvelope;

  if (!payload.data) {
    throw new Error(payload.error?.message ?? "Audit response was empty.");
  }

  return payload.data;
}
