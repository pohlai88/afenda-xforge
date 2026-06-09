import {
  hrOrgAuditEventSchema,
  hrOrgChartNodeSchema,
  hrOrgOverviewSchema,
  hrOrgPositionRecordSchema,
  hrOrgReportingRelationshipRecordSchema,
  hrOrgUnitRecordSchema,
} from "../schema.ts";

export const hrOrgChartNodeProjectionSchema: typeof hrOrgChartNodeSchema =
  hrOrgChartNodeSchema;
export const hrOrgOverviewProjectionSchema: typeof hrOrgOverviewSchema =
  hrOrgOverviewSchema;
export const hrOrgUnitProjectionSchema: typeof hrOrgUnitRecordSchema =
  hrOrgUnitRecordSchema;
export const hrOrgPositionProjectionSchema: typeof hrOrgPositionRecordSchema =
  hrOrgPositionRecordSchema;
export const hrOrgReportingRelationshipProjectionSchema: typeof hrOrgReportingRelationshipRecordSchema =
  hrOrgReportingRelationshipRecordSchema;
export const hrOrgAuditEventProjectionSchema: typeof hrOrgAuditEventSchema =
  hrOrgAuditEventSchema;

export type HrOrgChartNodeProjection = typeof hrOrgChartNodeProjectionSchema;
export type HrOrgOverviewProjection = typeof hrOrgOverviewProjectionSchema;
