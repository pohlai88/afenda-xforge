import { z } from "zod";
import {
  audit7w1hChannelSchema,
  audit7w1hOutcomeSchema,
  audit7w1hRecordMapSchema,
} from "../../../../../../audit/contract.ts";

export const complianceRegulatoryTrackingAuditEvents = {
  obligationCreated: "compliance.obligation.created",
  obligationUpdated: "compliance.obligation.updated",
  workerProfileCreated: "compliance.worker-profile.created",
  workerProfileUpdated: "compliance.worker-profile.updated",
  requirementProjected: "compliance.requirement.projected",
  requirementStatusChanged: "compliance.requirement.status.changed",
  evidenceRecorded: "compliance.evidence.recorded",
  evidenceUpdated: "compliance.evidence.updated",
  evidenceVerified: "compliance.evidence.verified",
  evidenceExpired: "compliance.evidence.expired",
  alertOpened: "compliance.alert.opened",
  alertAcknowledged: "compliance.alert.acknowledged",
  alertClosed: "compliance.alert.closed",
  exceptionOpened: "compliance.exception.opened",
  exceptionWaiverApproved: "compliance.exception.waiver.approved",
  exceptionResolved: "compliance.exception.resolved",
  correctiveActionCreated: "compliance.corrective-action.created",
  correctiveActionUpdated: "compliance.corrective-action.updated",
  correctiveActionCompleted: "compliance.corrective-action.completed",
  calendarItemRecorded: "compliance.calendar-item.recorded",
  filingRecorded: "compliance.filing.recorded",
  filingSubmitted: "compliance.filing.submitted",
  reportExported: "compliance.report.exported",
} as const;

const complianceRegulatoryTrackingAuditEventValues = Object.values(
  complianceRegulatoryTrackingAuditEvents
) as [
  ComplianceRegulatoryTrackingAuditEvent,
  ...ComplianceRegulatoryTrackingAuditEvent[],
];

export const complianceRegulatoryTrackingAuditEventSchema = z.enum(
  complianceRegulatoryTrackingAuditEventValues
);

export type ComplianceRegulatoryTrackingAuditEvent =
  (typeof complianceRegulatoryTrackingAuditEvents)[keyof typeof complianceRegulatoryTrackingAuditEvents];

export const complianceRegulatoryTrackingAuditEventCatalog = Object.values(
  complianceRegulatoryTrackingAuditEvents
) as readonly ComplianceRegulatoryTrackingAuditEvent[];

export const complianceRegulatoryTrackingAuditEventGroups = [
  {
    id: "obligations",
    label: "Obligations",
    events: [
      complianceRegulatoryTrackingAuditEvents.obligationCreated,
      complianceRegulatoryTrackingAuditEvents.obligationUpdated,
    ],
  },
  {
    id: "requirements",
    label: "Requirements",
    events: [
      complianceRegulatoryTrackingAuditEvents.workerProfileCreated,
      complianceRegulatoryTrackingAuditEvents.workerProfileUpdated,
      complianceRegulatoryTrackingAuditEvents.requirementProjected,
      complianceRegulatoryTrackingAuditEvents.requirementStatusChanged,
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    events: [
      complianceRegulatoryTrackingAuditEvents.evidenceRecorded,
      complianceRegulatoryTrackingAuditEvents.evidenceUpdated,
      complianceRegulatoryTrackingAuditEvents.evidenceVerified,
      complianceRegulatoryTrackingAuditEvents.evidenceExpired,
    ],
  },
  {
    id: "alerts",
    label: "Alerts",
    events: [
      complianceRegulatoryTrackingAuditEvents.alertOpened,
      complianceRegulatoryTrackingAuditEvents.alertAcknowledged,
      complianceRegulatoryTrackingAuditEvents.alertClosed,
    ],
  },
  {
    id: "exceptions",
    label: "Exceptions",
    events: [
      complianceRegulatoryTrackingAuditEvents.exceptionOpened,
      complianceRegulatoryTrackingAuditEvents.exceptionWaiverApproved,
      complianceRegulatoryTrackingAuditEvents.exceptionResolved,
    ],
  },
  {
    id: "corrective-actions",
    label: "Corrective Actions",
    events: [
      complianceRegulatoryTrackingAuditEvents.correctiveActionCreated,
      complianceRegulatoryTrackingAuditEvents.correctiveActionUpdated,
      complianceRegulatoryTrackingAuditEvents.correctiveActionCompleted,
    ],
  },
  {
    id: "calendar",
    label: "Regulatory Calendar",
    events: [complianceRegulatoryTrackingAuditEvents.calendarItemRecorded],
  },
  {
    id: "filings",
    label: "Filings",
    events: [
      complianceRegulatoryTrackingAuditEvents.filingRecorded,
      complianceRegulatoryTrackingAuditEvents.filingSubmitted,
    ],
  },
  {
    id: "reports",
    label: "Reports",
    events: [complianceRegulatoryTrackingAuditEvents.reportExported],
  },
] as const;

export const complianceRegulatoryTrackingHighRiskAuditEvents = [
  complianceRegulatoryTrackingAuditEvents.evidenceVerified,
  complianceRegulatoryTrackingAuditEvents.exceptionWaiverApproved,
  complianceRegulatoryTrackingAuditEvents.correctiveActionCompleted,
  complianceRegulatoryTrackingAuditEvents.reportExported,
] as const;

export const complianceRegulatoryTrackingAudit = {
  events: complianceRegulatoryTrackingAuditEventCatalog,
  eventGroups: complianceRegulatoryTrackingAuditEventGroups,
  highRiskEvents: complianceRegulatoryTrackingHighRiskAuditEvents,
} as const;

export type ComplianceRegulatoryTrackingAudit =
  typeof complianceRegulatoryTrackingAudit;

export const createComplianceAudit7W1HInputSchema = z.object({
  action: complianceRegulatoryTrackingAuditEventSchema,
  actorId: z.string().trim().min(1),
  companyId: z.string().trim().min(1).nullable().optional(),
  targetId: z.string().trim().min(1),
  targetType: z.string().trim().min(1),
  tenantId: z.string().trim().min(1),
  actorRole: z.string().trim().min(1).optional(),
  after: audit7w1hRecordMapSchema.optional(),
  before: audit7w1hRecordMapSchema.optional(),
  channel: audit7w1hChannelSchema.optional(),
  metadata: audit7w1hRecordMapSchema.nullable().optional(),
  operationId: z.string().trim().min(1).optional(),
  outcome: audit7w1hOutcomeSchema.optional(),
  policyReference: z.string().trim().min(1).optional(),
  reason: z.string().trim().min(1).optional(),
  requestId: z.string().trim().min(1).optional(),
  route: z.string().trim().min(1).optional(),
  subjectId: z.string().trim().min(1).optional(),
  subjectType: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(1).optional(),
  targetDisplayName: z.string().trim().min(1).optional(),
});

export type CreateComplianceAudit7W1HInput = z.infer<
  typeof createComplianceAudit7W1HInputSchema
>;
