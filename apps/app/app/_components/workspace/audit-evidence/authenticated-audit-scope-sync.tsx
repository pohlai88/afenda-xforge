"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect } from "react";
import { useWorkspaceAuditEvidence } from "./workspace-audit-evidence-context.tsx";
import { buildWorkspaceAuditEvidenceScopeFromPathname } from "./workspace-audit-evidence-scope.ts";

/** Keeps audit evidence sheets scoped to the active authenticated route. */
export function AuthenticatedAuditScopeSync(): null {
  const pathname = usePathname();
  const { setScope } = useWorkspaceAuditEvidence();

  useEffect(() => {
    setScope(buildWorkspaceAuditEvidenceScopeFromPathname(pathname));
  }, [pathname, setScope]);

  return null;
}
