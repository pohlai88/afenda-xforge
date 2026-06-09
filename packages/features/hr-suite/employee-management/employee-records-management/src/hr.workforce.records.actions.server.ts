import "server-only";

import type {
  HrRecordsActionResult,
  HrRecordsArchiveEmployeeInput,
  HrRecordsAssignmentInput,
  HrRecordsCreateEmployeeInput,
  HrRecordsRehireEmployeeInput,
  HrRecordsUpdateEmployeeInput,
} from "./hr.workforce.records.contract.ts";
import { hrRecordsAuditActions } from "./hr.workforce.records.event.ts";
import { hrRecordsStore } from "./hr.workforce.records.store.ts";
import { toRecordsActionFailure } from "./hr.workforce.records-action-result.shared.ts";
import {
  hrRecordsArchiveEmployeeSchema,
  hrRecordsAssignmentSchema,
  hrRecordsCreateEmployeeSchema,
  hrRecordsRehireEmployeeSchema,
  hrRecordsUpdateEmployeeSchema,
} from "./hr.workforce.records-form.shared.ts";

type RecordsActionContext = {
  canWrite?: boolean;
  organizationId?: string;
  userId?: string;
};

const denyWrite = (): HrRecordsActionResult => ({
  ok: false,
  error: "Write access denied for employee records",
});

export function createHrEmployeeRecordAction(
  input: HrRecordsCreateEmployeeInput,
  context: RecordsActionContext
): HrRecordsActionResult {
  if (!context.canWrite) {
    return denyWrite();
  }

  try {
    const parsed = hrRecordsCreateEmployeeSchema.parse(input);
    const record = hrRecordsStore.create(parsed, context);
    return { ok: true, targetId: record.id };
  } catch (error) {
    return toRecordsActionFailure(error);
  }
}

export function updateHrEmployeeRecordAction(
  input: HrRecordsUpdateEmployeeInput,
  context: RecordsActionContext
): HrRecordsActionResult {
  if (!context.canWrite) {
    return denyWrite();
  }

  try {
    const parsed = hrRecordsUpdateEmployeeSchema.parse(input);
    const record = hrRecordsStore.update(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
  } catch (error) {
    return toRecordsActionFailure(error);
  }
}

export function archiveHrEmployeeRecordAction(
  input: HrRecordsArchiveEmployeeInput,
  context: RecordsActionContext
): HrRecordsActionResult {
  if (!context.canWrite) {
    return denyWrite();
  }

  try {
    const parsed = hrRecordsArchiveEmployeeSchema.parse(input);
    const record = hrRecordsStore.archive(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
  } catch (error) {
    return toRecordsActionFailure(error);
  }
}

export function recordHrEmployeeAssignmentAction(
  input: HrRecordsAssignmentInput,
  context: RecordsActionContext
): HrRecordsActionResult {
  if (!context.canWrite) {
    return denyWrite();
  }

  try {
    const parsed = hrRecordsAssignmentSchema.parse(input);
    const record = hrRecordsStore.assign(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
  } catch (error) {
    return toRecordsActionFailure(error);
  }
}

export function rehireHrEmployeeAction(
  input: HrRecordsRehireEmployeeInput,
  context: RecordsActionContext
): HrRecordsActionResult {
  if (!context.canWrite) {
    return denyWrite();
  }

  try {
    const parsed = hrRecordsRehireEmployeeSchema.parse(input);
    const record = hrRecordsStore.rehire(parsed, context);
    return { ok: true, targetId: record.id };
  } catch (error) {
    return toRecordsActionFailure(error);
  }
}

export const hrRecordsAuditActionByMutation = {
  create: hrRecordsAuditActions.employee.created,
  update: hrRecordsAuditActions.employee.updated,
  archive: hrRecordsAuditActions.employee.archived,
  assignment: hrRecordsAuditActions.assignment.recorded,
  rehire: hrRecordsAuditActions.employee.rehired,
} as const;
