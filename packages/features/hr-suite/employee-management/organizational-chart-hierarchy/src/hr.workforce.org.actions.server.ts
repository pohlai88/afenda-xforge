import "server-only";

import type { HrOrgActionResult } from "./hr.workforce.org.contract.ts";
import { hrOrgAuditActions } from "./hr.workforce.org.event.ts";
import { hrOrgStore } from "./hr.workforce.org.store.ts";
import { toOrgActionFailure } from "./hr.workforce.org-action-result.shared.ts";
import {
  hrOrgPositionSchema,
  hrOrgReportingRelationshipSchema,
  hrOrgUnitSchema,
  readOptionalOrgFormField,
} from "./hr.workforce.org-form.shared.ts";

export function upsertHrOrgUnitAction(
  _previous: unknown,
  formData: FormData
): HrOrgActionResult {
  const parsed = hrOrgUnitSchema.safeParse({
    id: readOptionalOrgFormField(formData, "id"),
    code: readOptionalOrgFormField(formData, "code"),
    name: readOptionalOrgFormField(formData, "name"),
    unitType: readOptionalOrgFormField(formData, "unitType"),
    parentDepartmentId: readOptionalOrgFormField(
      formData,
      "parentDepartmentId"
    ),
    managerEmployeeId: readOptionalOrgFormField(formData, "managerEmployeeId"),
    costCenterCode: readOptionalOrgFormField(formData, "costCenterCode"),
    locationCode: readOptionalOrgFormField(formData, "locationCode"),
    legalEntityCode: readOptionalOrgFormField(formData, "legalEntityCode"),
    orgUnitStatus: readOptionalOrgFormField(formData, "orgUnitStatus"),
    effectiveFrom: readOptionalOrgFormField(formData, "effectiveFrom"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }

  try {
    const node = hrOrgStore.upsertUnit(parsed.data);
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
    departmentId: readOptionalOrgFormField(formData, "departmentId"),
    managerEmployeeId: readOptionalOrgFormField(formData, "managerEmployeeId"),
    costCenterCode: readOptionalOrgFormField(formData, "costCenterCode"),
    locationCode: readOptionalOrgFormField(formData, "locationCode"),
    positionStatus: readOptionalOrgFormField(formData, "positionStatus"),
    effectiveFrom: readOptionalOrgFormField(formData, "effectiveFrom"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }

  try {
    const node = hrOrgStore.upsertPosition(parsed.data);
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
    employeeId: readOptionalOrgFormField(formData, "employeeId"),
    managerEmployeeId: readOptionalOrgFormField(formData, "managerEmployeeId"),
    relationshipType: readOptionalOrgFormField(formData, "relationshipType"),
    effectiveFrom: readOptionalOrgFormField(formData, "effectiveFrom"),
    reason: readOptionalOrgFormField(formData, "reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }

  try {
    const node = hrOrgStore.upsertReportingLine(parsed.data);
    return {
      ok: true,
      targetId: node.id,
      message: hrOrgAuditActions.reportingLine.recorded,
    };
  } catch (error) {
    return toOrgActionFailure(error);
  }
}
