export { offboardingExitManagementFeatureScope } from "../feature-scope.ts";

import {
  approveOffboardingApprovalStep,
  escalateOffboardingApprovalStep,
  openOffboardingCase,
  recordOffboardingAuditEvent,
  rejectOffboardingApprovalStep,
  reopenOffboardingApprovalStep,
  submitOffboardingApprovalStep,
  updateOffboardingCase,
  upsertOffboardingApprovalStep,
} from "../actions.ts";
import {
  getOffboardingApprovalById,
  getOffboardingCaseById,
  getOffboardingFoundationSnapshot,
  listOffboardingApprovalBlockers,
  listOffboardingApprovalRecords,
  listOffboardingAuditTrailRecords,
  listOffboardingCaseRecords,
} from "../queries.ts";

export type OffboardingExitManagementExecutionSurface = {
  approveApprovalStep: typeof approveOffboardingApprovalStep;
  escalateApprovalStep: typeof escalateOffboardingApprovalStep;
  getApprovalById: typeof getOffboardingApprovalById;
  getCaseById: typeof getOffboardingCaseById;
  getFoundationSnapshot: typeof getOffboardingFoundationSnapshot;
  listApprovalBlockers: typeof listOffboardingApprovalBlockers;
  listApprovals: typeof listOffboardingApprovalRecords;
  listAuditTrail: typeof listOffboardingAuditTrailRecords;
  listCases: typeof listOffboardingCaseRecords;
  openCase: typeof openOffboardingCase;
  reopenApprovalStep: typeof reopenOffboardingApprovalStep;
  recordAuditEvent: typeof recordOffboardingAuditEvent;
  rejectApprovalStep: typeof rejectOffboardingApprovalStep;
  submitApprovalStep: typeof submitOffboardingApprovalStep;
  updateCase: typeof updateOffboardingCase;
  upsertApprovalStep: typeof upsertOffboardingApprovalStep;
};

export const offboardingExitManagementExecutionSurface: OffboardingExitManagementExecutionSurface =
  {
    approveApprovalStep: approveOffboardingApprovalStep,
    escalateApprovalStep: escalateOffboardingApprovalStep,
    getApprovalById: getOffboardingApprovalById,
    getCaseById: getOffboardingCaseById,
    getFoundationSnapshot: getOffboardingFoundationSnapshot,
    listApprovalBlockers: listOffboardingApprovalBlockers,
    listApprovals: listOffboardingApprovalRecords,
    listAuditTrail: listOffboardingAuditTrailRecords,
    listCases: listOffboardingCaseRecords,
    openCase: openOffboardingCase,
    reopenApprovalStep: reopenOffboardingApprovalStep,
    recordAuditEvent: recordOffboardingAuditEvent,
    rejectApprovalStep: rejectOffboardingApprovalStep,
    submitApprovalStep: submitOffboardingApprovalStep,
    updateCase: updateOffboardingCase,
    upsertApprovalStep: upsertOffboardingApprovalStep,
  };
