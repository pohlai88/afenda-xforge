import { getVnHrDocumentsDefaults } from "@repo/jurisdictions-vn/hr-documents";

import type { DocumentsManagementRetention } from "./contracts/index.ts";

export type DocumentsManagementJurisdictionDefaults = {
  alertWindowDays: number;
  retention: DocumentsManagementRetention;
};

export function resolveDocumentsManagementJurisdictionDefaults(
  jurisdictionCode?: string | null
): DocumentsManagementJurisdictionDefaults | null {
  const normalizedJurisdictionCode = jurisdictionCode?.trim().toUpperCase();

  if (normalizedJurisdictionCode === "VN") {
    const defaults = getVnHrDocumentsDefaults();
    return {
      alertWindowDays: defaults.alertWindowDays,
      retention: {
        action: "archive",
        anonymizeBeforeDeletion: false,
        archiveAfterEmployeeSeparation: true,
        retentionPeriodDays: defaults.retentionPeriodDays,
      },
    };
  }

  return null;
}
