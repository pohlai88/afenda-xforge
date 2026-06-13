"use client";

import { useEffect } from "react";
import { buildWorkspaceAuditEvidenceScopeFromFeature } from "../../../_components/workspace/audit-evidence/workspace-audit-evidence-scope.ts";
import { useWorkspaceAuditEvidence } from "../../../_components/workspace/audit-evidence/workspace-audit-evidence-context.tsx";
import { useThemeStudioHrSuite } from "./theme-studio-hr-suite-context.tsx";

/** Keeps audit evidence sheets scoped to the active Theme Studio HR feature. */
export function ThemeStudioAuditScopeSync(): null {
  const { activeFeature } = useThemeStudioHrSuite();
  const { setScope } = useWorkspaceAuditEvidence();

  useEffect(() => {
    setScope(buildWorkspaceAuditEvidenceScopeFromFeature(activeFeature));
  }, [activeFeature, setScope]);

  return null;
}
