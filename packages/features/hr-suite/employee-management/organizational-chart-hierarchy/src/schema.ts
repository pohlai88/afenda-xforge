import { z } from "zod";

export const hrOrgUnitTypeValues = [
  "business_unit",
  "department",
  "legal_entity",
  "location",
  "sub_department",
  "team",
] as const;

export const hrOrgStatusValues = [
  "active",
  "closed",
  "frozen",
  "planned",
] as const;

export const hrOrgReportingRelationshipTypeValues = [
  "direct",
  "dotted_line",
  "functional",
  "temporary",
] as const;

export const hrOrgRepositoryEntityTypeValues = [
  "organization_unit",
  "position",
  "reporting_relationship",
  "structure_audit_event",
] as const;

export const trimmedStringSchema = z.string().trim().min(1);
export const optionalTrimmedStringSchema = z.string().trim().min(1).nullish();

export const isoDateSchema = z.preprocess((value: unknown) => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return new Date(value);
  }
  return value;
}, z.date());

export const optionalIsoDateSchema = isoDateSchema.nullish();

export const hrOrgUnitTypeSchema = z.enum(hrOrgUnitTypeValues);
export const hrOrgStatusSchema = z.enum(hrOrgStatusValues);
export const hrOrgReportingRelationshipTypeSchema = z.enum(
  hrOrgReportingRelationshipTypeValues
);
export const hrOrgRepositoryEntityTypeSchema = z.enum(
  hrOrgRepositoryEntityTypeValues
);

export const hrOrgScopeSchema = z.object({
  tenantId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
});

