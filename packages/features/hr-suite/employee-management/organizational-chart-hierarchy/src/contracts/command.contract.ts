import { z } from "zod";
import {
  hrOrgReportingRelationshipTypeSchema,
  hrOrgStatusSchema,
  hrOrgUnitTypeSchema,
  optionalIsoDateSchema,
  optionalTrimmedStringSchema,
  trimmedStringSchema,
} from "../schema.ts";
import type {
  HrOrgReportingRelationshipType,
  HrOrgStatus,
  HrOrgUnitType,
} from "./domain.contract.ts";

export type UpsertHrOrgUnitCommandInput = {
  id?: string;
  companyId?: string;
  code: string;
  name: string;
  unitType: HrOrgUnitType;
  parentUnitId?: string | null;
  managerEmployeeId?: string | null;
  costCenterCode?: string | null;
  locationCode?: string | null;
  legalEntityCode?: string | null;
  status: HrOrgStatus;
  effectiveFrom?: Date | string | null;
  effectiveTo?: Date | string | null;
};

export type UpsertHrOrgPositionCommandInput = {
  id?: string;
  companyId?: string;
  code: string;
  title: string;
  organizationUnitId: string;
  managerEmployeeId?: string | null;
  costCenterCode?: string | null;
  locationCode?: string | null;
  status: HrOrgStatus;
  effectiveFrom?: Date | string | null;
  effectiveTo?: Date | string | null;
};

export type UpsertHrOrgReportingRelationshipCommandInput = {
  id?: string;
  companyId?: string;
  employeeId: string;
  managerEmployeeId: string;
  relationshipType: HrOrgReportingRelationshipType;
  effectiveFrom?: Date | string | null;
  effectiveTo?: Date | string | null;
  reason?: string | null;
};

export type HrOrgMutationResult =
  | { ok: true; targetId: string; message?: string }
  | { ok: false; error: string };

export const upsertHrOrgUnitInputSchema = z.object({
  id: optionalTrimmedStringSchema,
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
  effectiveFrom: optionalIsoDateSchema,
  effectiveTo: optionalIsoDateSchema,
});

export const upsertHrOrgPositionInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  code: trimmedStringSchema,
  title: trimmedStringSchema,
  organizationUnitId: trimmedStringSchema,
  managerEmployeeId: optionalTrimmedStringSchema,
  costCenterCode: optionalTrimmedStringSchema,
  locationCode: optionalTrimmedStringSchema,
  status: hrOrgStatusSchema,
  effectiveFrom: optionalIsoDateSchema,
  effectiveTo: optionalIsoDateSchema,
});

export const upsertHrOrgReportingRelationshipInputSchema = z.object({
  id: optionalTrimmedStringSchema,
  companyId: optionalTrimmedStringSchema,
  employeeId: trimmedStringSchema,
  managerEmployeeId: trimmedStringSchema,
  relationshipType: hrOrgReportingRelationshipTypeSchema,
  effectiveFrom: optionalIsoDateSchema,
  effectiveTo: optionalIsoDateSchema,
  reason: z.string().trim().nullable().optional(),
});
