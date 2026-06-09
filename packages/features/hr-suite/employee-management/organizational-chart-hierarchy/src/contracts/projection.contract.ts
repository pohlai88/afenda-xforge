import { z } from "zod";
import {
  hrOrgAuditEventSchema,
  hrOrgHeadcountRecordSchema,
  hrOrgOverviewSchema,
  hrOrgPositionRecordSchema,
  hrOrgReportingRelationshipRecordSchema,
  hrOrgStatusSchema,
  hrOrgUnitRecordSchema,
  hrOrgUnitTypeSchema,
  hrOrgVacancyRecordSchema,
  trimmedStringSchema,
} from "../schema.ts";

export const hrOrgChartNodeProjectionSchema = z
  .object({
    id: trimmedStringSchema,
    code: trimmedStringSchema,
    name: trimmedStringSchema,
    unitType: hrOrgUnitTypeSchema,
    parentUnitId: z.string().trim().nullable(),
    managerEmployeeId: z.string().trim().nullable(),
    status: hrOrgStatusSchema,
    childCount: z.number().int().nonnegative(),
  })
  .strict();
export const hrOrgOverviewProjectionSchema = hrOrgOverviewSchema.strict();
export const hrOrgUnitProjectionSchema = hrOrgUnitRecordSchema
  .omit({
    companyId: true,
    createdAt: true,
    tenantId: true,
    updatedAt: true,
  })
  .strict();
export const hrOrgPositionProjectionSchema = hrOrgPositionRecordSchema
  .omit({
    companyId: true,
    createdAt: true,
    tenantId: true,
    updatedAt: true,
  })
  .strict();
export const hrOrgReportingRelationshipProjectionSchema =
  hrOrgReportingRelationshipRecordSchema
    .omit({
      companyId: true,
      createdAt: true,
      tenantId: true,
      updatedAt: true,
    })
    .strict();
export const hrOrgAuditEventProjectionSchema = hrOrgAuditEventSchema
  .omit({
    companyId: true,
    tenantId: true,
  })
  .strict();
export const hrOrgVacancyProjectionSchema = hrOrgVacancyRecordSchema.strict();
export const hrOrgHeadcountProjectionSchema =
  hrOrgHeadcountRecordSchema.strict();

export type HrOrgChartNodeProjection = z.infer<
  typeof hrOrgChartNodeProjectionSchema
>;
export type HrOrgOverviewProjection = z.infer<
  typeof hrOrgOverviewProjectionSchema
>;
export type HrOrgUnitProjection = z.infer<typeof hrOrgUnitProjectionSchema>;
export type HrOrgPositionProjection = z.infer<
  typeof hrOrgPositionProjectionSchema
>;
export type HrOrgReportingRelationshipProjection = z.infer<
  typeof hrOrgReportingRelationshipProjectionSchema
>;
export type HrOrgAuditEventProjection = z.infer<
  typeof hrOrgAuditEventProjectionSchema
>;
export type HrOrgVacancyProjection = z.infer<
  typeof hrOrgVacancyProjectionSchema
>;
export type HrOrgHeadcountProjection = z.infer<
  typeof hrOrgHeadcountProjectionSchema
>;