export const hrOrgUnitRecordSchema = z.object({
  id: trimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  name: trimmedStringSchema,
  unitType: hrOrgUnitTypeSchema,
  parentUnitId: optionalTrimmedStringSchema,
  managerEmployeeId: optionalTrimmedStringSchema,
  costCenterCode: optionalTrimmedStringSchema,
  locationCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
  status: hrOrgStatusSchema,
  effectiveFrom: isoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const hrOrgPositionRecordSchema = z.object({
  id: trimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  organizationUnitId: trimmedStringSchema,
  managerEmployeeId: optionalTrimmedStringSchema,
  costCenterCode: optionalTrimmedStringSchema,
  locationCode: optionalTrimmedStringSchema,
  status: hrOrgStatusSchema,
  effectiveFrom: isoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const hrOrgReportingRelationshipRecordSchema = z.object({
  id: trimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  managerEmployeeId: trimmedStringSchema,
  relationshipType: hrOrgReportingRelationshipTypeSchema,
  effectiveFrom: isoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  reason: z.string().trim().nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const hrOrgAuditEventSchema = z.object({
  id: trimmedStringSchema,
  tenantId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  actorId: optionalTrimmedStringSchema,
  action: trimmedStringSchema,
  entityType: hrOrgRepositoryEntityTypeSchema,
  entityId: trimmedStringSchema,
  summary: trimmedStringSchema,
  reason: z.string().trim().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: isoDateSchema,
});

export const hrOrgChartNodeSchema = z.object({
  id: trimmedStringSchema,
  code: trimmedStringSchema,
  name: trimmedStringSchema,
  unitType: hrOrgUnitTypeSchema,
  parentUnitId: optionalTrimmedStringSchema,
  managerEmployeeId: optionalTrimmedStringSchema,
  status: hrOrgStatusSchema,
  childCount: z.number().int().nonnegative(),
});

export const hrOrgOverviewSchema = z.object({
  totalUnits: z.number().int().nonnegative(),
  totalPositions: z.number().int().nonnegative(),
  totalReportingLines: z.number().int().nonnegative(),
  totalVacancies: z.number().int().nonnegative(),
  totalHeadcount: z.number().int().nonnegative(),
});

export const hrOrgVacancyRecordSchema = z.object({
  code: trimmedStringSchema,
  effectiveFrom: isoDateSchema,
  effectiveTo: z.preprocess(
    (value: unknown) => (value === undefined ? null : value),
    z.date().nullable()
  ),
  organizationUnitId: trimmedStringSchema,
  positionId: trimmedStringSchema,
  status: hrOrgStatusSchema,
  title: trimmedStringSchema,
});

export const hrOrgHeadcountRecordSchema = z.object({
  activePositionCount: z.number().int().nonnegative(),
  code: trimmedStringSchema,
  name: trimmedStringSchema,
  organizationUnitId: trimmedStringSchema,
  positionCount: z.number().int().nonnegative(),
  vacantPositionCount: z.number().int().nonnegative(),
});

const listQueryBaseSchema = z.object({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(500).optional(),
  search: z.string().trim().optional(),
  tenantId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  locationCode: optionalTrimmedStringSchema,
  legalEntityCode: optionalTrimmedStringSchema,
});

export const hrOrgUnitQuerySchema = listQueryBaseSchema.extend({
  unitType: hrOrgUnitTypeSchema.optional(),
  status: hrOrgStatusSchema.optional(),
});

export const hrOrgPositionQuerySchema = listQueryBaseSchema.extend({
  organizationUnitId: optionalTrimmedStringSchema,
  status: hrOrgStatusSchema.optional(),
});

export const hrOrgReportingRelationshipQuerySchema = listQueryBaseSchema.extend(
  {
    employeeId: optionalTrimmedStringSchema,
    managerEmployeeId: optionalTrimmedStringSchema,
    relationshipType: hrOrgReportingRelationshipTypeSchema.optional(),
  }
);

export const hrOrgVacancyQuerySchema = listQueryBaseSchema.extend({
  organizationUnitId: optionalTrimmedStringSchema,
  positionId: optionalTrimmedStringSchema,
  status: hrOrgStatusSchema.optional(),
});

export const hrOrgHeadcountQuerySchema = listQueryBaseSchema.extend({
  organizationUnitId: optionalTrimmedStringSchema,
});

export const hrOrgAuditQuerySchema = listQueryBaseSchema.extend({
  action: optionalTrimmedStringSchema,
  entityType: hrOrgRepositoryEntityTypeSchema.optional(),
});

export const hrOrgReadContextSchema = z.object({
  tenantId: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  actorId: optionalTrimmedStringSchema,
  canRead: z.boolean().optional(),
  canViewSensitive: z.boolean().optional(),
  grantedCapabilities: z.array(trimmedStringSchema).optional(),
});

export const hrOrgWriteContextSchema = hrOrgReadContextSchema.extend({
  canWrite: z.boolean().optional(),
});

export const hrOrgPolicyDecisionSchema = z.object({
  allowed: z.boolean(),
  reason: trimmedStringSchema,
});

export type HrOrgUnitType = z.infer<typeof hrOrgUnitTypeSchema>;
export type HrOrgStatus = z.infer<typeof hrOrgStatusSchema>;
export type HrOrgReportingRelationshipType = z.infer<
  typeof hrOrgReportingRelationshipTypeSchema
>;
export type HrOrgRepositoryEntityType = z.infer<
  typeof hrOrgRepositoryEntityTypeSchema
>;
export type HrOrgScope = z.infer<typeof hrOrgScopeSchema>;
export type HrOrgUnitRecord = z.infer<typeof hrOrgUnitRecordSchema>;
export type HrOrgPositionRecord = z.infer<typeof hrOrgPositionRecordSchema>;
export type HrOrgReportingRelationshipRecord = z.infer<
  typeof hrOrgReportingRelationshipRecordSchema
>;
export type HrOrgAuditEvent = z.infer<typeof hrOrgAuditEventSchema>;
export type HrOrgChartNodeProjection = z.infer<typeof hrOrgChartNodeSchema>;
export type HrOrgOverviewProjection = z.infer<typeof hrOrgOverviewSchema>;
export type HrOrgVacancyRecord = z.infer<typeof hrOrgVacancyRecordSchema>;
export type HrOrgHeadcountRecord = z.infer<typeof hrOrgHeadcountRecordSchema>;
export type HrOrgUnitQuery = z.infer<typeof hrOrgUnitQuerySchema>;
export type HrOrgPositionQuery = z.infer<typeof hrOrgPositionQuerySchema>;
export type HrOrgReportingRelationshipQuery = z.infer<
  typeof hrOrgReportingRelationshipQuerySchema
>;
export type HrOrgVacancyQuery = z.infer<typeof hrOrgVacancyQuerySchema>;
export type HrOrgHeadcountQuery = z.infer<typeof hrOrgHeadcountQuerySchema>;
export type HrOrgAuditQuery = z.infer<typeof hrOrgAuditQuerySchema>;
export type HrOrgReadContext = z.infer<typeof hrOrgReadContextSchema>;
export type HrOrgWriteContext = z.infer<typeof hrOrgWriteContextSchema>;
