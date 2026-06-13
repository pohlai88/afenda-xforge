"use client";

import type { ReactElement, ReactNode } from "react";
import { WorkspaceAuditEvidenceProvider } from "./workspace-audit-evidence-context.tsx";
import type { WorkspaceAuditEvidenceScope } from "./workspace-audit-evidence.contract.ts";

export function WorkspaceAuditEvidenceShell({
  children,
  initialScope,
  scopeSync,
}: {
  children: ReactNode;
  initialScope?: WorkspaceAuditEvidenceScope;
  scopeSync?: ReactNode;
}): ReactElement {
  return (
    <WorkspaceAuditEvidenceProvider initialScope={initialScope}>
      {scopeSync}
      {children}
    </WorkspaceAuditEvidenceProvider>
  );
}
