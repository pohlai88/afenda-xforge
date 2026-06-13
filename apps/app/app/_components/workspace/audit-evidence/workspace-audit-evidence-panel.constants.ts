export const AUDIT_EVIDENCE_BOTTOM_OPEN_STORAGE_KEY =
  "workspace_audit_evidence_bottom_open";

export const AUDIT_EVIDENCE_RIGHT_OPEN_STORAGE_KEY =
  "workspace_audit_evidence_right_open";

export const AUDIT_EVIDENCE_RIGHT_PANEL_ID = "workspace-audit-right";
export const AUDIT_EVIDENCE_BOTTOM_PANEL_ID = "workspace-audit-bottom";

export const AUDIT_EVIDENCE_RIGHT_DEFAULT_SIZE = 28;
export const AUDIT_EVIDENCE_BOTTOM_DEFAULT_SIZE = 28;

export function readAuditEvidencePanelOpen(storageKey: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(storageKey) === "1";
}

export function persistAuditEvidencePanelOpen(
  storageKey: string,
  open: boolean
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, open ? "1" : "0");
}
