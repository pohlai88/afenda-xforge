import type { z } from "zod";
import type {
  offboardingAuditActionSchema,
  offboardingAuditEventRecordSchema,
} from "../schema.ts";
import { offboardingAuditActionValues } from "../schema.ts";

export const offboardingExitManagementAuditActions = {
  case: {
    started: offboardingAuditActionValues[0],
    updated: offboardingAuditActionValues[1],
    completed: offboardingAuditActionValues[2],
    cancelled: offboardingAuditActionValues[3],
  },
  clearance: {
    completed: offboardingAuditActionValues[4],
    waived: offboardingAuditActionValues[5],
  },
  approval: {
    approved: offboardingAuditActionValues[6],
    rejected: offboardingAuditActionValues[7],
  },
  asset: {
    updated: offboardingAuditActionValues[8],
  },
  exitInterview: {
    scheduled: offboardingAuditActionValues[9],
    feedbackRecorded: offboardingAuditActionValues[10],
  },
  rehire: {
    recorded: offboardingAuditActionValues[11],
  },
  vacancy: {
    triggered: offboardingAuditActionValues[12],
  },
  document: {
    linked: offboardingAuditActionValues[13],
  },
  settlement: {
    blockerAdded: offboardingAuditActionValues[14],
    blockerResolved: offboardingAuditActionValues[15],
    ready: offboardingAuditActionValues[16],
  },
} as const;

export const hrWorkforceOffboardingAuditActions =
  offboardingExitManagementAuditActions;

export type OffboardingExitManagementAuditAction = z.infer<
  typeof offboardingAuditActionSchema
>;
export type OffboardingAuditEvent = z.infer<
  typeof offboardingAuditEventRecordSchema
>;
