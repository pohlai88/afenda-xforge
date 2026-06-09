import { z } from "zod";
import {
  hrOrgStatusSchema,
  hrOrgUnitTypeSchema,
} from "./hr.workforce.org.contract.ts";

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

export const hrOrgUnitSchema = z.object({
  id: z.string().trim().optional(),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  unitType: hrOrgUnitTypeSchema,
  parentDepartmentId: z.string().trim().optional(),
  managerEmployeeId: z.string().trim().optional(),
  costCenterCode: z.string().trim().optional(),
  locationCode: z.string().trim().optional(),
  legalEntityCode: z.string().trim().optional(),
  orgUnitStatus: hrOrgStatusSchema,
  effectiveFrom: z.string().trim().optional(),
});

export const hrOrgPositionSchema = z.object({
  id: z.string().trim().optional(),
  code: z.string().trim().min(1),
  title: z.string().trim().min(1),
  departmentId: z.string().trim(),
  managerEmployeeId: z.string().trim().optional(),
  costCenterCode: z.string().trim().optional(),
  locationCode: z.string().trim().optional(),
  positionStatus: hrOrgStatusSchema,
  effectiveFrom: z.string().trim().optional(),
});

export const hrOrgReportingRelationshipSchema = z.object({
  id: z.string().trim().optional(),
  employeeId: z.string().trim().min(1),
  managerEmployeeId: z.string().trim().min(1),
  relationshipType: z.string().trim().min(1),
  effectiveFrom: z.string().trim().optional(),
  reason: z.string().trim().optional(),
});
