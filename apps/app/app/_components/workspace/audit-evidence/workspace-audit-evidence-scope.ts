import type { HrSuiteSiteNavItem } from "../hr-suite-site-nav.ts";
import { resolveHrSuiteFeatureFromPathname } from "../hr-suite-site-nav.ts";
import type { WorkspaceAuditEvidenceScope } from "./workspace-audit-evidence.contract.ts";

export function buildWorkspaceAuditEvidenceScopeFromFeature(
  feature: Pick<HrSuiteSiteNavItem, "featureId" | "liveHref">
): WorkspaceAuditEvidenceScope {
  return {
    module: feature.featureId,
    route: feature.liveHref,
    surface: "site-content",
  };
}

export function buildWorkspaceAuditEvidenceScopeFromPathname(
  pathname: string
): WorkspaceAuditEvidenceScope {
  const resolved = resolveHrSuiteFeatureFromPathname(pathname);

  if (resolved) {
    return buildWorkspaceAuditEvidenceScopeFromFeature(resolved.feature);
  }

  return {
    route: pathname,
    surface: "site-content",
  };
}
