import type { WorkspaceAuditEvidenceScope } from "./workspace-audit-evidence.contract.ts";

const SCOPE_QUERY_KEYS = [
  "module",
  "route",
  "surface",
  "subjectId",
  "subjectType",
  "targetId",
  "targetType",
] as const satisfies readonly (keyof WorkspaceAuditEvidenceScope)[];

export function buildWorkspaceAuditEvidenceQuery(
  scope: WorkspaceAuditEvidenceScope,
  options: { limit?: number; offset?: number } = {}
): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of SCOPE_QUERY_KEYS) {
    const value = scope[key];
    if (value) {
      params.set(key, value);
    }
  }

  params.set("limit", String(options.limit ?? 20));
  params.set("offset", String(options.offset ?? 0));

  return params;
}
