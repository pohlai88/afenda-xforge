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
import {
  requireHrEmployeeSensitiveMutationAccess,
  requireHrRecordsWrite,
} from "./policy.ts";

type RecordsActionContext = {
  canWrite?: boolean;
  organizationId?: string;
  userId?: string;
};

export function createHrEmployeeRecordAction(
  input: HrRecordsCreateEmployeeInput,
  context: RecordsActionContext
): HrRecordsActionResult {
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsCreateEmployeeSchema.parse(input);
    const sensitiveAccess = requireHrEmployeeSensitiveMutationAccess(
      context,
      parsed
    );
    if (!sensitiveAccess.ok) {
      return sensitiveAccess;
    }
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
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsUpdateEmployeeSchema.parse(input);
    const sensitiveAccess = requireHrEmployeeSensitiveMutationAccess(
      context,
      parsed
    );
    if (!sensitiveAccess.ok) {
      return sensitiveAccess;
    }
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
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
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
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
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
  const writeAccess = requireHrRecordsWrite(context);
  if (!writeAccess.ok) {
    return writeAccess;
  }

  try {
    const parsed = hrRecordsRehireEmployeeSchema.parse(input);
    const sensitiveAccess = requireHrEmployeeSensitiveMutationAccess(
      context,
      parsed
    );
    if (!sensitiveAccess.ok) {
      return sensitiveAccess;
    }
    const record = hrRecordsStore.rehire(parsed, context);
    return record
      ? { ok: true, targetId: record.id }
      : { ok: false, error: "Record not found" };
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
