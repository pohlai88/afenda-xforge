import "server-only";

import {
  upsertHrOrgPositionInputSchema,
  upsertHrOrgReportingRelationshipInputSchema,
  upsertHrOrgUnitInputSchema,
} from "./contracts/command.contract.ts";
import type { HrOrgActionResult } from "./contracts/org-model.contract.ts";
import { toOrgActionFailure } from "./execution/action-result.ts";
import { hrOrgAuditActions } from "./execution/event.ts";
import {
  hrOrgPositionSchema,
  hrOrgReportingRelationshipSchema,
  hrOrgUnitSchema,
  readOptionalOrgFormField,
} from "./shared/form.shared.ts";
import { hrOrgStore } from "./store.ts";

function readOrgFormField(
  formData: FormData,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = readOptionalOrgFormField(formData, key);
    if (value !== undefined) {
      return value;
    }
  }

  return;
}

export function upsertHrOrgUnitAction(
  _previous: unknown,
  formData: FormData
): HrOrgActionResult {
  const parsed = hrOrgUnitSchema.safeParse({
    id: readOptionalOrgFormField(formData, "id"),
    code: readOptionalOrgFormField(formData, "code"),
    name: readOptionalOrgFormField(formData, "name"),
    unitType: readOptionalOrgFormField(formData, "unitType"),
    parentUnitId: readOrgFormField(
      formData,
      "parentUnitId",
      "parentDepartmentId"
    ),
    managerEmployeeId: readOrgFormField(formData, "managerEmployeeId"),
    costCenterCode: readOrgFormField(formData, "costCenterCode"),
    locationCode: readOrgFormField(formData, "locationCode"),
    legalEntityCode: readOrgFormField(formData, "legalEntityCode"),
    status: readOrgFormField(formData, "status", "orgUnitStatus"),
    effectiveFrom: readOrgFormField(formData, "effectiveFrom"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }

  try {
    const input = upsertHrOrgUnitInputSchema.parse(parsed.data);
    const node = hrOrgStore.upsertUnit({
      id: input.id ?? undefined,
      code: input.code,
      name: input.name,
      unitType: input.unitType,
      parentUnitId: input.parentUnitId,
      managerEmployeeId: input.managerEmployeeId,
      costCenterCode: input.costCenterCode,
      locationCode: input.locationCode,
      legalEntityCode: input.legalEntityCode,
      status: input.status,
      effectiveFrom: input.effectiveFrom,
    });
    return {
      ok: true,
      targetId: node.id,
      message: hrOrgAuditActions.unit.created,
    };
  } catch (error) {
    return toOrgActionFailure(error);
  }
}

export function upsertHrOrgPositionAction(
  _previous: unknown,
  formData: FormData
): HrOrgActionResult {
  const parsed = hrOrgPositionSchema.safeParse({
    id: readOptionalOrgFormField(formData, "id"),
    code: readOptionalOrgFormField(formData, "code"),
    title: readOptionalOrgFormField(formData, "title"),
    organizationUnitId: readOrgFormField(
      formData,
      "organizationUnitId",
      "departmentId"
    ),
    managerEmployeeId: readOrgFormField(formData, "managerEmployeeId"),
    costCenterCode: readOrgFormField(formData, "costCenterCode"),
    locationCode: readOrgFormField(formData, "locationCode"),
    status: readOrgFormField(formData, "status", "positionStatus"),
    effectiveFrom: readOrgFormField(formData, "effectiveFrom"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }

  try {
    const input = upsertHrOrgPositionInputSchema.parse(parsed.data);
    const node = hrOrgStore.upsertPosition({
      id: input.id ?? undefined,
      code: input.code,
      title: input.title,
      organizationUnitId: input.organizationUnitId,
      managerEmployeeId: input.managerEmployeeId,
      costCenterCode: input.costCenterCode,
      locationCode: input.locationCode,
      status: input.status,
      effectiveFrom: input.effectiveFrom,
    });
    return {
      ok: true,
      targetId: node.id,
      message: hrOrgAuditActions.position.created,
    };
  } catch (error) {
    return toOrgActionFailure(error);
  }
}

export function upsertHrOrgReportingRelationshipAction(
  _previous: unknown,
  formData: FormData
): HrOrgActionResult {
  const parsed = hrOrgReportingRelationshipSchema.safeParse({
    id: readOptionalOrgFormField(formData, "id"),
    employeeId: readOrgFormField(formData, "employeeId"),
    managerEmployeeId: readOrgFormField(formData, "managerEmployeeId"),
    relationshipType: readOrgFormField(formData, "relationshipType"),
    effectiveFrom: readOrgFormField(formData, "effectiveFrom"),
    reason: readOrgFormField(formData, "reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }

  try {
    const input = upsertHrOrgReportingRelationshipInputSchema.parse(
      parsed.data
    );
    const node = hrOrgStore.upsertReportingLine({
      id: input.id ?? undefined,
      employeeId: input.employeeId,
      managerEmployeeId: input.managerEmployeeId,
      relationshipType: input.relationshipType,
      effectiveFrom: input.effectiveFrom,
      reason: input.reason,
    });
    return {
      ok: true,
      targetId: node.id,
      message: hrOrgAuditActions.reportingLine.recorded,
    };
  } catch (error) {
    return toOrgActionFailure(error);
  }
}
