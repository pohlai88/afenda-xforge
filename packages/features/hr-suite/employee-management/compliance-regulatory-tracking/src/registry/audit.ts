import type {
  Audit7W1HEventInput,
  Audit7W1HOutcome,
} from "../../../../../../audit/contract.ts";
import type { CreateComplianceAudit7W1HInput } from "../contracts/audit.contract.ts";
import { createComplianceAudit7W1HInputSchema } from "../contracts/audit.contract.ts";

export type {
  ComplianceRegulatoryTrackingAudit,
  ComplianceRegulatoryTrackingAuditEvent,
  CreateComplianceAudit7W1HInput,
} from "../contracts/audit.contract.ts";
export {
  complianceRegulatoryTrackingAudit,
  complianceRegulatoryTrackingAuditEventCatalog,
  complianceRegulatoryTrackingAuditEventGroups,
  complianceRegulatoryTrackingAuditEvents,
  complianceRegulatoryTrackingHighRiskAuditEvents,
} from "../contracts/audit.contract.ts";

export function createComplianceAudit7W1HEventInput(
  input: CreateComplianceAudit7W1HInput
): Audit7W1HEventInput {
  const parsed = createComplianceAudit7W1HInputSchema.parse(input);

  return {
    tenantId: parsed.tenantId,
    companyId: parsed.companyId ?? null,
    actorId: parsed.actorId,
    actorRole: parsed.actorRole,
    module: "hr",
    surface: "compliance-regulatory-tracking",
    route: parsed.route,
    subjectType: parsed.subjectType,
    subjectId: parsed.subjectId,
    action: parsed.action,
    summary: parsed.summary,
    outcome: (parsed.outcome ?? "success") as Audit7W1HOutcome,
    targetType: parsed.targetType,
    targetId: parsed.targetId,
    targetDisplayName: parsed.targetDisplayName,
    reason: parsed.reason,
    policyReference: parsed.policyReference,
    channel: parsed.channel,
    requestId: parsed.requestId,
    operationId: parsed.operationId,
    before: parsed.before,
    after: parsed.after,
    metadata: parsed.metadata ?? null,
  };
}
