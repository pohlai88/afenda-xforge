import { z } from "zod";
import type {
  UpsertHrOrgPositionCommandInput,
  UpsertHrOrgReportingRelationshipCommandInput,
  UpsertHrOrgUnitCommandInput,
} from "../contracts/command.contract.ts";
import { upsertHrOrgReportingRelationshipInputSchema } from "../contracts/command.contract.ts";
import {
  hrOrgStatusSchema,
  hrOrgUnitTypeSchema,
  optionalIsoDateSchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "../schema.ts";

export function readOptionalOrgFormField(
  formData: FormData,
  key: string
): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const legacyHrOrgUnitFormSchema = z
  .object({
    id: optionalTrimmedStringSchema,
    code: trimmedStringSchema,
    name: trimmedStringSchema,
    unitType: hrOrgUnitTypeSchema,
    parentUnitId: optionalTrimmedStringSchema,
    parentDepartmentId: optionalTrimmedStringSchema,
    managerEmployeeId: optionalTrimmedStringSchema,
    costCenterCode: optionalTrimmedStringSchema,
    locationCode: optionalTrimmedStringSchema,
    legalEntityCode: optionalTrimmedStringSchema,
    status: hrOrgStatusSchema.optional(),
    orgUnitStatus: hrOrgStatusSchema.optional(),
    effectiveFrom: optionalIsoDateSchema,
    effectiveTo: optionalIsoDateSchema,
  })
  .transform((input) => ({
    id: input.id ?? undefined,
    companyId: undefined,
    code: input.code,
    name: input.name,
    unitType: input.unitType,
    parentUnitId: input.parentUnitId ?? input.parentDepartmentId,
    managerEmployeeId: input.managerEmployeeId ?? undefined,
    costCenterCode: input.costCenterCode ?? undefined,
    locationCode: input.locationCode ?? undefined,
    legalEntityCode: input.legalEntityCode ?? undefined,
    status: input.status ?? input.orgUnitStatus,
    effectiveFrom: input.effectiveFrom ?? undefined,
    effectiveTo: input.effectiveTo ?? undefined,
  }));

const legacyHrOrgPositionFormSchema = z
  .object({
    id: optionalTrimmedStringSchema,
    code: trimmedStringSchema,
    title: trimmedStringSchema,
    organizationUnitId: optionalTrimmedStringSchema,
    departmentId: optionalTrimmedStringSchema,
    managerEmployeeId: optionalTrimmedStringSchema,
    costCenterCode: optionalTrimmedStringSchema,
    locationCode: optionalTrimmedStringSchema,
    status: hrOrgStatusSchema.optional(),
    positionStatus: hrOrgStatusSchema.optional(),
    effectiveFrom: optionalIsoDateSchema,
    effectiveTo: optionalIsoDateSchema,
  })
  .transform((input) => ({
    id: input.id ?? undefined,
    companyId: undefined,
    code: input.code,
    title: input.title,
    organizationUnitId: input.organizationUnitId ?? input.departmentId,
    managerEmployeeId: input.managerEmployeeId ?? undefined,
    costCenterCode: input.costCenterCode ?? undefined,
    locationCode: input.locationCode ?? undefined,
    status: input.status ?? input.positionStatus,
    effectiveFrom: input.effectiveFrom ?? undefined,
    effectiveTo: input.effectiveTo ?? undefined,
  }));

export const hrOrgUnitSchema: z.ZodType<UpsertHrOrgUnitCommandInput> =
  legacyHrOrgUnitFormSchema as z.ZodType<UpsertHrOrgUnitCommandInput>;
export const hrOrgPositionSchema: z.ZodType<UpsertHrOrgPositionCommandInput> =
  legacyHrOrgPositionFormSchema as z.ZodType<UpsertHrOrgPositionCommandInput>;
export const hrOrgReportingRelationshipSchema: z.ZodType<UpsertHrOrgReportingRelationshipCommandInput> =
  upsertHrOrgReportingRelationshipInputSchema as z.ZodType<UpsertHrOrgReportingRelationshipCommandInput>;
